import {
	Component,
	AfterContentInit,
	ContentChildren,
	QueryList
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
	selector: 'app-tabs-container',
	templateUrl: './tabs-container.component.html',
	styleUrls: ['./tabs-container.component.css']
})
export class TabsContainerComponent implements AfterContentInit {

	/* get all TabComponent children within this component */
	@ContentChildren(TabComponent) tabs:
		QueryList<TabComponent> = new QueryList();

	ngAfterContentInit() {
		const activeTabs = this.tabs.filter(
			tab => tab.isActive
		);

		if (activeTabs.length === 0) {
			this.selectTab(this.tabs.first);
		}
	}

	selectTab(tab: TabComponent) {
		/* make every tab inactive */
		this.tabs.forEach(tab => {
			tab.isActive = false;
		});

		tab.isActive = true;

		/* by returning false, Angular will automatically
			prevent the default event behavior */
		return false;
	}
}
