import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {LoginPage} from './pages/login/login.page';
import {ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {DefaultInterceptor} from './core/net/default-interceptor';
import {HomePageModule} from './pages/home/home.module';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {JWTGuard} from './core/net/jwt.guard';
import {AppMinimize} from '@ionic-native/app-minimize/ngx';
import {AppUpdate} from '@ionic-native/app-update/ngx';
import {DeviceOrientation} from '@ionic-native/device-orientation/ngx';

@NgModule({
    declarations: [AppComponent, LoginPage],
    entryComponents: [],
    imports: [
        BrowserModule,
        HomePageModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
    ],
    providers: [
        JWTGuard,
        StatusBar,
        AppMinimize,
        AppVersion,
        SplashScreen,
        AppUpdate,
        DeviceOrientation,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
