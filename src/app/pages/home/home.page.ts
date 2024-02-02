import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertController, NavController, Platform, ToastController} from '@ionic/angular';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {TokenService} from '../../core/cache/token.service';
import {AppMinimize} from '@ionic-native/app-minimize/ngx';
import {MsgService} from '../../core/utils/msg.service';
import {ApiService} from '../../core/net/api.service';
import {BaseResult} from '../../core/entity/base-result';
import {StatusCode} from '../../core/entity/status-code';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy, OnInit {
    version: string;

    constructor(
        public platform: Platform,
        public nav: NavController,
        private appVersion: AppVersion,
        public tokenService: TokenService,
        private appMinimize: AppMinimize,
        private msgService: MsgService,
        private apiService: ApiService,
        public toastController: ToastController,
        public alertController: AlertController
    ) {
    }

    ngAfterViewInit() {
        this.msgService.notificationEvent.subscribe(() => {
            this.queryUndoTaskCount();
        });
        this.initVersion();
        // this.resumeJPush();
        this.queryDeviceStatus(true);
        setTimeout(() => {
            this.queryDeviceStatus(false);
        }, 60000);
    }

    ionViewWillEnter() {
        this.queryUndoTaskCount();
    }

    // resumeJPush() {
    //     this.jPush.isPushStopped().then(status => {
    //         if (status !== 0) {
    //             this.jPush.resumePush().catch(e => console.log(e));
    //         }
    //         this.jPush.setAlias({
    //             sequence: this.tokenService.getUser().sequence,
    //             alias: this.tokenService.getUser().name
    //         }).then().catch().finally();
    //
    //     }, e => {
    //         if (e === 'plugin_not_installed') {
    //             setTimeout(() => {
    //                 this.resumeJPush();
    //             }, 200);
    //         }
    //     });
    // }

    private initVersion() {
        this.appVersion.getVersionNumber()
            .then(versionStr => {
                this.version = versionStr;
            }).catch(e => {
                if (e === 'plugin_not_installed') {
                    setTimeout(() => {
                        this.initVersion();
                    }, 200);
                }
        }).finally();
    }

    async logout() {
        const alert = await this.alertController.create({
            header: '确认退出登录？',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: '确定',
                    handler: () => {
                        this.tokenService.clear();
                        this.nav.navigateRoot('login');
                    }
                }
            ]
        });
        await alert.present();
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.appMinimize.minimize();
        });
    }

    ngOnDestroy(): void {
        // this.jPush.stopPush();
    }

    queryUndoTaskCount() {
        this.apiService.getUndoTaskCount().subscribe((res: BaseResult) => {
            if (res.state === StatusCode.SUCCESS) {
                document.getElementById('badge').hidden = res.data === 0;
                document.getElementById('badge').innerText = res.data;
            }
        });
    }

    async checkUpdate() {
        await this.msgService.showLoading('正在获取新版本');
        this.msgService.updateEvent.emit();
    }

    queryDeviceStatus(showToast: boolean) {
        this.apiService.getOfflineCount().subscribe(offlineCount => {
            document.getElementById('offline').hidden = offlineCount === 0;
            document.getElementById('offline').innerText = offlineCount;
            if (offlineCount > 0 && showToast) {
                this.presentToast(offlineCount);
            }
        });
    }

    async presentToast(count) {
        const toast = await this.toastController.create({
            message: '终端检测: 检测到有' + count + '台仪器离线！',
            duration: 2000
        });
        toast.present();
    }

    ngOnInit(): void {
    }

}
