import { Component, OnDestroy } from '@angular/core';
import {
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

import {
	switchMap,
	tap,
	combineLatest,
	forkJoin
} from 'rxjs';

import {
	/* for working with Firebase cloud storage */
	AngularFireStorage,

	/* for working with uploads */
	AngularFireUploadTask
} from '@angular/fire/compat/storage';

/* for getting data about the authenticated user */
import { AngularFireAuth } from '@angular/fire/compat/auth';

/* for using the firebase.User interface */
import firebase from 'firebase/compat/app';

/* for generating a unique identifiers to avoid conflicting filenames */
import { v4 as uuid } from 'uuid';

/* for redirecting the user after a file has been uploaded */
import { Router } from '@angular/router';

import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';

/* image manipulation */
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
	selector: 'app-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

	isDragover = false;

	file: File | null = null;

	nextStep = false;

	uploadTask?: AngularFireUploadTask;

	/* alert stuff */
	isAlertVisible = false;
	alertColor = 'blue';
	alertMsg = 'Please wait! Your clip is being uploaded.';

	inSubmission = false;

	/* screenshot stuff */
	screenshots: string[] = [];
	selectedScreenshot = '';
	screenshotTask?: AngularFireUploadTask;

	/* upload percentage stuff */
	uploadPercentage = 0;
	showPercentage = false;

	user: firebase.User | null = null;

	title = new FormControl('', {
		validators: [
			Validators.required,
			Validators.minLength(3)
		],
		/* if this isn't set, Angular allows forms to have no value (null) */
		nonNullable: true
	});

	uploadForm = new FormGroup({
		title: this.title
	});

	constructor(
		private storage: AngularFireStorage,
		private auth: AngularFireAuth,
		private clipsService: ClipService,
		private router: Router,
		public ffmpegService: FfmpegService
	) {
		auth.user.subscribe(user => {
			this.user = user;
		});

		/* ffmpeg is a large file; initialize it as soon as possible */
		this.ffmpegService.init();
	}

	ngOnDestroy() {
		/* cease upload Firebase upload task */
		this.uploadTask?.cancel();
	}

	/* store a video file when it is dragged onto the app */
	async storeFile($event: Event) {

		// console.log('storeFile $event:', $event);

		if (this.ffmpegService.isRunning) {
			return;
		}

		this.isDragover = false;

		/* get the file that was dragged onto the form; dataTransfer property
			is created when a drag event occurs */
		const dataTransfer = ($event as DragEvent).dataTransfer;
		if (dataTransfer) {
			this.file = dataTransfer.files.item(0);
		}
		/* file wasn't dragged onto the form; store the file from a input element of type file */
		else {
			this.file = ($event.target as HTMLInputElement).files?.item(0) ?? null;
		}

		/* perform client-side file validation */
		if (!this.file || this.file.type !== 'video/mp4') {
			return;
		}

		this.screenshots = await this.ffmpegService.getScreenshots(this.file);

		this.selectedScreenshot = this.screenshots[0];

		/* update the form's title based on the name of the
			uploaded video but with the extension removed */
		this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));

		this.nextStep = true;

		// console.log('this.file:', this.file);
	}

	async uploadFile() {

		/* disable the form before uploading a file so once the upload
			process begins, no more form changes can be made */
		this.uploadForm.disable();

		this.isAlertVisible = true;
		this.alertColor = 'blue';
		this.alertMsg = 'Please wait! Your clip is being uploaded.';

		this.inSubmission = true;

		this.showPercentage = true;

		/* get a unique random id */
		const clipFilename = uuid();

		/* if a directory doesn't exist, Firebase will create it */
		const clipPath = `clips/${clipFilename}.mp4`;

		const screenshotBlob = await this.ffmpegService.blobFromURL(
			this.selectedScreenshot
		);
		const screenshotPath = `screenshots/${clipFilename}.png`;
		this.storage.upload(screenshotPath, screenshotBlob);

		/* upload the file to Firebase */
		this.screenshotTask = this.uploadTask = this.storage.upload(clipPath, this.file);

		/* get a reference to a video file stored in Firebase */
		const clipRef = this.storage.ref(clipPath);

		/* get a reference to a screen shot stored in Firebase */
		const screenshotRef = this.storage.ref(screenshotPath);

		/* percentageChanges returns an Observable that periodically pushes
			the percentage complete of an upload process */
		combineLatest([
			this.uploadTask.percentageChanges(),
			this.screenshotTask.percentageChanges()
		]).subscribe(progress => {

			/* get the upload progress for both a clip and screensho */
			const [clipProgress, screenshotProgress] = progress;

			if (!clipProgress || !screenshotProgress) {
				return;
			}

			const total = clipProgress + screenshotProgress;

			this.uploadPercentage = total / 200;
		});

		forkJoin([
			/* snapshotChanges will return an Observable that pushes the
				current state of the upload */
			this.uploadTask.snapshotChanges(),
			this.screenshotTask.snapshotChanges()
		]).pipe(
			/* debug: display the current upload status such as bytes being transferred */
			// tap(value => {
			// 	console.log('tap value:', value);
			// }),
			/* get the public URL of the video and screenshot files from
				Firebase; switchMap subscribes to an Observable within a pipeline */
			switchMap((() => {
				return forkJoin([
					clipRef.getDownloadURL(),
					screenshotRef.getDownloadURL()
				]);
			}))
		).subscribe(({
			/* if the upload succeeded */
			next: async (publicURLs) => {

				const [clipURL, screenshotURL] = publicURLs;

				const clipData: IClip = {
					uid: this.user?.uid as string,
					displayName: this.user?.displayName as string,
					title: this.title.value,
					fileName: `${clipFilename}.mp4`,
					url: clipURL,
					screenshotURL,
					screenshotFilename: `${clipFilename}.png`,
					/* return a timestamp from the server's time zone */
					timestamp: firebase.firestore.FieldValue.serverTimestamp()
				};

				/* createClip resolves with a document reference object that
					allows us to get the document's id within the database */
				const clipDocRef = await this.clipsService.createClip(clipData);

				this.alertColor = 'green';
				this.alertMsg = 'Success! Your clip is now ready to share with the world.';

				this.showPercentage = false;

				setTimeout(() => {
					/* navigate the user to a page displaying the uploaded video;
						the URL is based on the clip's document id */
					this.router.navigate([
						'clip', clipDocRef.id
					])
				}, 1000);
			},
			/* if the upload failed */
			error: (error) => {

				/* enable the form so the user can try to upload again */
				this.uploadForm.enable();

				this.alertColor = 'red';
				this.alertMsg = 'Upload failed! Please try again later.';

				this.inSubmission = true;

				this.showPercentage = false;
			}
		}));
	}
}