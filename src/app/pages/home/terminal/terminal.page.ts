import { Component, EventEmitter, HostListener } from '@angular/core';
import { DivIcon, Map } from 'leaflet';
import { GIS_LAYERS } from '../../../core/entity/map-config';
import { LayerPopoverComponent } from '../../../core/component/layer-popover/layer-popover.component';
import { NavController, PopoverController, ToastController } from '@ionic/angular';
import { ApiService } from '../../../core/net/api.service';
import { MapToolService } from '../../../core/utils/map-tool.service';
import * as L from 'leaflet';
import { DatePipe } from '@angular/common';
import { BaseResult } from '../../../core/entity/base-result';
import { LatLng, LatLngBounds } from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as WMS from 'leaflet.wms';
import * as $ from 'jquery';


@Component({
    selector: 'app-terminal',
    templateUrl: './terminal.page.html',
    styleUrls: ['./terminal.page.scss'],
})
export class TerminalPage {
    map: Map;
    gisLayers: any[];
    isSatellite = false;
    isFullScreen = false;
    types: {
        typeName: string,
        list: any[]
    }[] = [];
    tabVal = null;
    markers = [];
    popup: any;
    mn: any;
    marker: any;
    factorCache = {};
    lelTolerance = {
        12: 3860.0699,
        13: 1930.0349,
        14: 965.0175,
        15: 482.5087,
        16: 241.2544,
        // 17: 120.6272,
        // 18: 60.3136,
        // 19: 30.1568,
        // 20: 15.0784,
        // 21: 7.5392,
        // 22: 3.7696,
        // 23: 1.8848,
        // 24: 0.9424
        17: 241.2544,
        18: 241.2544,
        19: 120.6272,
        20: 60.3136,
        21: 30.1568,
        22: 15.078,
        23: 7.5392,
        24: 3.7696
    };

    constructor(public popoverController: PopoverController,
        public mapToolService: MapToolService,
        private datePipe: DatePipe,
        public navCtrl: NavController,
        private apiService: ApiService,
        private http: HttpClient,
        private toastController: ToastController,) {
        // this.gisLayers = GIS_LAYERS.map(layerConfig => {
        //     const config: any = { ...layerConfig };
        //     config.layer = L.tileLayer.wms(config.url, {
        //         layers: config.layers,
        //         transparent: true,
        //         format: 'image/png'
        //     });
        //     return config;
        // });
        this.gisLayers = GIS_LAYERS.map(layerConfig => {
            const config: any = { ...layerConfig };
            config.layer = L.tileLayer.wms(config.url, {
                layers: config.layers,
                transparent: true,
                format: 'image/png',
                maxZoom: 22
            });
            return config;
        });
    }

    query() {
        this.apiService.getDeviceStatusList().subscribe((res: BaseResult) => {
            if (res.data.length > 0) {
                if (this.tabVal === null) {
                    this.types = res.data;
                    this.segmentChanged({
                        detail: {
                            value: res.data[0].typeName
                        }
                    });
                } else {
                    this.types.forEach(item => {
                        res.data.filter(device => device.typeName === item.typeName).forEach(device => {
                            item.list = device.list;
                        });
                    });
                }
            }
        });
    }

    private compare(property) {
        return (a, b) => {
            const value1 = a[property];
            const value2 = b[property];
            return value1.localeCompare(value2);
        };
    }

