import {Component} from '@angular/core';

import {LoadingController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {MsgService} from './core/utils/msg.service';
import {AppMinimize} from '@ionic-native/app-minimize/ngx';
import {Router} from '@angular/router';
import {ApiService} from './core/net/api.service';
import {TokenService} from './core/cache/token.service';
import {StatusCode} from './core/entity/status-code';
import {AppUpdate} from '@ionic-native/app-update/ngx';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private router: Router,
        private platform: Platform,
        private appUpdate: AppUpdate,
        private statusBar: StatusBar,
        private msgService: MsgService,
        private apiService: ApiService,
        private appMinimize: AppMinimize,
        private splashScreen: SplashScreen,
        private tokenService: TokenService,
        private loadingController: LoadingController
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (this.tokenService.getToken()) {
                this.apiService.getUserInfo().subscribe(res => {
                    if (res.state === StatusCode.SUCCESS) {
                        this.tokenService.setUser(res.data);
                    }
                }, () => {
                }, () => {
                    this.start();
                });
            } else {
                this.start();
            }
        });
    }

    // private jPushAddEventListener() {
    //     this.jPush.getUserNotificationSettings().then(result => {
    //         if (result === 0) {
    //             this.msgService.showToast('推送已被关闭');
    //         } else if (result > 0) {
    //
    //         }
    //     }).finally(() => {});
    // }

    start() {
        this.statusBar.styleDefault();
        if (this.platform.is('android')) {
            this.statusBar.overlaysWebView(true);
        }
        // this.initJPush();
        // this.jPushAddEventListener();
        // this.initMessageListener();
        this.splashScreen.hide();
        this.checkUpdate();
        this.msgService.updateEvent.subscribe(() => {
            this.checkUpdate(true);
        });
    }

    // initJPush() {
    //     if (!this.platform.is('mobile')) {
    //         return;
    //     }
    //     this.jPush.init();
    //     this.jPush.setDebugMode(true);
    // }
    //
    // initMessageListener() {
    //     this.receiveNotification();
    //     this.receiveMessage();
    // }

    // 收到通知时会触发该事件
    // receiveNotification() {
    //     document.addEventListener('jpush.receiveNotification', (event: any) => {
    //         let content;
    //         if (this.platform.is('ios')) {
    //             content = event.aps.alert;
    //         } else {
    //             content = JSON.stringify(event);
    //             alert(content);
    //         }
    //         this.jPush.setBadge(1);
    //         this.jPush.setApplicationIconBadgeNumber(1);
    //         this.msgService.notificationEvent.emit(content);
    //     }, false);
    // }

    // 收到自定义消息时触发这个事件
    // receiveMessage() {
    //     document.addEventListener('jpush.receiveMessage', (event: any) => {
    //         let message = '';
    //         if (this.platform.is('android')) {
    //             message = event.message;
    //         } else {
    //             message = event.content;
    //         }
    //         this.msgService.messageEvent.emit(message);
    //     }, false);
    // }

    private checkUpdate(manual?: boolean) {
        this.appUpdate.checkAppUpdate(environment.serverUrl + 'update/update.xml').then(res => {
            if (res.code === 202 && manual) {
                this.msgService.showToast('已经是最新版本');
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            if (manual) {
                this.loadingController.dismiss();
            }
        });
    }
}
