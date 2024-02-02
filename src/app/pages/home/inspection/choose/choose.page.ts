import {Component, EventEmitter, HostListener, Input} from '@angular/core';
import {ModalController, NavController, PopoverController} from '@ionic/angular';
import {DivIcon, Map, Marker, Polyline} from 'leaflet';
import {LatLng} from 'leaflet';
import {LayerPopoverComponent} from '../../../../core/component/layer-popover/layer-popover.component';
import {GIS_LAYERS} from '../../../../core/entity/map-config';
import * as esri from 'esri-leaflet';
import * as L from 'leaflet';
import {MapToolService} from '../../../../core/utils/map-tool.service';
import {FormGroup} from '@angular/forms';

@Component({
    selector: 'app-choose',
    templateUrl: './choose.page.html',
    styleUrls: ['./choose.page.scss'],
})
export class ChoosePage {
    @Input() taskForm: FormGroup;
    @Input() openType: string;
    map: Map;
    locate = new LatLng(22.560102, 113.442388);
    isSatellite = false;
    gisLayers: any[];
    rangList: any[] = [];
    distance = 10;
    rangLoading = false;
    isFullScreen = true;
    lastMarker: any;
    deviceNo: string;

    constructor(public modalCtrl: ModalController,
                public mapToolService: MapToolService,
                public popoverController: PopoverController) {
        this.gisLayers = GIS_LAYERS.map(layerConfig => {
            const config: any = {...layerConfig};
            config.layer = L.tileLayer.wms(config.url, {
                layers: config.layers,
                transparent: true,
                format: 'image/png',
                maxZoom: 22
            });
            return config;
        });
    }

    mapInitialized(map: Map) {
        this.map = map;
        this.gisLayers.forEach(layerConfig => {
            if (layerConfig.select) {
                this.map.addLayer(layerConfig.layer);
            }
        });
        if (this.openType === 'locate') {
            this.map.zoomControl.setPosition('bottomleft');
        }
        if (this.taskForm.controls.coordinate.value) {
            this.map.setView(this.taskForm.controls.coordinate.value, this.map.getZoom());
            this.locate = this.map.getCenter();
        }
        this.map.on('move', () => {
            this.locate = this.map.getCenter();
        });
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

    submit() {
        if (this.openType === 'locate') {
            this.taskForm.controls.coordinate.setValue(this.locate);
            this.taskForm.controls.coordinateStr.setValue(this.mapToolService.formatLocateStr(this.locate.lng, 5)
                + '，' + this.mapToolService.formatLocateStr(this.locate.lat, 5));
        } else {
            this.taskForm.controls.code.setValue(this.deviceNo);
        }
        this.modalCtrl.dismiss();
    }

    queryRang() {
        if (this.rangLoading) {
            return;
        }
        this.rangLoading = true;
        this.rangList.forEach(feature => {
            feature.marker.remove();
        });
        this.deviceNo = undefined;
        setTimeout(() => {
            this.gisLayers.filter(layerConfig => layerConfig.title === this.taskForm.controls.type.value).forEach(layerConfig => {
                const query = esri.query({url: layerConfig.url + '/0'});
                query.nearby(this.map.getCenter(), this.distance);
                query.run((error: any, featureCollection: any) => {
                    if (!error) {
                        if (featureCollection.features.length === 0) {
                            this.rangList = [];
                        } else {
                            let pointArray = [];
                            this.rangList = featureCollection.features;
                            this.rangList.forEach(feature => {
                                if (feature.geometry.type === 'LineString') {
                                    const points = feature.geometry.coordinates;
                                    pointArray = [...pointArray, ...points];
                                    const marker = L.polyline(points.map(item => [item[1], item[0]]), {color: '#97C0FF'});
                                    marker.addTo(this.map);
                                    feature.marker = marker;
                                } else {
                                    const lonLat = new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                                    pointArray.push([lonLat.lat, lonLat.lng]);
                                    const marker: Marker = L.marker(lonLat, {
                                        icon: new DivIcon({
                                            html: '<div><img src="assets/icon/point.svg"/></div>',
                                            className: 'pointer'
                                        })
                                    });
                                    marker.addTo(this.map);
                                    feature.marker = marker;
                                }
                            });
                            if (this.rangList.length > 0) {
                                const center = this.map.getCenter();
                                this.mapToolService.getLatLngBounds(pointArray);
                                this.map.fitBounds(this.mapToolService.getLatLngBounds(pointArray));
                                this.map.setView(center, this.map.getZoom());
                            }
                        }
                        this.fullScreenChange(false);
                    }
                    this.rangLoading = false;
                });
            });
        }, 300);
    }

    fullScreenChange(isFullScreen: boolean) {
        this.isFullScreen = isFullScreen;
        setTimeout(() => {
            this.map.invalidateSize(true);
        });
    }

    markRoute(item: any) {
        if (this.lastMarker) {
            if (item.geometry.type === 'LineString') {
                const line: Polyline = this.lastMarker;
                line.setStyle({
                    color: '#97C0FF'
                });
            } else {
                this.lastMarker.setIcon(new DivIcon({
                    html: '<div><img src="assets/icon/point.svg"/></div>',
                    className: 'pointer'
                }));
            }
            this.lastMarker = undefined;
        }
        if (item.geometry.type === 'LineString') {
            const line: Polyline = item.marker;
            line.setStyle({
                color: 'red'
            });
            this.lastMarker = line;
        } else {
            const point: Marker = item.marker;
            point.setIcon(new DivIcon({
                html: '<div class="jump"><img src="assets/icon/point-selected.svg"/></div>',
                className: 'pointer'
            }));
            this.lastMarker = point;
        }
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.modalCtrl.dismiss();
        });
    }
}
