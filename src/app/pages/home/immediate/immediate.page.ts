import {Component, EventEmitter, HostListener, ViewChild} from '@angular/core';
import {LayerPopoverComponent} from '../../../core/component/layer-popover/layer-popover.component';
import {IonSelect, ModalController, NavController, PopoverController} from '@ionic/angular';
import {DivIcon, LatLng, Map, Marker} from 'leaflet';
import {FACILITY_TYPE, GIS_LAYERS} from '../../../core/entity/map-config';
import * as esri from 'esri-leaflet';
import {Params} from '@angular/router';
import {ApiService} from '../../../core/net/api.service';
import * as L from 'leaflet';
import {MapToolService} from '../../../core/utils/map-tool.service';
import {FacilityPage} from '../inspection/facility/facility.page';

@Component({
    selector: 'app-immediate',
    templateUrl: './immediate.page.html',
    styleUrls: ['./immediate.page.scss'],
})
export class ImmediatePage {
    @ViewChild('select', {static: true}) select: IonSelect;
    map: Map;
    gisLayers: any[];
    isSatellite = false;
    isFullScreen = false;
    facilityList = [];
    list = [];
    lastMark: any;
    lastPointId: number;
    pointMarkers = {};
    mapLoaded = false;

    constructor(public popoverController: PopoverController,
                private apiService: ApiService,
                public mapToolService: MapToolService,
                public modalController: ModalController,
                public navController: NavController) {
        this.gisLayers = GIS_LAYERS.map(layerConfig => {
            const config: any = {...layerConfig};
            config.layer = L.tileLayer.wms(config.url, {
                layers: config.layers,
                transparent: true,
                format: 'image/png'
            });
            return config;
        });
        this.facilityList = FACILITY_TYPE;
    }

    async showSelectLayer(ev) {
        const layPopEvent = new EventEmitter<any>();
        layPopEvent.subscribe(isSatellite => this.isSatellite = isSatellite);
        const popover = await this.popoverController.create({
            component: LayerPopoverComponent,
            event: ev,
            translucent: true,
            cssClass: 'detail-popover',
            componentProps: {
                map: this.map,
                event: layPopEvent,
                gisLayers: this.gisLayers,
                isSatellite: this.isSatellite
            }
        });
        return await popover.present();
    }

    mapInitialized(map: Map) {
        this.map = map;
        this.gisLayers.forEach(layerConfig => {
            if (layerConfig.select) {
                this.map.addLayer(layerConfig.layer);
            }
        });
        this.query();
        this.mapLoaded = true;
    }

    query() {
        this.apiService.getImmediateList().subscribe(res => {
            this.list = res.data;
            setTimeout(() => {
                this.map.invalidateSize(true);
            });
        });
    }

    fullScreenChange(isFullScreen: boolean) {
        this.isFullScreen = isFullScreen;
        setTimeout(() => {
            this.map.invalidateSize(true);
        });
    }

    createForm() {
        this.select.value = undefined;
        this.select.open();
    }

    markRoute(item: any) {
        if (this.lastMark) {
            this.lastMark.remove();
            this.lastMark = undefined;
        }
        if (this.lastPointId) {
            const marker: Marker = this.pointMarkers[this.lastPointId];
            if (marker) {
                marker.setIcon(new DivIcon({
                    html: '<div><img src="assets/icon/point.svg"/></div>',
                    className: 'pointer'
                }));
                this.lastPointId = undefined;
            }
        }
        if (item.x) {
            this.lastMark = L.marker(new LatLng(item.y, item.x), {
                icon: new DivIcon({
                    html: '<div class="jump"><img src="assets/icon/point-selected.svg"/></div>',
                    className: 'pointer'
                })
            }).addTo(this.map);
            this.lastMark.addTo(this.map);
            this.map.setView(this.lastMark.getLatLng(), 18);
        } else {
            let geometry;
            try {
                geometry = this.mapToolService.read(item.geo);
            } catch (e) {
                return;
            }
            if (geometry.type === 'point') {
                const marker: Marker = this.pointMarkers[item.id];
                marker.setIcon(new DivIcon({
                    html: '<div class="jump"><img src="assets/icon/point-selected.svg"/></div>',
                    className: 'pointer'
                }));
                this.lastPointId = item.id;
                this.map.setView(marker.getLatLng(), 18);
            } else {
                this.lastMark = L.polyline(geometry.features.map(point => this.mapToolService.mercatorToLonLat(point[0], point[1])),
                    {color: 'red'});
                this.lastMark.addTo(this.map);
                this.map.fitBounds(this.lastMark.getBounds());
            }
        }
    }

    async showDetail(item: any) {
        const modal = await this.modalController.create({
            component: FacilityPage,
            componentProps: {
                rcId: item.id,
                isModal: true
            }
        });
        await modal.present();
    }

    createReport(item?: any) {
        const params: Params = {};
        if (item) {
            if (item.id) {
                params.id = item.id;
            } else {
                params.rcId = item.rcId;
            }
        } else {
            if (this.select.value === undefined) {
                return;
            }
            params.type = this.select.value;
        }
        this.navController.navigateForward('/task/detail/null/facility', {
            queryParams: params
        });
    }

    ionViewWillEnter() {
        if (this.mapLoaded) {
            this.query();
        }
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.navController.back();
        });
    }
}
