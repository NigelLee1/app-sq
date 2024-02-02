import {AfterViewInit, Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ActionSheetController, AlertController, ModalController, NavController, Platform} from '@ionic/angular';
import {MsgService} from '../../../../core/utils/msg.service';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {MediaCapture, MediaFile, CaptureError, CaptureImageOptions} from '@ionic-native/media-capture/ngx';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {VideoPlayer} from '@ionic-native/video-player/ngx';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file/ngx';
import {BaseResult} from '../../../../core/entity/base-result';
import {StatusCode} from '../../../../core/entity/status-code';
import {UUID} from 'angular2-uuid';
import {ChoosePage} from '../choose/choose.page';
import {environment} from '../../../../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../../../core/net/api.service';
import {MapToolService} from '../../../../core/utils/map-tool.service';
import {
    DRAIN_COVER, EXIST_PROBLEM, EXIST_PROBLEM_HC, EXIST_PROBLEM_PM, EXIST_PROBLEM_SZ, EXIST_PROBLEM_XH,
    RAIN_WATER_GRATE, WELL_CONDITION_JCJ, WELL_CONDITION_YSK
} from '../../../../core/entity/map-config';
import {LatLng, Map} from 'leaflet';
import {Geolocation} from '@ionic-native/geolocation/ngx';

@Component({
    selector: 'app-facility',
    templateUrl: './facility.page.html',
    styleUrls: ['./facility.page.scss'],
})
export class FacilityPage implements AfterViewInit {
    @Input() hideHead: boolean;
    @Input() isModal: boolean;
    @Input() rcId: string;
    @Output() facilityLoaded: EventEmitter<any> = new EventEmitter();
    images = [];
    videos = [];
    locating = false;
    taskForm: FormGroup;
    code: any;
    maxDate: string;
    drainCoverList: any[];
    wellConditionList: any[];
    rainWaterGrateList: any[];
    existProblemList: any[];
    canChangeCode = false;
    title = '';
    editable = false;
    watchPosition: any;
    geoStr: string;

