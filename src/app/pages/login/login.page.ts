import {Component, HostListener} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController} from '@ionic/angular';
import {BaseResult} from '../../core/entity/base-result';
import {ApiService} from '../../core/net/api.service';
import {TokenService} from '../../core/cache/token.service';
import {HttpClient} from '@angular/common/http';
import {MsgService} from '../../core/utils/msg.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    loginForm: FormGroup;

    constructor(private http: HttpClient,
                private apiService: ApiService,
                private navCtrl: NavController,
                private msgService: MsgService,
                private formBuilder: FormBuilder,
                private tokenService: TokenService) {
        if (tokenService.getToken()) {
            navCtrl.navigateRoot('home');
            return;
        }
        this.loginForm = formBuilder.group({
            name: [tokenService.getLastLoginAccount(), Validators.compose([Validators.required, Validators.minLength(5)])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });
    }

    async login(event?: KeyboardEvent) {
        if (event && 13 !== event.keyCode) {
            return;
        }
        const param = this.checkParseParam();
        if (!param) {
            return;
        }
        const loading: any = await this.msgService.showLoading('登录中');
        this.apiService.login(param).subscribe((res: BaseResult) => {
            if (res.state === 0) {
                this.tokenService.setUser(res.data);
                this.navCtrl.navigateRoot('home');
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {
        }, () => {
            loading.dismiss();
        });
    }

    private checkParseParam() {
        let result = this.loginForm.getRawValue();
        for (const resultKey in result) {
            if (result.hasOwnProperty(resultKey)) {
                if (resultKey === 'name') {
                    result[resultKey] = result[resultKey].trim();
                }
                if (result[resultKey].length === 0) {
                    this.msgService.showToast('请输入账号和密码');
                    result = null;
                    break;
                }
            }
        }
        return result;
    }


    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            // @ts-ignore
            navigator.app.exitApp();
        });
    }
}
