import {Component, HostListener} from '@angular/core';
import {AlertController, LoadingController, NavController} from '@ionic/angular';

@Component({
    selector: 'app-inspection',
    templateUrl: './inspection.page.html',
    styleUrls: ['./inspection.page.scss'],
})
export class InspectionPage {
    segment = 'unfinished';

    constructor(public navController: NavController) {
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.navController.navigateBack('home');
        });
    }

    segmentChange(event: CustomEvent) {
        this.segment = event.detail.value;
    }
}
