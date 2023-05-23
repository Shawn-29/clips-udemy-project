import { Injectable } from '@angular/core';

import {
	Router,
	ActivatedRoute,
	NavigationEnd
} from '@angular/router';

import { Observable, of } from 'rxjs';
import { delay, map, filter, switchMap } from 'rxjs/operators';

/* form authentication and user logout */
import { AngularFireAuth } from '@angular/fire/compat/auth';

/* for working with Firestore database */
import {
	AngularFirestore,
	AngularFirestoreCollection
} from '@angular/fire/compat/firestore';

import IUser from '../models/user.model';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	private usersCollection: AngularFirestoreCollection<IUser>;

	public isAuthenticated$: Observable<boolean>;

	public isAuthenticatedWithDelay$: Observable<boolean>;

	private shouldRedirect = false;

	/* inject the AngularFireAuth and AngularFirestore services */
	constructor(
		private auth: AngularFireAuth,
		private db: AngularFirestore,
		private router: Router,
		private activeRoute: ActivatedRoute
	) {
		this.usersCollection = this.db.collection('user');

		/* subscribe to an authenticated user Observable */
		this.isAuthenticated$ = auth.user.pipe(
			map(user => {
				{
					/* if the user is authenticated, a user object will be
						pushed and null otherwise; cast the result to a boolean */
					return !!user;
				}
			})
		);

		/* add a delay after the user is authenticated (for visual purposes);
			the map operator is already applied from isAuthenticated$ */
		this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
			delay(1000)
		);

		/* we can't get our authOnly property from the active route; we
			must search the router state tree for the route we need */
		this.router.events.pipe(
			/* we are only interested in the NavigationEnd event emitted
				by the router; it will tell us when we redirected the user
				to a new page */
			filter(e => e instanceof NavigationEnd),
			map(_ => {
				{
					// console.log('activeRoute:', activeRoute);
					// console.log('activeRoute.firstChild:', this.activeRoute.firstChild);
					
					/* the route we need is on the first child of the active route
						in the tree of route objects; it will contain a data Observable
						with the authOnly property */
					return this.activeRoute.firstChild;
				}
			}),
			/* switchMap only handles the current Observable and will discard
				previous ones */
			switchMap(route => {
				{
					// console.log('route.data:', route?.data);
					
					/* return a data Observable */
					return route?.data ?? of({ authOnly: false });
				}
			})
		).subscribe((data) => {
			this.shouldRedirect = data.authOnly ?? false;
		});
	}

	public async createUser(userData: IUser) {

		if (!userData.password) {
			throw new Error('Password not provided!');
		}

		/* store user credentials returned from the authentication service; we need
		  the uid from this service to be the same as the uid for the new document that
		  will be added to the users collection so as to link the two services */
		const userCred = await this.auth.createUserWithEmailAndPassword(
			userData.email, userData.password
		);

		if (!userCred.user) {
			throw new Error('User can\'t be found!');
		}

		/* doc method takes an id as an argument and creates a new document;
		  set assigns properties to the document */
		await this.usersCollection.doc(userCred.user.uid).set({
			name: userData.name,
			email: userData.email,
			age: userData.age,
			phoneNumber: userData.phoneNumber
		});

		/* update the new user's display name in the authentication service */
		await userCred.user.updateProfile({
			displayName: userData.name
		});
	}

	async logout(e?: Event) {

		if (e) {
			e.preventDefault();
		}

		await this.auth.signOut();

		if (this.shouldRedirect) {
			/* redirect the user to the home page */
			await this.router.navigateByUrl('/');
		}
	}
}