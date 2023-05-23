import { Component } from '@angular/core';
import {
	FormGroup,
	FormControl,
	Validators
} from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';

import { RegisterValidators } from '../validators/register-validators';

/* for determining if an email has already been taken */
import { EmailTaken } from '../validators/email-taken';

import IUser from 'src/app/models/user.model';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent {

	/* alert stuff */
	showAlert = false;
	alertMsg = 'Please wait! Your account is being created.';
	alertColor = 'blue';

	name = new FormControl('', [
		Validators.required,
		Validators.minLength(3)
	]);

	/* second argument is for synchronous validators;
		third argument is for asynchronous validators;
		synchronous validators are called first, improving performance
		as asynchronous validators might be doing network requests */
	email = new FormControl('', [
		Validators.required,
		Validators.email
	], [this.emailTaken.validate]);

	age = new FormControl<number | null>(null, [
		Validators.required,
		Validators.min(18),
		Validators.max(120)
	]);
	password = new FormControl('', [
		Validators.required,
		Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
	]);
	confirmPassword = new FormControl('', [
		Validators.required
	]);
	phoneNumber = new FormControl('', [
		Validators.required,
		Validators.minLength(13),
		Validators.maxLength(13)
	]);

	registerForm = new FormGroup({
		name: this.name,
		email: this.email,
		age: this.age,
		password: this.password,
		confirmPassword: this.confirmPassword,
		phoneNumber: this.phoneNumber
	},
		/* pass in the names of the fields our custom matching validator
			will validate */
		[RegisterValidators.match('password', 'confirmPassword')]
	);

	/* flag to prevent double form submission clicks */
	inSubmission = false;

	// registerForm = new FormGroup({
	// 	name: new FormControl('', [
	// 		Validators.required,
	// 		Validators.minLength(3)
	// 	]),
	// 	email: new FormControl(''),
	// 	age: new FormControl(''),
	// 	password: new FormControl(''),
	// 	confirmPassword: new FormControl(''),
	// 	phoneNumber: new FormControl('')
	// });

	constructor(
		private auth: AuthService,
		private emailTaken: EmailTaken
	) { }

	/* handles form sumbission */
	async register() {
		this.showAlert = true;
		this.alertMsg = 'Please wait! Your account is being created.';
		this.alertColor = 'blue';

		this.inSubmission = true;

		try {
			await this.auth.createUser(this.registerForm.value as IUser);
		} catch (error) {
			console.error('error:', error);

			this.alertMsg = 'An unexpected error occurred. Please try again later.';
			this.alertColor = 'red';

			this.inSubmission = false;

			return;
		}

		this.alertMsg = 'Success! Your account has been created!';
		this.alertColor = 'green';
	}
}