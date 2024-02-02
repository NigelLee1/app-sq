import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../../../core/net/api.service';
import {MsgService} from '../../../../core/utils/msg.service';
import {AlertController, NavController} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {BaseResult} from '../../../../core/entity/base-result';
import {StatusCode} from '../../../../core/entity/status-code';

@Component({
    selector: 'app-unfinished',
    templateUrl: './unfinished.page.html',
    styleUrls: ['./unfinished.page.scss'],
})
export class UnfinishedPage implements OnDestroy, AfterViewInit {
    taskList = [];
    loadEvent;
    param = {
        pageNum: 1,
        pageSize: 10,
        zt: 0
    };
    readEvent: Subscription;
    queryLoading: any;

    constructor(private apiService: ApiService,
                public navController: NavController,
                private alertController: AlertController,
                private msgService: MsgService) {
        msgService.completeEvent.subscribe(res => {
            this.queryData();
        });
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
            if (this.queryLoading) {
                this.queryLoading.dismiss();
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

    async completeTask(item: any) {
        const alert = await this.alertController.create({
            header: '确认结束任务？',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: '确定',
                    handler: () => {
                        this.finishTask(item.id);
                    }
                }
            ]
        });
        await alert.present();
    }

    async finishTask(id: number) {
        const loading: any = await this.msgService.showLoading('数据提交中');
        this.apiService.completeTask(id).subscribe((res: BaseResult) => {
            if (res.state === StatusCode.SUCCESS) {
                this.msgService.completeEvent.emit();
                this.msgService.showToast('操作成功');
            } else {
                this.msgService.showToast(res.msg);
            }
        }, () => {}, () => {
            loading.dismiss();
        });
    }

    ngAfterViewInit(): void {
        this.queryData();
        this.readEvent = this.msgService.readEvent.subscribe((id: number) => {
            this.taskList.filter(item => item.id === id).forEach(item => {
                item.att = true;
            });
        });
    }

}
