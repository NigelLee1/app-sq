import {EventEmitter, Injectable} from '@angular/core';
import {LoadingController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MsgService {
  public readEvent: EventEmitter<any> = new EventEmitter<any>();
  public repairReadEvent: EventEmitter<any> = new EventEmitter<any>();
  public newRecordEvent: EventEmitter<void> = new EventEmitter<void>();
  public completeEvent: EventEmitter<void> = new EventEmitter<void>();
  public notificationEvent: EventEmitter<any> = new EventEmitter<any>();
  public messageEvent: EventEmitter<any> = new EventEmitter<any>();
  public finishRepairEvent: EventEmitter<void> = new EventEmitter<void>();
  public updateEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(private loadingController: LoadingController,
              private toastController: ToastController) { }

  async showLoading(msg: string, durat?: number) {
    const loading = await this.loadingController.create({
      message: msg,
      duration: durat,
    });
    await loading.present();
    return loading;
  }

  dismissLoading() {
    this.loadingController.dismiss().finally(() => {});
  }

  async showToast(msg: string) {
    this.toastController.dismiss().finally(() => { });
    const toast = await this.toastController.create({
      message: msg,
      duration: 1000
    });
    await toast.present();
    return toast;
  }
}
