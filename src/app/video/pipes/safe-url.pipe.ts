import { Pipe, PipeTransform } from '@angular/core';

/* for bypassing Angular's sanitization */
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'safeURL'
})
export class SafeURLPipe implements PipeTransform {

	constructor(private sanitizer: DomSanitizer) { }

	transform(value: string) {
		return this.sanitizer.bypassSecurityTrustUrl(value);
	}

}