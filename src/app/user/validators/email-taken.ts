import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Injectable } from '@angular/core';

import {
    /* interface to support type safey for classes that will
        perform asynchronous validation */
    AsyncValidator,

    AbstractControl,
    ValidationErrors
} from '@angular/forms';

/* apply the Injectable decorator for this class to support
    dependency injection; we can now inject this class into
    other classes */
@Injectable({
    providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {

    constructor(private auth: AngularFireAuth) { }

    /* WARNING! if validate is stored as a method, when Angular changes the
        context of auth during dependency injection, this will be undefined
        and an exception will be thrown */
    // async validate(control: AbstractControl) {

    /* must store the validate function as a member variable so when Angular
        changes the context of auth during dependency injection, this will
        still reference the class instance itself */
    validate = async (control: AbstractControl): Promise<ValidationErrors | null> => {

        const email = control.value;

        /* determine if this email address has already been taken;
            this method returns an array of sign-in methods associated with this email
            address or null if none are found*/
        return this.auth.fetchSignInMethodsForEmail(email)
            .then(response => {
                return response.length ? { emailTaken: true } : null;
            });
    }
}