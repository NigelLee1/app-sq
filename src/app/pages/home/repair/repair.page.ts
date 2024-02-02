import {Component, HostListener, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-repair',
    templateUrl: './repair.page.html',
    styleUrls: ['./repair.page.scss'],
})
export class RepairPage implements OnInit {
    segment = 'notRepaired';

    constructor(public navController: NavController) {
    }

    ngOnInit() {
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
