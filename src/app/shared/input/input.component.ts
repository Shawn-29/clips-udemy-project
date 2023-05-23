import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'app-input',
	templateUrl: './input.component.html',
	styleUrls: ['./input.component.css']
})
export class InputComponent {

	@Input() control = new FormControl();
	@Input() type = 'text';
	@Input() placeholder = '';

	/* used with ngx-mask package; as long as the input mask
		is an empty string, input masking won't be applied */
	@Input() inputMask = '';
}