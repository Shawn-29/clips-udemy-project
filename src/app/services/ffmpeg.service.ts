import { Injectable } from '@angular/core';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
	providedIn: 'root'
})
export class FfmpegService {

	isReady = false;
	isRunning = false;

	private ffmpeg;

	constructor() {
		this.ffmpeg = createFFmpeg({
			/* log to the console during development */
			log: true
		});
	}

	async init() {
		/* if ffmpeg is already loaded, simply return */
		if (this.isReady) {
			return;
		}

		await this.ffmpeg.load();

		this.isReady = true;
	}

	async getScreenshots(file: File) {

		this.isRunning = true;

		/* get the file as binary data */
		const data = await fetchFile(file);

		/* work with ffmpeg's internal file system ("FS") */
		this.ffmpeg.FS(
			'writeFile', /* write binary data to the file system */
			file.name, /* output filename */
			data
		);

		const seconds = [1, 2, 3];
		const commands: string[] = [];

		/* generate commands to create a screenshot for each second */
		seconds.forEach(second => {
			commands.push(
				/* input: get a file from ffmpeg's file system */
				'-i', file.name,

				/* output options */
				'-ss', `00:00:0${second}`,
				'-frames:v', '1',
				'-filter:v', 'scale=510:-1',

				/* output */
				`output_0${second}.png`
			);
		})

		/* run method allows us to run ffmpeg command line commands */
		await this.ffmpeg.run(...commands);

		const screenshots: string[] = [];

		seconds.forEach(second => {
			/* read in the binary data from each newly created screenshot */
			const screenshotFile = this.ffmpeg.FS(
				'readFile',
				`output_0${second}.png`
			);

			/* create a blob from the binary data so we can create
				a URL to access it in the browser */
			const screenshotBlob = new Blob(
				[screenshotFile.buffer], {
					type: 'image/png'
				}
			);

			const screenshotURL = URL.createObjectURL(screenshotBlob);

			screenshots.push(screenshotURL);
		});

		this.isRunning = false;

		return screenshots;
	}

	async blobFromURL(url: string) {
		const response = await fetch(url);

		const blob = await response.blob();

		return blob;
	}
}
