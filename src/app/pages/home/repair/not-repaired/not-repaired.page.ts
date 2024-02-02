import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MsgService} from '../../../../core/utils/msg.service';
import {ApiService} from '../../../../core/net/api.service';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-not-repaired',
  templateUrl: './not-repaired.page.html',
  styleUrls: ['./not-repaired.page.scss'],
})
export class NotRepairedPage implements OnDestroy, AfterViewInit {
  param = {
    pageNum: 1,
    pageSize: 10,
    status: 0
  };
  queryLoading: any;
  repairList = [];
  loadEvent;

  constructor(private msgService: MsgService,
              public navController: NavController,
              private apiService: ApiService) {
    msgService.finishRepairEvent.subscribe(res => {
      this.queryData();
    });
    msgService.repairReadEvent.subscribe(id => {
      this.repairList.filter(item => parseInt(item.id, 0) === parseInt(id, 0)).forEach(item => {
        item.haveRead = true;
      });
    });
  }

  ngAfterViewInit(): void {
    this.queryData();
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

  loadData(event) {
    this.loadEvent = event;
    this.queryData(2, event);
  }

  doRefresh(event) {
    this.queryData(1, event);
  }

  ngOnDestroy(): void {
  }

}
