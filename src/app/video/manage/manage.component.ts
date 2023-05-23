import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';

import { ClipService } from 'src/app/services/clip.service';

import { ModalService } from 'src/app/services/modal.service';

import { BehaviorSubject } from 'rxjs';

import IClip from 'src/app/models/clip.model';

@Component({
	selector: 'app-manage',
	templateUrl: './manage.component.html',
	styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

	clips: IClip[] = [];

	currentClip: IClip | null = null;

	videoOrder = '1';

	sort$: BehaviorSubject<string>;

	constructor(
		private router: Router,
		private actRoute: ActivatedRoute,
		private clipService: ClipService,
		private modal: ModalService
	) {
		this.sort$ = new BehaviorSubject(this.videoOrder);
		// this.sort$.subscribe(value => console.log('sort$:', value));
		this.sort$.next('test');
	}

	ngOnInit() {
		/* queryParams method returns an Observable that will push values
			whenever the route's query parameters change */
		this.actRoute.queryParams.subscribe((queryParams: Params) => {

			/* change the sort order based on the query params value */
			this.videoOrder = queryParams.sort ? '2' : '1';

			/* push the new sort order to subscribers */
			this.sort$.next(this.videoOrder);
		});

		this.clipService.getUserClips(this.sort$)
			.subscribe(docs => {

				this.clips = [];

				docs.forEach(doc => {
					/* note that the doc's id is not returned by the data method so we
						must add it manually */
					this.clips.push({
						docId: doc.id,
						...doc.data()
					})
				})
			});
	}

	sort(event: Event) {
		const { value } = event.target as HTMLSelectElement;

		/* append the sort query params to the URL */
		// this.router.navigateByUrl(`/manage?sort=${value}`);

		/* append the sort query params to the URL, first parameter
			is an array of URL fragments to join to create a URL */
		this.router.navigate([], {
			relativeTo: this.actRoute,
			queryParams: {
				sort: value
			}
		});
	}

	/* opens a modal so the user can edit a clip */
	openModal($event: Event, clip: IClip) {
		$event.preventDefault();

		this.currentClip = clip;

		this.modal.toggleModal('editClip');
	}

	update($event: IClip) {
		this.clips.forEach((clip, index) => {
			if (clip.docId === $event.docId) {
				this.clips[index].title = $event.title;
			}
		});
	}

	deleteClip($event: Event, clip: IClip) {
		$event.preventDefault();

		this.clipService.deleteClip(clip);

		/* filter out the clip we want deleted */
		this.clips = this.clips.filter(element => {
			return element.docId !== clip.docId;
		});
	}

	async copyToClipboard($event: MouseEvent, docId: string | undefined) {

		$event.preventDefault();

		if (!docId) {
			return;
		}

		const url = `${location.origin}/clip/${docId}`;

		await navigator.clipboard.writeText(url);

		alert('Link Copied!');
	}
}