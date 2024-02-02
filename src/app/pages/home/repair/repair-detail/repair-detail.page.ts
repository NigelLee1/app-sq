import {Component, EventEmitter, HostListener, OnInit} from '@angular/core';
import {AlertController, ModalController, NavController, PopoverController} from '@ionic/angular';
import {LayerPopoverComponent} from '../../../../core/component/layer-popover/layer-popover.component';
import {DivIcon, LatLng, Map} from 'leaflet';
import {BaseResult} from '../../../../core/entity/base-result';
import {MsgService} from '../../../../core/utils/msg.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ApiService} from '../../../../core/net/api.service';
import {GIS_LAYERS} from '../../../../core/entity/map-config';
import * as esri from 'esri-leaflet';
import {FaultPage} from '../fault/fault.page';
import * as L from 'leaflet';
import {MapToolService} from '../../../../core/utils/map-tool.service';

@Component({
    selector: 'app-repair-detail',
    templateUrl: './repair-detail.page.html',
    styleUrls: ['./repair-detail.page.scss'],
})
export class RepairDetailPage {
    repair: any;
    isSatellite = false;
    map: Map;
    id: number;
    gisLayers: any[];
    faultList = [];
    modal: any;
    enableFinish = false;
    isFullScreen = false;
    geometry: any;
    isView = false;

    constructor(public nav: NavController,
                private apiService: ApiService,
                private msgService: MsgService,
                private route: ActivatedRoute,
                public alertController: AlertController,
                public mapToolService: MapToolService,
                public modalController: ModalController,
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
        this.route.queryParams.subscribe((params: Params) => {
            this.isView = params.view !== undefined ? params.view : this.isView;
            this.queryRepair();
        }).unsubscribe();
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

    async queryRepair() {
        const loading = await this.msgService.showLoading('努力加载中...');
        this.route.params.subscribe(param => {
            if (!this.id) {
                this.id = param.id;
                this.queryData(loading);
            }
        });
    }

    async queryData(loading?: any) {
        this.apiService.getRepairDetail(this.id).subscribe((res: BaseResult) => {
            if (res.state === 0) {
                this.repair = res.data.repair;
                this.faultList = res.data.faultList;
                const finishCount = this.faultList.filter(value => value.com).length;
                this.enableFinish = finishCount === this.faultList.length;
                this.markLocation();
                this.msgService.repairReadEvent.emit(this.id);
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {
        }, () => {
            try {
                loading.dismiss();
                this.fullScreenChange(false);
            } catch (e) { }
        });
    }

    async showFault(item: any) {
        this.modal = await this.modalController.create({
            component: FaultPage,
            componentProps: {
                rcId: item.sid,
                fault: item,
                isView: this.isView
            }
        });
        await this.modal.present();
        const { data } = await this.modal.onWillDismiss();
        if (data && data.refresh) {
            this.queryData();
        }
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(101, async () => {
            this.nav.back();
        });
    }

    fullScreenChange(isFullScreen: boolean) {
        this.isFullScreen = isFullScreen;
        setTimeout(() => {
            this.map.invalidateSize(true);
        });
    }

    private markLocation() {
        if (this.geometry) {
            return;
        }
        let pointArray = [];
        this.geometry = this.mapToolService.read(this.repair.stGeo);
        if (this.geometry.type === 'point') {
            const lonLat = this.mapToolService.mercatorToLonLat(this.geometry.features[0], this.geometry.features[1]);
            pointArray = [...pointArray, lonLat];
            const center = new LatLng(lonLat[0], lonLat[1]);
            L.marker(center, {
                icon: new DivIcon({
                    html: '<div><img src="assets/icon/point.svg"/></div>',
                    className: 'pointer'
                })
            }).addTo(this.map);
        } else {
            const points = this.geometry.features.map(point => this.mapToolService.mercatorToLonLat(point[0], point[1]));
            pointArray = [...pointArray, ...points];
            L.polyline(points, {color: '#97C0FF'}).addTo(this.map);
        }
        if (pointArray.length > 0) {
            this.map.fitBounds(this.mapToolService.getLatLngBounds(pointArray));
        }
    }

    async submit() {
        const alert = await this.alertController.create({
            header: '结束后将不能进行修改',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: '确定',
                    handler: () => {
                        this.apiService.completeRepair({id: this.id}).subscribe(res => {
                            if (res.state === 0) {
                                this.msgService.showToast('提交成功');
                                this.msgService.finishRepairEvent.emit();
                                this.nav.back();
                            } else {
                                this.msgService.showToast(res.error_msg);
                            }
                        });
                    }
                }
            ]
        });
        await alert.present();
    }
}
