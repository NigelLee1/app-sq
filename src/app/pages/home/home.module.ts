import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import {HomePageRoutingModule} from './home-routing.module';
import {HomePage} from './home.page';
import {InspectionPage} from './inspection/inspection.page';
import {RepairPage} from './repair/repair.page';
import {CensusPage} from './census/census.page';
import {ReportPage} from './report/report.page';
import {FinishPage} from './inspection/finish/finish.page';
import {UnfinishedPage} from './inspection/unfinished/unfinished.page';
import {DetailPage} from './inspection/detail/detail.page';
import {ComponentModule} from '../../core/component/component.module';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {FacilityPage} from './inspection/facility/facility.page';
import {Camera} from '@ionic-native/camera/ngx';
import {MediaCapture} from '@ionic-native/media-capture/ngx';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {VideoPlayer} from '@ionic-native/video-player/ngx';
import {FileTransfer} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file/ngx';
import {ChoosePage} from './inspection/choose/choose.page';
import {NotRepairedPage} from './repair/not-repaired/not-repaired.page';
import {RepairedPage} from './repair/repaired/repaired.page';
import {RepairDetailPage} from './repair/repair-detail/repair-detail.page';
import {FaultPage} from './repair/fault/fault.page';
import {TerminalPage} from './terminal/terminal.page';
import {RecordPage} from './record/record.page';
import {ImmediatePage} from './immediate/immediate.page';

@NgModule({
    imports: [
        IonicModule,
        FormsModule,
        CommonModule,
        ComponentModule,
        HomePageRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [HomePage, InspectionPage, RepairPage, TerminalPage, CensusPage, ReportPage, FinishPage, RecordPage, ImmediatePage,
        UnfinishedPage, DetailPage, FacilityPage, ChoosePage, NotRepairedPage, RepairedPage, RepairDetailPage, FaultPage],
    entryComponents: [ChoosePage, FaultPage],
    providers: [Geolocation, Camera, MediaCapture, PhotoViewer, VideoPlayer, FileTransfer, File, DatePipe]
})
export class HomePageModule {
}
