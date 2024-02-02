import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayerPopoverComponent} from './layer-popover/layer-popover.component';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {MapComponent} from './map/map.component';

const COMPONENTS = [
    MapComponent,
    LayerPopoverComponent
];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ],
    exports: [...COMPONENTS],
    entryComponents: [...COMPONENTS]
})
export class ComponentModule {
}
