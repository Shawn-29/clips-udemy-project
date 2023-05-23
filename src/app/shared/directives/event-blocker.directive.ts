import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[app-event-blocker]'
})
export class SpudDirective {

	@HostListener('drop', ['$event'])
	@HostListener('dragover', ['$event'])
	handleEvents($event: Event) {
		$event.preventDefault();
		$event.stopPropagation();
	}
}