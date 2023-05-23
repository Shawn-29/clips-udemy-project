import { Injectable } from '@angular/core';

interface IModal {
	id: string,
	isVisible: boolean
}

@Injectable({
	providedIn: 'root'
})
export class ModalService {

	/* array to hold modal status for each modal */
	private modals: IModal[] = [];

	constructor() { }

	register(id: string) {
		this.modals.push({
			id,
			/* hide modals by default */
			isVisible: false
		});
	}

	unregister(id: string) {
		this.modals = this.modals.filter(element => {
			return element.id !== id;
		});
	}

	isModalOpen(id: string) : boolean {
		return !!this.modals.find((element) => {
			return element.id === id;
		})?.isVisible;
	}

	toggleModal(id: string) {
		const modal = this.modals.find((element) => {
			return element.id === id;
		});

		if (modal) {
			modal.isVisible = !modal.isVisible
		}
	}
}
