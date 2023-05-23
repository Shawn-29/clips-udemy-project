import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* route components */
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { ClipResolver } from './services/clip.service';

/* topmost routers have higher priority */
const routes: Routes = [
	/* home route */
	{
		/* path to match against the URL */
		path: '',
		/* component to render if path matches */
		component: HomeComponent
	},
	/* about route */
	{
		path: 'about',
		component: AboutComponent
	},
	/* clip route */
	{
		path: 'clip/:id',
		component: ClipComponent,
		resolve: {
			clip: ClipResolver
		}
	},
	{
		path: '',
		/* lazy load the video module */
		loadChildren: async () => (await import('./video/video.module')).VideoModule
	},
	/* wildcard route for unknown routes */
	{
		path: '**',
		component: NotFoundComponent
	}
];

@NgModule({
	/* register routes by passing them to the forRoot function */
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
