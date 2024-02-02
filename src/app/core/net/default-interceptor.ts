import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {TokenService} from '../cache/token.service';
import {Observable, of, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {catchError, mergeMap} from 'rxjs/operators';
import {LoadingController, NavController} from '@ionic/angular';
import {MsgService} from '../utils/msg.service';

@Injectable()
export class DefaultInterceptor implements HttpInterceptor {

    constructor(private injector: Injector,
                private nav: NavController,
                private tokenService: TokenService,
                private msgService: MsgService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let url = req.url;
        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = environment.serverUrl + url;
        }
        const param: any = {
            url
        };
        const token = this.tokenService.getToken();
        if (token) {
            param.setHeaders = {
                Authorization: 'Bearer ' + token
            };
        }
        return next.handle(req.clone(param)).pipe(
            mergeMap((event: any) => {
                // 允许统一对请求错误处理，这是因为一个请求若是业务上错误的情况下其HTTP请求的状态是200的情况下需要
                if (event instanceof HttpResponse && event.status === 200) {
                    return this.handleData(event);
                }
                // 若一切都正常，则后续操作
                return of(event);
            }),
            catchError((err: HttpErrorResponse) => this.handleData(err))
        );
    }

    private handleData(event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
        if (event.status > 0) {
            this.injector.get(HttpClient);
        }
        switch (event.status) {
            case 401:
                this.tokenService.clear();
                this.msgService.dismissLoading();
                this.nav.navigateRoot('login');
                break;
            default:
                if (event instanceof HttpErrorResponse) {
                    this.msgService.dismissLoading();
                    this.msgService.showToast('请求失败');
                    console.warn('未可知错误，大部分是由于后端不支持CORS或无效配置引起', event);
                    return throwError(event);
                }
                break;
        }
        return of(event);
    }
}
