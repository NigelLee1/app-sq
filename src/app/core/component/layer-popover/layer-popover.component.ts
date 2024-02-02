import {AfterViewInit, Component, EventEmitter, Input} from '@angular/core';
import {Map} from 'leaflet';

@Component({
    selector: 'app-layer-popover',
    templateUrl: './layer-popover.component.html',
    styleUrls: ['./layer-popover.component.scss'],
})
export class LayerPopoverComponent implements AfterViewInit {
    @Input() event: EventEmitter<any>;
    @Input() isSatellite: boolean;
    @Input() map: Map;
    @Input() gisLayers: any[];
    allChecked = false;
    someChecked = false;

    ngAfterViewInit(): void {
        this.layerClick(true);
    }

    isSatelliteChange(isSatellite: boolean) {
        if (this.isSatellite !== isSatellite) {
            this.isSatellite = isSatellite;
        }
        this.event.emit(this.isSatellite);
    }

    layerClick(isStart?: boolean) {
        setTimeout(() => {
            const checkCount = this.gisLayers.filter(item => item.select === true).length;
            if (checkCount === 0) {
                this.allChecked = false;
                this.someChecked = false;
            } else if (this.gisLayers.length === checkCount) {
                this.someChecked = false;
                this.allChecked = true;
            } else {
                this.allChecked = false;
                this.someChecked = true;
            }
            if (!isStart) {
                this.layerChange();
            }
        });
    }

    allCheckedChange(allChecked: boolean) {
        this.gisLayers.forEach(layer => layer.select = allChecked);
        this.someChecked = false;
        this.layerChange();
    }

    layerChange() {
        this.gisLayers.forEach(layerConfig => {
            if (layerConfig.select) {
                if (!this.map.hasLayer(layerConfig.layer)) {
                    this.map.addLayer(layerConfig.layer);
                }
            } else {
                if (this.map.hasLayer(layerConfig.layer)) {
                    this.map.removeLayer(layerConfig.layer);
                }
            }
        });
    }
}