    segmentChanged(ev: any) {
        this.tabVal = ev.detail.value;
        this.markers.forEach(marker => {
            marker.remove();
            marker = null;
        });
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }
        this.types.filter(value => value.typeName === this.tabVal)[0].list.forEach(value => {
            const color = this.getColor(value, 1);
            this.markers.push(L.marker(this.mapToolService.mercatorToLonLat(value.x, value.y), {
                icon: new DivIcon({
                    html: '<div style="display: inline-block; overflow: hidden;"><img src="http://sq.akest.cn/assets/icon/' + value.icon
                        + '.svg" style="filter: ' + color + ';' + 'position: relative; left: -33px;"/></div>',
                    className: 'device'
                })
            }));
            this.markers[this.markers.length - 1].addTo(this.map);
            this.markers[this.markers.length - 1].on('click', (e) => {
                this.showInformation(value);
            });
        });
        setTimeout(() => {
            this.map.invalidateSize(true);
        });
    }

    mapInitialized(map: Map) {
        this.map = map;
        this.map.on('click', (e: any) => {
            const ajaxUrls = [];
            [1, 2, 3, 4, 5, 7, 8].forEach(element => {
                const layer = this.gisLayers[element].layer;
                // Build the URL for a GetFeatureInfo
                const url = this.getFeatureInfoUrl(
                    map,
                    layer,
                    e.latlng
                );
                ajaxUrls.push($.ajax({
                    url,
                    method: 'GET'
                }).promise());
            });

            Promise.all(ajaxUrls).then(res => {
                for (const data of res) {
                    if (data.features.length > 0) {
                        const feature = data.features[0];
                        if (this.marker) {
                            this.marker.remove();
                            this.marker = null;
                        }
                        let infoPosition = null;
                        if (feature.geometry.type === 'LineString') {
                            const points = feature.geometry.coordinates;
                            const newPoints = [];
                            points.forEach(point => {
                                newPoints.push(this.mapToolService.mercatorToLonLat(point[0], point[1]));
                            });
                            this.marker = L.polyline(newPoints, { color: 'red', weight: 2 });
                            this.marker.addTo(this.map);
                            this.map.fitBounds(this.marker.getBounds());
                            const lineBound = this.mapToolService.getLatLngBounds(feature.geometry.coordinates);
                            const centerPoint = lineBound.getCenter();
                            infoPosition = this.mapToolService.mercatorToLonLat(centerPoint.lat, centerPoint.lng);
                        } else {
                            infoPosition =  this.mapToolService.
                            mercatorToLonLat(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
                            const southWest = new LatLng(infoPosition[0], infoPosition[1]);
                            this.map.setView(infoPosition, 22);
                            southWest.lat = southWest.lat - 0.000002;
                            southWest.lng = southWest.lng - 0.000002;

                            const northEast = new LatLng(infoPosition[0], infoPosition[1]);
                            northEast.lat = northEast.lat + 0.000002;
                            northEast.lng = northEast.lng + 0.000002;
                            this.marker = L.rectangle(new LatLngBounds(southWest, northEast), { color: 'red', weight: 2 });
                            this.marker.addTo(this.map);
                        }
                        // this.showFacilityInformation(e.latlng, feature);
                        this.showFacilityInformation(infoPosition, feature);
                        break;
                    }
                }
            }, err => {
                this.presentToast();
            });
        });
        this.gisLayers.forEach(layerConfig => {
            if (layerConfig.select) {
                this.map.addLayer(layerConfig.layer);
            }
        });
        this.query();
        setInterval(() => {
            this.query();
        }, 60000);
    }

    fullScreenChange(isFullScreen: boolean) {
        this.isFullScreen = isFullScreen;
        setTimeout(() => {
            this.map.invalidateSize(true);
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

    async showFacilityInformation(center: any, feature: any) {
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }
        let type = '';
        switch (feature.id.split('.')[0]) {
            case 'PS_COMB':
                type = '雨水口';
                break;
            case 'PS_MANHOLE':
                type = '检查井';
                break;
            case 'PS_VIRTUAL_POINT':
                type = '管线点';
                break;
            case 'PS_OUTFALL':
                type = '排放口';
                break;
            case 'PS_SEPTIC_TANK':
                type = '化粪池';
                break;
            case 'PS_PIPE':
                type = '圆管';
                break;
            case 'PS_CANAL':
                type = '渠箱';
                break;
        }
        let html = '';
        html += '<div style="font-size: 14px; font-weight: bold;">' + type + '</div>';
        html += '<div style="margin-top: 3px; font-size: 12px;">设施编号：' + feature.properties.id + '</div>';
        if (['检查井', '管点', '雨水口', '排放口'].indexOf(type) !== -1) {
            html += '<div style="margin-top: 3px; font-size: 12px;">系统属性：' + feature.properties.system_type + '</div>';
            html += '<div style="margin-top: 3px; font-size: 12px;">地面高程(m)：' + feature.properties.ground_level + '</div>';
            html += '<div style="margin-top: 3px; font-size: 12px;">底部高程(m)：' + feature.properties.invert_level + '</div>';
        } else if (['圆管', '渠箱'].indexOf(type) !== -1) {
            html += '<div style="margin-top: 3px; font-size: 12px;">系统属性：' + feature.properties.system_type + '</div>';
            html += '<div style="margin-top: 3px; font-size: 12px;">管径(mm)：' + feature.properties.width + '</div>';
            html += '<div style="margin-top: 3px; font-size: 12px;">管长(m)：'
                + (feature.properties.pipe_length ? feature.properties.pipe_length : feature.properties.canal_length).toFixed(3) + '</div>';
            html += '<div style="margin-top: 3px; font-size: 12px;">起点管底高程(m)：' +
            parseFloat(feature.properties.us_point_invert_level).toFixed(3) + '</div>';
            html += '<div style="margin-top: 3px; font-size: 12px;">终点管底高程(m)：' +
            parseFloat(feature.properties.ds_point_invert_level).toFixed(3) + '</div>';
        }
        this.popup = L.popup()
            .setLatLng(center)
            .setContent(html)
            .addTo(this.map);
    }

    async showInformation(item: any) {
        const center = this.mapToolService.mercatorToLonLat(item.x, item.y);
        this.map.setView(center, 18);
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }
        if (this.factorCache[item.id]) {
            this.showInfo(center, item);
        } else {
            this.apiService.getListByDeviceId(item.id).subscribe(res => {
                this.factorCache[item.id] = res.data;
                this.showInfo(center, item);
            });
        }
    }

    showInfo(center: any, item: any) {
        item.cp = typeof (item.cp) === 'string' ? JSON.parse(item.cp) : item.cp;
        let html = '';
        html += '<div style="font-size: 14px; font-weight: bold;">' + item.name + '</div>';
        html += '<div style="margin-top: 3px; font-size: 12px;">仪器编号：' + item.mn + '</div>';
        html += '<div style="font-size: 12px;">设备类型：' + item.typeName + '</div>';
        this.factorCache[item.id].forEach(factor => {
            if (item.cp[factor.code + '-Rtd'] !== undefined) {
                const unit = factor.densityUnit ? '(' + factor.densityUnit + ')' : '';
                html += '<div style="font-size: 12px;">' + factor.name + unit + '：'
                    + item.cp[factor.code + '-Rtd'] + '</div>';
            }
        });
        html += '<div style="font-size: 12px;">' + this.getTimeDesc(item) + '</div>';
        html += '<button class="device-location" style="width: 100%; line-height: 25px; ' +
            'margin-top: 5px; background: white; border: 1px solid darkgray;" id="' + item.id + '">历史监测信息查询</button>';
        html = html.replace(/undefined/g, '/');
        html = html.replace(/null/g, '/');
        this.popup = L.popup()
            .setLatLng(center)
            .setContent(html)
            .addTo(this.map);
        this.mn = item.mn;
        const buttons = document.getElementsByClassName('device-location');
        for (let i = 0; i < buttons.length; i++) {
            buttons.item(i).removeEventListener('click', null);
            buttons.item(i).addEventListener('click', () => {
                this.navCtrl.navigateForward('terminal/record/' + this.mn);
            });
        }
    }

    getTimeDesc(value: any): string {
        try {
            const dataTimeStr = this.datePipe.transform(value.dataTime, 'yyyy-MM-dd HH:mm:ss');
            const lastConnectTimeStr = this.datePipe.transform(value.lastConnectTime, 'yyyy-MM-dd HH:mm:ss');
            if (value.status === 0) {
                return '报警时间：' + dataTimeStr;
            } else if (value.status === 1) {
                return '预警时间：' + dataTimeStr;
            } else if (value.status === 2) {
                return '采集时间：' + dataTimeStr;
            } else if (value.status === 3) {
                if (value.lastConnectTime) {
                    return '最后通讯时间：' + lastConnectTimeStr;
                } else {
                    return '设备从未连接';
                }
            }
        } catch (e) { }
        return null;
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.navCtrl.back();
        });
    }

    getColor(device: any, type: number): string {
        let color = '';
        switch (device.status) {
            case 0:
                color = '#ff4d4f';
                break;
            case 1:
                color = '#faad14';
                break;
            case 2:
                color = '#1890ff';
                break;
            case 3:
                color = '#999';
                break;
        }
        if (type === 0) {
            return color;
        }
        return 'drop-shadow(32px 0 0 ' + color + ')';
    }

    /**
     * Return the WMS GetFeatureInfo URL for the passed map, layer and coordinate.
     * Specific parameters can be passed as params which will override the
     * calculated parameters of the same name.
     */
    private getFeatureInfoUrl(map, layer, latlng): string {
        // let point = map.latLngToContainerPoint(latlng, map.getZoom());
        // const size = map.getSize();
        const point = this.mapToolService.lonLat2Mercator(latlng);
        const tolerance = this.lelTolerance[map.getZoom() + 1] / 2;

        // const bounds = map.getBounds();
        // let sw = bounds.getSouthWest();
        // let ne = bounds.getNorthEast();

        // const BBOX = map.getBounds().toBBoxString();
        // sw = this.mapToolService.lonLat2Mercator(sw as LatLng);
        // ne = this.mapToolService.lonLat2Mercator(ne as LatLng);

        const defaultParams = {
            service: 'WMS',
            // version: layer._wmsVersion,
            version: '1.3.0',
            request: 'GetFeatureInfo',
            format: layer.options.format,
            TRANSPARENT: true,
            query_layers: layer.options.layers,
            layers: layer.options.layers,
            TILED: true,
            info_format: 'application/json',
            feature_count: 10,
            i: 50,
            j: 50,
            CRS: layer._crs.code,
            // height: size.y,
            // width: size.x,
            height: 101,
            width: 101,
            // bbox: [sw.gdX, sw.gdY, ne.gdX, ne.gdY].join(','),
            // bbox: [sw.gdX - 100, sw.gdY + 100, ne.gdX - 100, ne.gdY + 100].join(','),
            bbox: [point.gdX - tolerance, point.gdY - tolerance, point.gdX + tolerance, point.gdY + tolerance].join(','),
        };

        // params = L.Util.extend(defaultParams, params || {});

        // params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        // params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        // params.I = 50;
        // params.J = 50;

        return layer._url + L.Util.getParamString(defaultParams, layer._url, true);

    }

    async presentToast() {
        const toast = await this.toastController.create({
            message: '查询失败！',
            duration: 2000
        });
        toast.present();
    }
}
