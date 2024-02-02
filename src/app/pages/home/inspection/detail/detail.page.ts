import {Component, EventEmitter, HostListener, ViewChild} from '@angular/core';
import {AlertController, IonSelect, NavController, PopoverController} from '@ionic/angular';
import {MsgService} from '../../../../core/utils/msg.service';
import {LayerPopoverComponent} from '../../../../core/component/layer-popover/layer-popover.component';
import {Map, LatLng} from 'leaflet';
import {FACILITY_TYPE, GIS_LAYERS} from '../../../../core/entity/map-config';
import {ApiService} from '../../../../core/net/api.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Marker} from 'leaflet';
import {DivIcon} from 'leaflet';
import {BaseResult} from '../../../../core/entity/base-result';
import {MapToolService} from '../../../../core/utils/map-tool.service';
import {PickerService} from '../../../../core/utils/picker.service';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import {DatePipe} from '@angular/common';
import {StatusCode} from '../../../../core/entity/status-code';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['./detail.page.scss'],
})
export class DetailPage {
    @ViewChild('select', {static: true}) select: IonSelect;
    @ViewChild('receiveSelect', {static: true}) receiveSelect: IonSelect;
    pcId: number;
    map: Map;
    taskInfo: any = {};
    gisLayers: any[];
    patrolRoute = [];
    facilities = [];
    pointMarkers = {};
    lastPointId: number;
    tabVal = 'patrolRoute';
    lastMark: any;
    facilityList = [];
    recordList = [];
    isSatellite = false;
    isFullScreen = true;
    receiveList = [];
    showFinishBtn = false;

    constructor(public nav: NavController,
                private datePipe: DatePipe,
                private route: ActivatedRoute,
                private apiService: ApiService,
                private msgService: MsgService,
                private alertController: AlertController,
                private pickerService: PickerService,
                private navController: NavController,
                public mapToolService: MapToolService,
                public popoverController: PopoverController) {
        this.facilityList = FACILITY_TYPE;
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
        msgService.newRecordEvent.subscribe(() => {
            this.refreshList();
        });
        msgService.completeEvent.subscribe(res => {
            this.refreshList();
        });
    }

    mapInitialized(map: Map) {
        this.map = map;
        this.gisLayers.forEach(layerConfig => {
            if (layerConfig.select) {
                this.map.addLayer(layerConfig.layer);
            }
        });
        this.queryTask();
    }

    async queryTask() {
        const loading = await this.msgService.showLoading('努力加载中...');
        this.route.params.subscribe(param => {
            if (!this.pcId) {
                this.pcId = param.pcId;
                this.apiService.getTaskDetail(this.pcId).subscribe((res: BaseResult) => {
                    if (res.state === 0) {
                        this.taskInfo = res.data.taskInfo;
                        this.patrolRoute = res.data.patrolRoute;
                        const recordBh = res.data.taskRecord.map(item => item.ssbm);
                        this.facilities = res.data.facilities.map(item => {
                            item.editable = this.taskInfo.zt === 0 && this.taskInfo.editable && recordBh.indexOf(item.ssbh) === -1;
                            return item;
                        });
                        this.showFinishBtn = this.taskInfo.zt === 0 && this.taskInfo.editable
                            && this.facilities.filter(item => item.editable).length === 0;
                        this.recordList = res.data.taskRecord;
                        this.msgService.readEvent.emit(this.taskInfo.id);
                        if (this.taskInfo.zt === 0 && this.taskInfo.editable) {
                            this.getTaskReceiver();
                        }
                    } else {
                        this.msgService.showToast(res.msg);
                    }
                }, () => {
                }, () => {
                    this.initDataView();
                    loading.dismiss();
                });
            }
        });
    }

