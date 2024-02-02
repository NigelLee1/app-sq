import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {MsgService} from '../../../../core/utils/msg.service';
import {ApiService} from '../../../../core/net/api.service';

@Component({
    selector: 'app-repaired',
    templateUrl: './repaired.page.html',
    styleUrls: ['./repaired.page.scss'],
})
export class RepairedPage implements AfterViewInit {
    repairList = [];
    param = {
        pageNum: 1,
        pageSize: 10,
        status: 1
    };
    queryLoading: any;
    loadEvent;

    constructor(public navController: NavController,
                private msgService: MsgService,
                private apiService: ApiService) {
    }

    ngAfterViewInit(): void {
        this.queryData();
    }

    doRefresh(event) {
        this.queryData(1, event);
    }

    loadData(event) {
        this.loadEvent = event;
        this.queryData(2, event);
    }

    async queryData(type?: number, event?) {
        if (type === 1) {
            this.param.pageNum = 1;
        } else if (type === 2) {
            this.param.pageNum += 1;
        } else {
            this.queryLoading = await this.msgService.showLoading('正在查询');
            this.param.pageNum = 1;
        }
        this.apiService.getRepairList(this.param).subscribe(res => {
            if (res.state === 0) {
                if (res.data.isFirstPage || res.data.total === 0) {
                    this.repairList = res.data.list;
                    if (this.loadEvent) {
                        this.loadEvent.target.disabled = false;
                    }
                } else {
                    this.repairList = [...this.repairList, ...res.data.list];
                    if (this.loadEvent && res.data.isLastPage) {
                        this.loadEvent.target.disabled = true;
                    }
                }
            }
        }, () => {
        }, () => {
            if (this.queryLoading) {
                this.queryLoading.dismiss();
            }
            if (event) {
                event.target.complete();
            }
        });
    }
}
