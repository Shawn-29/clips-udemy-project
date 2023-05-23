import {
    ValidationErrors,
    AbstractControl,
    ValidatorFn
} from '@angular/forms';

export class RegisterValidators {
    /* returns a function that when called, compares two form controls' values */
    static match(
        controlName: string, matchingControlName: string
    ): ValidatorFn {

        /* AbstractControl is the base class of both FormGroup and FormControl;
            return a ValidationErrors object if an error occurs; null otherwise */
        return (group: AbstractControl): ValidationErrors | null => {
            const control = group.get(controlName);
            const matchingControl = group.get(matchingControlName);

            /* check if both controls were found */
            if (!control || !matchingControl) {

                /* message for developers */
                console.error('Form controls can\'t be found in the form group.');

                return { controlNotFound: false };
            }

            /* check if the controls' values match */
            const error = control.value === matchingControl.value ?
                null : { noMatch: true };

            /* manually set an error on a non-matching control;
                pass in null to remove errors */
            matchingControl.setErrors(error);

            return error;
        };
    }
}