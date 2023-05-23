import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

/*
	The purpose of the below code segment is to load Firebase before loading
	Angular. This is so rendering dependent on some Firebase value, such as
	menus depending on user login status, can be applied as quickly as possible.
*/

import firebase from 'firebase/compat/app';

/* Firebase authentication package;  */
import 'firebase/compat/auth';

import { environment } from './environments/environment';

/* connect the app to Firebase and automatically check if the user
	is logged in */
firebase.initializeApp(environment.firebase);

let isAppInit = false;

firebase.auth().onAuthStateChanged(() => {

	/* Firebase auth state change event can fire multiple times so use
		a flag to make sure Angular only initializes once */
	if (!isAppInit) {

		/* initialize Angular */
		platformBrowserDynamic().bootstrapModule(AppModule)
			.catch(err => console.error(err));

		isAppInit = true;
	}
});