import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/* routing */
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { UserModule } from './user/user.module';
import { NavComponent } from './nav/nav.component';

/* for working with Firebase */
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
/* for working with Firebase authentication */
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
/* for working with Firestore database */
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

/* for working with Firebase cloud storage */
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { SharedModule } from './shared/shared.module';
import { ClipsListComponent } from './clips-list/clips-list.component';
import { FbTimestampPipe } from './pipes/fb-timestamp.pipe';

@NgModule({
	declarations: [
		AppComponent,
		NavComponent,
		HomeComponent,
		AboutComponent,
		ClipComponent,
		NotFoundComponent,
		ClipsListComponent,
		FbTimestampPipe,
	],
	imports: [
		BrowserModule,
		UserModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAuthModule,
		AngularFirestoreModule,
		AppRoutingModule,
		SharedModule,
		AngularFireStorageModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