    initDataView() {
        let pointArray = [];
        this.patrolRoute.forEach(value => {
            const points = this.mapToolService.read(value.geo)
                .features.map(point => this.mapToolService.mercatorToLonLat(point[0], point[1]));
            pointArray = [...points];
            L.polyline(points, {color: '#97C0FF'}).addTo(this.map);
        });

        this.facilities.forEach(value => {
            try {
                value.geo = value.geoStr;
                const geometry = this.mapToolService.read(value.geo);
                if (geometry.type === 'point') {
                    const lonLat = this.mapToolService.mercatorToLonLat(geometry.features[0], geometry.features[1]);
                    pointArray = [...pointArray, lonLat];
                    const center = new LatLng(lonLat[0], lonLat[1]);
                    this.pointMarkers[value.id] = L.marker(center, {
                        icon: new DivIcon({
                            html: '<div><img src="assets/icon/point.svg"/></div>',
                            className: 'pointer'
                        })
                    }).addTo(this.map);
                } else {
                    const points = geometry.features.map(point => this.mapToolService.mercatorToLonLat(point[0], point[1]));
                    pointArray = [...pointArray, ...points];
                    L.polyline(points, {color: '#97C0FF'}).addTo(this.map);
                }
            } catch (e) {
            }
        });
        if (pointArray.length > 0) {
            this.map.fitBounds(this.mapToolService.getLatLngBounds(pointArray));
        }
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

    fullScreenChange(isFullScreen?: boolean) {
        this.isFullScreen = isFullScreen;
        setTimeout(() => {
            this.map.invalidateSize(true);
        });
    }

    markRoute(item: any) {
        console.log(item);
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
                if (item.geoStr) {
                    geometry = this.mapToolService.read(item.geoStr);
                } else if (item.geo) {
                    geometry = this.mapToolService.read(item.geo);
                }
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

    formQuery() {
        this.tabVal = 'taskList';
        this.isFullScreen = false;
        setTimeout(() => {
            this.map.invalidateSize(true);
        });
    }

    createForm() {
        this.select.value = undefined;
        this.select.open();
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
        this.navController.navigateForward('/task/detail/' + this.pcId + '/facility', {
            queryParams: params
        });
    }

    async refreshList() {
        this.apiService.getTaskDetail(this.pcId).subscribe((res: BaseResult) => {
            if (res.state === 0) {
                this.taskInfo = res.data.taskInfo;
                this.patrolRoute = res.data.patrolRoute;
                const recordBh = res.data.taskRecord.map(item => item.ssbm);
                this.facilities = res.data.facilities.map(item => {
                    item.editable = this.taskInfo.zt === 0 && this.taskInfo.editable && recordBh.indexOf(item.ssbh) === -1;
                    return item;
                });
                this.showFinishBtn = this.taskInfo.zt === 0 && this.taskInfo.editable
                    && this.facilities.filter(item => item.editable).length === 0;
                this.recordList = res.data.taskRecord;
            }
        });
    }

    showReceiver() {
        this.receiveSelect.value = undefined;
        this.receiveSelect.open();
    }

    private getTaskReceiver() {
        this.apiService.getTaskReceiver().subscribe((res: BaseResult) => {
            if (res.state === StatusCode.SUCCESS) {
                this.receiveList = res.data;
            }
        });
    }

    async submitReceiver() {
        if (!this.receiveSelect.value) {
            return;
        }
        const loading = await this.msgService.showLoading('转发任务中...');
        this.apiService.submitReceiver({
            pcId: this.pcId,
            jsRid: this.receiveSelect.value
        }).subscribe((res: BaseResult) => {
            if (res.state === StatusCode.SUCCESS) {
                this.refreshList();
                this.msgService.showToast('转发成功');
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {}, () => {
            loading.dismiss();
        });
    }

    async completeTask() {
        const alert = await this.alertController.create({
            header: '确认结束任务？',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: '确定',
                    handler: () => {
                        this.finishTask(this.pcId);
                    }
                }
            ]
        });
        await alert.present();
    }

    async finishTask(id: number) {
        const loading: any = await this.msgService.showLoading('数据提交中');
        this.apiService.completeTask(id).subscribe((res: BaseResult) => {
            if (res.state === StatusCode.SUCCESS) {
                this.msgService.completeEvent.emit();
                this.msgService.showToast('操作成功');
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {}, () => {
            loading.dismiss();
        });
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.nav.back();
        });
    }
}
