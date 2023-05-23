import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageComponent } from './manage/manage.component';
import { UploadComponent } from './upload/upload.component';

import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const routes: Routes = [
	/* manage route */
	{
		path: 'manage',
		component: ManageComponent,
		data: {
			authOnly: true,
			/* specify a function for the authGuardPipe that will
				redirect the user if the user isn't signed in */
			authGuardPipe: () => {
				return redirectUnauthorizedTo('/');
			}
		},
		/* canActivate will run route guards when the user attempts to
			access this route; AngularFireAuthGuard will reject the user's
			request to access this route if the user is not signed in */
		canActivate: [AngularFireAuthGuard]
	},
	/* upload route */
	{
		path: 'upload',
		component: UploadComponent,
		data: {
			authOnly: true,
			authGuardPipe: () => {
				return redirectUnauthorizedTo('/');
			}
		},
		canActivate: [AngularFireAuthGuard]
	},
	/* manage clips route doesn't exist anymore but users might have bookmarked
		a link referring to it; redirect the user to the manage page */
	{
		path: 'manage-clips',
		redirectTo: 'manage'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class VideoRoutingModule { }
