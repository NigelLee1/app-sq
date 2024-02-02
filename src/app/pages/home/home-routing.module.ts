import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {HomePage} from './home.page';
import {InspectionPage} from './inspection/inspection.page';
import {RepairPage} from './repair/repair.page';
import {CensusPage} from './census/census.page';
import {FinishPage} from './inspection/finish/finish.page';
import {UnfinishedPage} from './inspection/unfinished/unfinished.page';
import {JWTGuard} from '../../core/net/jwt.guard';
import {DetailPage} from './inspection/detail/detail.page';
import {FacilityPage} from './inspection/facility/facility.page';
import {NotRepairedPage} from './repair/not-repaired/not-repaired.page';
import {RepairedPage} from './repair/repaired/repaired.page';
import {RepairDetailPage} from './repair/repair-detail/repair-detail.page';
import {TerminalPage} from './terminal/terminal.page';
import {RecordPage} from './record/record.page';
import {ImmediatePage} from './immediate/immediate.page';

const routes: Routes = [
    {
        path: '',
        component: HomePage,
        canActivate: [JWTGuard]
    },
    {
        path: 'inspection',
        component: InspectionPage
    },
    {
        path: 'repair',
        component: RepairPage
    },
    {
        path: 'terminal',
        component: TerminalPage
    },
    {
        path: 'census',
        component: CensusPage
    },
    {
        path: 'task/detail/:pcId',
        component: DetailPage
    },
    {
        path: 'task/detail/:pcId/facility',
        component: FacilityPage
    },
    {
        path: 'repair/detail/:id',
        component: RepairDetailPage
    },
    {
        path: 'terminal',
        component: TerminalPage
    },
    {
        path: 'terminal/record/:mn',
        component: RecordPage
    },
    {
        path: 'immediate',
        component: ImmediatePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HomePageRoutingModule {
}