    constructor(private file: File,
                public camera: Camera,
                public nav: NavController,
                private route: ActivatedRoute,
                private transfer: FileTransfer,
                private msgService: MsgService,
                private videoPlayer: VideoPlayer,
                public photoViewer: PhotoViewer,
                private formBuilder: FormBuilder,
                private apiService: ApiService,
                private mapToolService: MapToolService,
                private mediaCapture: MediaCapture,
                private geolocation: Geolocation,
                public modalController: ModalController,
                public actionSheetController: ActionSheetController,
                public alertController: AlertController
    ) {
        this.drainCoverList = DRAIN_COVER;
        this.rainWaterGrateList = RAIN_WATER_GRATE;
        this.maxDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString();
        this.taskForm = formBuilder.group({
            id: ['', Validators.required],
            code: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50)])],
            type: ['', Validators.required],
            pcId: ['', Validators.required],
            coordinate: [''],
            coordinateStr: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            description: [''],
            attribute: [''],
            drainCover: [null],
            wellCondition: [null],
            deposition: [-1],
            waterLevel: [-1],
            waterQuality: [-1],
            rainWaterGrate: [null],
            existingProblems: [null],
            leakageTime: [null],
            leakageRate: [null],
            overflow: [null],
            overflowTime: [null],
            flowBackwardRate: [null],
            flowBackwardTime: [null],
            photoUrls: [''],
            videoUrls: ['']
        });
    }

    ngAfterViewInit(): void {
        Promise.all([new Promise(resolve => {
            this.route.params.subscribe(path => {
                resolve(path.pcId);
            }).unsubscribe();
        }), new Promise(resolve => {
            this.route.queryParams.subscribe((params: Params) => {
                resolve(params);
            }).unsubscribe();
        })]).then((res) => {
            this.taskForm.controls.pcId.setValue(res[0]);
            if (this.rcId) {
                this.initParam({
                    rcId: this.rcId
                });
            } else {
                this.initParam(res[1]);
            }
        });
    }

    async initParam(params: any) {
        const loading = await this.msgService.showLoading('努力加载中');
        if (params.id) {
            this.apiService.getBxss(params.id).subscribe((res: BaseResult) => {
                this.initByType(res, loading);
                // this.geoStr = res.data.geoStr;
                // const points = this.mapToolService.read();
                // if (points.type === 'point') {
                //     const point = this.mapToolService.mercatorToLonLat(points.features[0], points.features[1]);
                // }
            });
        } else if (params.rcId) {
            this.apiService.getXcjlzb(params.rcId).subscribe((res: BaseResult) => {
                this.initByType(res, loading);
            });
        } else {
            this.editable = true;
            this.title = '新建' + params.type + '记录';
            this.taskForm.controls.id.setValue(UUID.UUID());
            this.taskForm.controls.type.setValue(params.type);
            this.initChooseList(params.type);
            loading.dismiss();
            this.locate();
        }
    }

    initByType(res: any, loading: any) {
        if (res.state === StatusCode.SUCCESS) {
            this.editable = res.data.editable && res.data.zt === 0 && this.rcId === undefined;
            this.initChooseList(res.data.sslc);
            if (res.data.recordId) {
                this.title = res.data.sslc + '记录';
                this.queryData(res.data, loading);
            } else {
                this.title = '新建' + res.data.sslc + '记录';
                this.taskForm.controls.id.setValue(UUID.UUID());
                this.taskForm.controls.type.setValue(res.data.sslc);
                this.taskForm.controls.code.setValue(res.data.ssbh);
                this.taskForm.controls.pcId.setValue(res.data.pcId);
                this.locate();
                loading.dismiss();
            }
        }
    }

    initChooseList(type: string) {
        this.canChangeCode = !this.rcId;
        if (type === '检查井') {
            this.wellConditionList = WELL_CONDITION_JCJ;
        } else if (type === '雨水口') {
            this.wellConditionList = WELL_CONDITION_YSK;
        } else if (type === '排放口') {
            this.existProblemList = EXIST_PROBLEM;
        } else if (type === '拍门') {
            this.existProblemList = EXIST_PROBLEM_PM;
        } else if (type === '渠箱' || type === '圆管') {
            this.existProblemList = EXIST_PROBLEM_XH;
        } else if (type === '闸门') {
            this.existProblemList = EXIST_PROBLEM_SZ;
        } else if (type === '河涌') {
            this.existProblemList = EXIST_PROBLEM_HC;
        } else if (type === '其它') {
            this.taskForm.controls.code.clearValidators();
            this.taskForm.controls.code.setErrors(null);
        }
    }

    async queryData(param: any, loading: any) {
        this.apiService.getPatrolTaskDetail(param).subscribe((res: BaseResult) => {
            if (res.state === 0) {
                const facilities = res.data.facilities;
                this.taskForm.controls.id.setValue(res.data.id);
                this.taskForm.controls.type.setValue(res.data.type);
                this.taskForm.controls.pcId.setValue(res.data.pcId);
                this.taskForm.controls.code.setValue(res.data.code);
                this.taskForm.controls.coordinate.setValue(res.data.coordinate);
                this.taskForm.controls.coordinateStr.setValue( this.mapToolService.formatLocateStr(res.data.coordinate.lng, 5) + '，' +
                    this.mapToolService.formatLocateStr(res.data.coordinate.lat, 5));
                if (facilities !== undefined) {
                    try { this.taskForm.controls.attribute.setValue(facilities.sX); } catch (e) {}
                    try { this.taskForm.controls.deposition.setValue(facilities.yJSD); } catch (e) {}
                    try { this.taskForm.controls.waterLevel.setValue(facilities.sWZK); } catch (e) {}
                    try { this.taskForm.controls.waterQuality.setValue(facilities.sZZK); } catch (e) {}
                    try { this.taskForm.controls.overflow.setValue(facilities.yLL); } catch (e) {}
                    try { this.taskForm.controls.leakageRate.setValue(facilities.lSL); } catch (e) {}
                    try { this.taskForm.controls.flowBackwardRate.setValue(facilities.dGL); } catch (e) {}
                    try {
                        this.taskForm.controls.overflowTime.setValue(new Date(facilities.yLSJ).toISOString());
                    } catch (e) {}
                    try {
                        this.taskForm.controls.leakageTime.setValue(new Date(facilities.lSSJ).toISOString());
                    } catch (e) {}
                    try {
                        this.taskForm.controls.flowBackwardTime.setValue(new Date(facilities.dGSJ).toISOString());
                    } catch (e) {}
                    try { this.taskForm.controls.description.setValue(facilities.bZ); } catch (e) {}
                    try {
                        this.taskForm.controls.drainCover.setValue(this.drainCoverList.filter(item => {
                            const key = item.value.substr(0, 1).toLowerCase() + item.value.substr(1);
                            console.log(facilities[key]);
                            return facilities[key];
                        }).map(item => item.value));
                    } catch (e) {}
                    try {
                        this.taskForm.controls.wellCondition.setValue(this.wellConditionList.filter(item => {
                            const key = item.value.substr(0, 1).toLowerCase() + item.value.substr(1);
                            return facilities[key];
                        }).map(item => item.value));
                    } catch (e) { }
                    try {
                        this.taskForm.controls.rainWaterGrate.setValue(this.rainWaterGrateList.filter(item => {
                            const key = item.value.substr(0, 1).toLowerCase() + item.value.substr(1);
                            return facilities[key];
                        }).map(item => item.value));
                    } catch (e) { }
                    try {
                        this.taskForm.controls.existingProblems.setValue(this.existProblemList.filter(item => {
                            const key = item.value.substr(0, 1).toLowerCase() + item.value.substr(1);
                            return facilities[key];
                        }).map(item => item.value));
                    } catch (e) { }
                }
                try {
                    res.data.imgUrls.split(',').filter(url => url.length > 0).map(url => environment.serverUrl + url).forEach(imgUrl => {
                        this.images.push({
                            url: imgUrl,
                            status: 0
                        });
                    });
                } catch (e) {}
                try {
                    res.data.videoUrls.split(',').filter(url => url.length > 0)
                        .map(url => environment.serverUrl + url).forEach(videoUrl => {
                        this.videos.push({
                            url: videoUrl,
                            status: 0
                        });
                    });
                } catch (e) {}
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {}, () => {
            if (this.rcId) {
                this.facilityLoaded.emit(this.taskForm.value);
                if (this.isModal) {
                    loading.dismiss();
                }
            } else {
                loading.dismiss();
            }
        });
    }

    locate() {
        if (this.locating) {
            return;
        }
        this.locating = true;
        this.geolocation.getCurrentPosition().then(res => {
            if (this.watchPosition) {
                this.watchPosition.unsubscribe();
            }
            this.taskForm.controls.coordinate.setValue(new LatLng(res.coords.latitude, res.coords.longitude));
            this.taskForm.controls.coordinateStr.setValue( res.coords.longitude.toFixed(5) + '，' + res.coords.latitude.toFixed(5));
            this.watchPosition = this.geolocation.watchPosition({
                enableHighAccuracy: true
            }).subscribe(resp => {
                this.taskForm.controls.coordinate.setValue(new LatLng(resp.coords.latitude, resp.coords.longitude));
                this.taskForm.controls.coordinateStr.setValue( resp.coords.longitude.toFixed(5) + '，' + resp.coords.latitude.toFixed(5));
            });
        }).catch(error => {
            if (error === 'plugin_not_installed') {
                setTimeout(() => {
                    this.locate();
                }, 200);
            }
        }).finally(() => {
            this.locating = false;
        });
    }

    async chooseSource(mediaType: number) {
        this.selectData(mediaType, this.camera.PictureSourceType.CAMERA);
        // const actionSheet = await this.actionSheetController.create({
        //     header: '选择照片来源',
        //     buttons: [
        //         {
        //             text: '打开摄像头',
        //             icon: 'camera',
        //             handler: () => {
        //                 this.selectData(mediaType, this.camera.PictureSourceType.CAMERA);
        //             }
        //         }, {
        //             text: '从相册中选取',
        //             icon: 'image',
        //             handler: () => {
        //                 this.selectData(mediaType, this.camera.PictureSourceType.SAVEDPHOTOALBUM);
        //             }
        //         }, {
        //             text: '取消',
        //             icon: 'close',
        //             role: 'cancel'
        //         }]
        // });
        // await actionSheet.present();
    }

    selectData(mediaType: number, sourceType?: number) {
        if ((mediaType === this.camera.MediaType.VIDEO && sourceType === this.camera.PictureSourceType.CAMERA)) {
            this.mediaCapture.captureVideo().then((data: MediaFile[]) => {
                this.upload(data[0].fullPath);
            });
        } else {
            const options: CameraOptions = {
                quality: 100, // 图片质量
                destinationType: mediaType === this.camera.MediaType.VIDEO ? this.camera.DestinationType.DATA_URL
                    : this.camera.DestinationType.DATA_URL, // 返回类型 .FILE_URI 返回文件地址 .DATA_URL 返回base64编码
                saveToPhotoAlbum: false, // 是否保存到相册
                correctOrientation: true, // 设置摄像机拍摄的图像是否为正确的方向
                sourceType,
                mediaType // 媒体类型
            };
            if (mediaType !== this.camera.MediaType.VIDEO) {
                options.encodingType = this.camera.EncodingType.JPEG;
            }
            this.camera.getPicture(options).then(data => {
                if (mediaType === this.camera.MediaType.VIDEO && sourceType === this.camera.PictureSourceType.SAVEDPHOTOALBUM) {
                    this.upload(data);
                } else {
                    this.upload('data:image/jpeg;base64,' + data);
                }
            });
        }
    }

    upload(fileUrl: string) {
        const fileTransfer: FileTransferObject = this.transfer.create();
        const options: FileUploadOptions = {
            fileKey: 'file',
            fileName: fileUrl.startsWith('data:image') ? 'image.jpg' : 'video' + fileUrl.substr(fileUrl.lastIndexOf('.'))
        };
        const tempId = new Date().getTime();
        if (options.fileName.endsWith('jpg')) {
            this.images.push({
                id: tempId,
                url: fileUrl,
                status: 1
            });
        } else {
            this.videos.push({
                id: tempId,
                url: '',
                status: 1
            });
        }
        fileTransfer.upload(fileUrl, environment.serverUrl + 'file/upload/patrolFile', options)
            .then(data => {
                const result: any = JSON.parse(data.response);
                if (result.name) {
                    if (options.fileName.endsWith('jpg')) {
                        this.images.filter(item => item.id === tempId).forEach(item => {
                            item.url = environment.serverUrl + result.url;
                            item.status = 0;
                        });
                    } else {
                        this.videos.filter(item => item.id === tempId).forEach(item => {
                            item.url = environment.serverUrl + result.url;
                            item.status = 0;
                        });
                    }
                } else {
                    this.msgService.showToast(result.msg);
                }
            }, err => {
                if (options.fileName.endsWith('jpg')) {
                    this.images.filter(item => item.id === tempId).forEach(item => {
                        item.status = 3;
                    });
                } else {
                    this.videos.filter(item => item.id === tempId).forEach(item => {
                        item.status = 3;
                    });
                }
                this.msgService.showToast('上传失败，原因：' + JSON.stringify(err));
            });
    }

    async changeLocate(type: string) {
        const modal = await this.modalController.create({
            component: ChoosePage,
            componentProps: {
                taskForm: this.taskForm,
                openType: type,
            }
        });
        await modal.present();
    }

    async submitTask(value: any) {
        this.taskForm.markAllAsTouched();
        if (this.taskForm.status === 'VALID') {
            // if (this.images.length === 0 && this.videos.length === 0) {
            //     this.msgService.showToast('请上传照片或视频！');
            //     return;
            // }
            if (this.images.filter(item => item.status === 1).length > 0) {
                this.msgService.showToast('图片上传未完成，请稍后重试！');
                return;
            }
            if (this.videos.filter(item => item.status === 1).length > 0) {
                this.msgService.showToast('视频上传未完成，请稍后重试！');
                return;
            }
            const latLng: LatLng = this.mapToolService.transformFromWGSToGCJ(value.coordinate);
            value.gdPoint = this.mapToolService.lonLat2Mercator(latLng);
            value.imgUrls = this.images.filter(item => item.status === 0)
                .map(item => item.url.replace(environment.serverUrl, '')).join(',');
            value.videoUrls = this.videos.filter(item => item.status === 0)
                .map(item => item.url.replace(environment.serverUrl, '')).join(',');
            value.drainCover = this.mapToolService.convertListToIntArray(value.drainCover, this.drainCoverList);
            value.rainWaterGrate = this.mapToolService.convertListToIntArray(value.rainWaterGrate, this.rainWaterGrateList);
            value.wellCondition = this.mapToolService.convertListToIntArray(value.wellCondition, this.wellConditionList);
            value.existingProblems = this.mapToolService.convertListToIntArray(value.existingProblems, this.existProblemList);
            const loading = await this.msgService.showLoading('数据提交中');
            this.apiService.savePatrolTask(value).subscribe((res: BaseResult) => {
                if (res.state === StatusCode.SUCCESS) {
                    this.msgService.newRecordEvent.emit();
                    this.msgService.showToast('提交成功');
                    this.nav.back();
                } else {
                    this.msgService.showToast(res.msg);
                }
            }, () => {}, () => {
                loading.dismiss();
            });
        } else {
            this.msgService.showToast('请填写后提交');
        }
    }

    async back() {
        if (this.title.indexOf('新建') !== -1) {
            const alert = await this.alertController.create({
                header: '尚未保存，是否确认离开？',
                buttons: [
                    {
                        text: '取消',
                        role: 'cancel',
                        cssClass: 'secondary'
                    }, {
                        text: '确定',
                        handler: () => {
                            this.nav.back();
                        }
                    }
                ]
            });
            await alert.present();
        } else {
            this.nav.back();
        }
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            if (this.isModal) {
                this.modalController.dismiss();
            } else {
                this.back();
            }
        });
    }
}
