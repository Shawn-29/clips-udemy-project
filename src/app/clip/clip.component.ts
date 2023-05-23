import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	ViewEncapsulation
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { ActivatedRoute, Params } from '@angular/router';

import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import IClip from '../models/clip.model';

@Component({
	selector: 'app-clip',
	templateUrl: './clip.component.html',
	styleUrls: ['./clip.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [DatePipe]
})
export class ClipComponent implements OnInit {

	clipData?: IClip;

	@ViewChild('videoPlayer', { static: true }) target?: ElementRef;

	player?: Player;

	constructor(public route: ActivatedRoute) { }

	ngOnInit() {
		/* set the initial id */
		// this.id = this.route.snapshot.params.id;
		// this.id = String(this.route.snapshot.paramMap.get('id'));

		/* params is an Observable that will push values whenever
			this route's params change */
		// this.route.params.subscribe((param: Params) => {
		// 	console.log('param:', param);
		// 	this.id = param.id;
		// });

		this.player = videojs(this.target?.nativeElement);

		this.route.data.subscribe(data => {
			this.clipData = data.clip as IClip;

			this.player?.src({
				src: this.clipData.url,
				type: 'video/mp4'
			});
		});
	}
}