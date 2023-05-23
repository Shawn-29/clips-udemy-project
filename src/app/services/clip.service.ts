import { Injectable, inject } from '@angular/core';

import {
	AngularFirestore,

	/* for type-checking what data can be stored in the database for each clip */
	AngularFirestoreCollection,

	DocumentReference,

	QuerySnapshot
} from '@angular/fire/compat/firestore';

/* for getting the user's id from Firebase */
import { AngularFireAuth } from '@angular/fire/compat/auth';

/* for getting a reference object to a Firebase document */
import { AngularFireStorage } from '@angular/fire/compat/storage';

import {
	Resolve,
	Router,
	/* contains information about the current route */
	ActivatedRouteSnapshot,
	/* contains the current tree representation of our routes */
	RouterStateSnapshot,
	ResolveFn
} from '@angular/router';

import {
	switchMap,
	of,
	map,
	BehaviorSubject,
	combineLatest,
	lastValueFrom
} from 'rxjs';

import IClip from '../models/clip.model';

@Injectable({
	providedIn: 'root'
})
export class ClipService {

	clipsCollection: AngularFirestoreCollection<IClip>

	pageClips: IClip[] = [];

	isPendingRequest = false;

	constructor(
		private db: AngularFirestore,
		private auth: AngularFireAuth,
		private storage: AngularFireStorage,
		private router: Router
	) {
		/* get a reference to the clips collection; Firebase will create
			it if it doesn't exist; collection is similar to a SQL table */
		this.clipsCollection = this.db.collection('clips');
	}

	createClip(data: IClip): Promise<DocumentReference<IClip>> {
		/* add method inserts a document into the database, with Firebase
			automatically generating an id */
		return this.clipsCollection.add(data);
	}

	getUserClips(sort$: BehaviorSubject<string>) {

		return combineLatest([
			this.auth.user,
			sort$
		]).pipe(
			switchMap(values => {
				const [user, sort] = values;

				if (!user) {
					return of([]);
				}

				/* get a reference to the clips collection; a reference is
					an object with methods for communicating with the database */
				const query = this.clipsCollection.ref.where(
					'uid', '==', user.uid
				).orderBy(
					'timestamp',
					sort === '1' ? 'desc' : 'asc'
				);

				/* returns a promise that resolves with a snapshot of the data
					retrieved from the database */
				return query.get();
			}),
			map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
		)
	}

	updateClip(id: string, title: string) {

		/* get a promise that resolves to a clip document based on a givn id */
		return this.clipsCollection.doc(id)
			.update({
				title
			});
	}

	async deleteClip(clip: IClip) {
		/* get a reference object to a Firebase document for deletion */
		const clipRef = this.storage.ref(`clips/${clip.fileName}`);

		const screenshotRef = this.storage.ref(
			`screenshots/${clip.screenshotFilename}`
		);

		/* delete the video file from Firebase */
		await clipRef.delete();

		/* delete the screen shot from Firebase */
		await screenshotRef.delete();

		await this.clipsCollection.doc(clip.docId).delete();
	}

	async getClips() {

		/* stop multiple requests from running */
		if (this.isPendingRequest) {
			return;
		}

		this.isPendingRequest = true;

		let query = this.clipsCollection.ref
			.orderBy('timestamp', 'desc')
			.limit(6);

		const { length } = this.pageClips;

		if (length) {
			/* get the id of the last clip so when we query for more clips,
				we can use this clip as an offset */
			const lastDocId = this.pageClips[length - 1].docId;

			const lastDoc = await lastValueFrom(
				this.clipsCollection
					/* get a document reference */
					.doc(lastDocId)
					/* get a document snapshot from the reference */
					.get()
			);

			/* get more documents starting after the last one we retrieved */
			query = query.startAfter(lastDoc);
		}

		const snapshot = await query.get();

		/* append clips from the latest query to our clips collection */
		snapshot.forEach(doc => {
			this.pageClips.push({
				docId: doc.id,
				...doc.data()
			})
		})

		this.isPendingRequest = false;
	}

	getClipFromRouteId(id: string) {
		return this.clipsCollection.doc(id)
		.get()
		.pipe(
			map(snapshot => {
				const data = snapshot.data();

				if (!data) {
					this.router.navigate(['/']);
					return null;
				}

				return data;
			})
		)
	}
}

export const ClipResolver: ResolveFn<IClip | null> =
	(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

		return inject(ClipService).getClipFromRouteId(route.params.id);
	};