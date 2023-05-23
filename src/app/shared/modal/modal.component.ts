import {
	Component,
	Input,
	ElementRef,
	OnInit,
	OnDestroy
} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.css'],
	// providers: [ModalService]
})
export class ModalComponent implements OnInit, OnDestroy {

	@Input() modalId = '';

	/* ElementRef wraps around and gives access to the host (topmost) element of the
		component through its nativeElement property */
	constructor(public modal: ModalService, public elemRef: ElementRef) {

		// console.log('elemRef:', this.elemRef);
	}

	ngOnInit() {
		/* append the host element to the document's body so CSS styling doesn't
			interfere with it */
		document.body.appendChild(this.elemRef.nativeElement);
	}

	ngOnDestroy() {
		/* because the host element was "teleported" to the document's body, it
			must be removed manually because Angular no longer has control over it */
		document.body.removeChild(this.elemRef.nativeElement);
	}

	closeModal() {
		this.modal.toggleModal(this.modalId);
	}
}