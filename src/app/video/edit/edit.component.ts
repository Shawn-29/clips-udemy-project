import {
	Component,
	OnInit,
	OnDestroy,
	OnChanges,
	Input,
	Output,
	EventEmitter
} from '@angular/core';

import {
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

import { ModalService } from 'src/app/services/modal.service';

import { ClipService } from 'src/app/services/clip.service';

import IClip from 'src/app/models/clip.model';

@Component({
	selector: 'app-edit',
	templateUrl: './edit.component.html',
	styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

	constructor(
		private modal: ModalService,
		private clipService: ClipService
	) { }

	@Input() activeClip: IClip | null = null;

	@Output() updateEmitter = new EventEmitter<IClip>();

	inSubmission = false;

	/* alert stuff */
	showAlert = false;
	alertColor = 'blue';
	alertMsg = 'Please wait! Updating clip.';

	clipId = new FormControl('', {
		nonNullable: true
	})

	title = new FormControl('', {
		validators: [
			Validators.required,
			Validators.minLength(3)
		],
		nonNullable: true
	});

	editForm = new FormGroup({
		title: this.title,
		clipId: this.clipId
	});

	ngOnChanges() {
		/* if no clip is active, don't update the form controls */
		if (!this.activeClip) {
			return;
		}

		this.inSubmission = false;
		this.showAlert = false;

		this.clipId.setValue(this.activeClip.docId || '');
		this.title.setValue(this.activeClip.title);
	}

	ngOnInit() {
		this.modal.register('editClip');
	}

	ngOnDestroy() {
		this.modal.unregister('editClip');
	}

	async submit() {

		if (!this.activeClip) {
			return;
		}

		this.inSubmission = true;

		/* reset the form in case of resubmissions */
		this.showAlert = true;
		this.alertColor = 'blue';
		this.alertMsg = 'Please wait! Updating clip.';

		try {
			await this.clipService.updateClip(this.clipId.value, this.title.value);
		} catch (error) {
			this.inSubmission = false;
			this.alertColor = 'red';
			this.alertMsg = 'Something went wrong. Try again later.';
			
			return;
		}

		this.inSubmission = false;

		this.alertColor = 'green';
		this.alertMsg = 'Success!';

		this.activeClip.title = this.title.value;

		/* inform the parent component of the clip's update */
		this.updateEmitter.emit(this.activeClip);
	}
}