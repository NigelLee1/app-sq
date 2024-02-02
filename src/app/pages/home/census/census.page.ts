import {Component, HostListener, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-census',
  templateUrl: './census.page.html',
  styleUrls: ['./census.page.scss'],
})
export class CensusPage implements OnInit {

  constructor(private nav: NavController) { }

  ngOnInit() {
  }

  @HostListener('document:ionBackButton', ['$event'])
  public overrideHardwareBackAction($event: any) {
    $event.detail.register(100, async () => {
      this.nav.back();
    });
  }

}
