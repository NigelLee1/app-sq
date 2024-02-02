import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {LoadingController, ModalController, NavController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {MediaCapture, MediaFile} from '@ionic-native/media-capture/ngx';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer/ngx';
import {environment} from '../../../../../environments/environment';
import {BaseResult} from '../../../../core/entity/base-result';
import {StatusCode} from '../../../../core/entity/status-code';
import {MsgService} from '../../../../core/utils/msg.service';
import {ApiService} from '../../../../core/net/api.service';

@Component({
    selector: 'app-fault',
    templateUrl: './fault.page.html',
    styleUrls: ['./fault.page.scss'],
})
export class FaultPage implements OnInit {
    tab = 'detail';
    @Input() rcId: string;
    @Input() fault: any;
    facility: any;
    reportForm: FormGroup;
    images = [];
    videos = [];
    @Input() isView: any;

    constructor(public camera: Camera,
                private transfer: FileTransfer,
                private msgService: MsgService,
                private mediaCapture: MediaCapture,
                public modalCtrl: ModalController,
                public photoViewer: PhotoViewer,
                private apiService: ApiService,
                private loadingController: LoadingController,
                private formBuilder: FormBuilder) {
        this.reportForm = formBuilder.group({
            fid: [''],
            ssbh: [''],
            fault: [''],
            type: [''],
            description: [''],
            iscom: [false],
            imgUrls: [''],
            videoUrls: ['']
        });
    }

    async ngOnInit() {
        console.log(this.isView);
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

    async saveRepairTaskDec(value: any) {
        this.reportForm.markAllAsTouched();
        if (this.reportForm.status === 'VALID') {
            // if (this.images.filter(item => item.status === 1).length > 0) {
            //     this.msgService.showToast('图片上传未完成，请稍后重试！');
            //     return;
            // }
            // if (this.videos.filter(item => item.status === 1).length > 0) {
            //     this.msgService.showToast('视频上传未完成，请稍后重试！');
            //     return;
            // }
            value.type = this.reportForm.controls.iscom.value ? 1 : 0;
            value.imgUrls = this.images.filter(item => item.status === 0)
                .map(item => item.url.replace(environment.serverUrl, '')).join(',');
            value.videoUrls = this.videos.filter(item => item.status === 0)
                .map(item => item.url.replace(environment.serverUrl, '')).join(',');
            const loading = await this.msgService.showLoading('数据提交中');
            this.apiService.saveRepairTaskDec(value).subscribe((res: BaseResult) => {
                if (res.state === StatusCode.SUCCESS) {
                    this.msgService.newRecordEvent.emit();
                    this.msgService.showToast('提交成功');
                    this.modalCtrl.dismiss({
                        refresh: true
                    });
                } else {
                    this.msgService.showToast(res.msg);
                }
            }, () => {}, () => {
                loading.dismiss();
            });
        }
    }

    async facilityLoaded(facility: any) {
        this.facility = facility;
        this.reportForm.controls.fid.setValue(this.fault.fid);
        this.reportForm.controls.ssbh.setValue(facility.code);
        this.reportForm.controls.fault.setValue(this.fault.fault);
        this.apiService.getPsGxFault(this.fault.fid).subscribe((res: BaseResult) => {
            if (res.state === StatusCode.SUCCESS) {
                this.reportForm.controls.description.setValue(res.data.wxbz);
                this.reportForm.controls.iscom.setValue(res.data.iscom);
                try {
                    const photos = res.data.zp.split(',');
                    photos.filter(photo => photo.length > 0).forEach(photo => {
                        this.images.push({
                            url: environment.serverUrl + photo,
                            status: 0
                        });
                    });
                } catch (e) { }
                try {
                    const photos = res.data.sp.split(',');
                    photos.filter(video => video.length > 0).forEach(video => {
                        this.videos.push({
                            url: environment.serverUrl + video,
                            status: 0
                        });
                    });
                } catch (e) { }
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {}, () => {
            this.loadingController.dismiss();
        });
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(102, async () => {
            this.modalCtrl.dismiss();
        });
    }

}
