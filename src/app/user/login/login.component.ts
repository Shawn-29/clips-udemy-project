import { Component } from '@angular/core';

/* for working with Firebase authentication */
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {

	/* alert stuff */
	showAlert = false;
	alertMsg = 'Please wait while you are being logged in.';
	alertColor = 'blue';

	inSubmission = false;

	credentials = {
		email: '',
		password: ''
	}

	constructor(private auth: AngularFireAuth) { }

	async login() {
		
		/* reset alert stuff */
		this.showAlert = true;
		this.alertMsg = 'Please wait while we log you in to your account.';
		this.alertColor = 'blue';

		this.inSubmission = true;
		
		try {
			await this.auth.signInWithEmailAndPassword(
				this.credentials.email, this.credentials.password
			);
		} catch (error) {
			console.error('error:', error);

			this.alertMsg = 'An unexpected error occurred. Please try again later.';
			this.alertColor = 'red';

			this.inSubmission = false;

			return;
		}

		this.alertMsg = 'You\'ve been logged in!';
		this.alertColor = 'green';
	}
}