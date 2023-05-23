import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ClipService } from '../services/clip.service';

@Component({
    selector: 'app-clips-list',
    templateUrl: './clips-list.component.html',
    styleUrls: ['./clips-list.component.css'],
    providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {

    @Input() scrollable = true;

    /* important! this function must be an arrow function so we
        can access this component's injected services  */
    handleScroll = () => {
        const { scrollTop, offsetHeight } = document.documentElement;
        const { innerHeight } = window;

        const atBottomOfWindow =
            Math.round(scrollTop) + innerHeight === offsetHeight;
    }

    constructor(public clipService: ClipService) {

        this.clipService.getClips();
    }

    ngOnInit() {
        if (this.scrollable) {
            window.addEventListener('scroll', this.handleScroll);
        }
    }

    ngOnDestroy() {
        if (this.scrollable) {
            window.removeEventListener('scroll', this.handleScroll);
        }

        /* reset the scrollable clips if the user moves to a different page */
        this.clipService.pageClips = [];
    }
}