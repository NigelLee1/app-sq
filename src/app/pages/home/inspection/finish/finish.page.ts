import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../../../core/net/api.service';
import {MsgService} from '../../../../core/utils/msg.service';
import {Subscription} from 'rxjs';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-finish',
    templateUrl: './finish.page.html',
    styleUrls: ['./finish.page.scss'],
})
export class FinishPage implements OnDestroy, AfterViewInit {
    readEvent: Subscription;
    taskList = [];
    loadEvent;
    param = {
        pageNum: 1,
        pageSize: 10,
        zt: 1
    };

    constructor(private apiService: ApiService,
                private navController: NavController,
                private msgService: MsgService) {
        msgService.completeEvent.subscribe(res => {
            this.queryData();
        });
    }

    async queryData(type?: number, event?) {
        let loading: any;
        if (type === 1) {
            this.param.pageNum = 1;
        } else if (type === 2) {
            this.param.pageNum += 1;
        } else {
            loading = await this.msgService.showLoading('正在查询');
            this.param.pageNum = 1;
        }
        this.apiService.getTaskList(this.param).subscribe(res => {
            if (res.state === 0) {
                if (res.data.isFirstPage || res.data.total === 0) {
                    this.taskList = res.data.list;
                    if (this.loadEvent) {
                        this.loadEvent.target.disabled = false;
                    }
                } else {
                    this.taskList = [...this.taskList, ...res.data.list];
                    if (this.loadEvent && res.data.isLastPage) {
                        this.loadEvent.target.disabled = true;
                    }
                }
            }
        }, () => {
        }, () => {
            if (loading) {
                loading.dismiss();
            }
            if (event) {
                event.target.complete();
            }
        });
    }

    loadData(event) {
        this.loadEvent = event;
        this.queryData(2, event);
    }

    doRefresh(event) {
        this.queryData(1, event);
    }

    ngOnDestroy(): void {
      this.readEvent.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.readEvent = this.msgService.readEvent.subscribe((id: number) => {
            this.taskList.filter(item => item.id === id).forEach(item => {
                item.att = true;
            });
        });
        this.queryData();
    }

}
