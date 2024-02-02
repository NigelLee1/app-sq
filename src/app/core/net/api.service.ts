import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Md5} from "ts-md5";
import {BaseResult} from "../entity/base-result";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {
    }

    login(param: any): Observable<any> {
        return this.http.post('login?account=' + param.name + '&password=' + Md5.hashStr(param.password) + '&isApp=true', null);
    }

    getTaskList(param: any): Observable<any> {
        return this.http.post('drainage/getTaskList', param);
    }

    getUserInfo(): Observable<any> {
        return this.http.get('user/info');
    }

    getTaskDetail(id: number): Observable<any> {
        return this.http.get('drainage/getTaskDetail/' + id);
    }

    savePatrolTask(value: any): Observable<any> {
        return this.http.post('drainage/savePatrolTask', value);
    }

    getPatrolTaskDetail(param: any): Observable<any> {
        return this.http.post('drainage/getPatrolTaskDetail', param);
    }

    getTaskFacility(params: any): Observable<any> {
        return this.http.get('inspection/getTaskFacility', {
            params
        });
    }

    completeTask(id: number): Observable<any> {
        return this.http.get('drainage/completeTask/' + id);
    }

    getXcjlzb(id: any): Observable<any> {
        return this.http.get('drainage/getXcjlzb/' + id);
    }

    getTaskReceiver(): Observable<any> {
        return this.http.get('drainage/getTaskReceiver');
    }

    submitReceiver(param: any): Observable<any> {
        return this.http.post('drainage/submitReceiver', param);
    }

    getUndoTaskCount(): Observable<any> {
        return this.http.get('drainage/getUndoTaskCount');
    }

    getRepairList(param: any): Observable<any> {
        return this.http.post('drainage/getRepairList', param);
    }

    getRepairDetail(id: number): Observable<any> {
        return this.http.get('drainage/getRepairDetail/' + id);
    }

    getPsGxFault(fid: number): Observable<any> {
        return this.http.get('drainage/getPsGxFault/' + fid);
    }

    saveRepairTaskDec(value: any): Observable<any> {
        return this.http.post('drainage/saveRepairTaskDec', value);
    }

    completeRepair(value: any): Observable<any> {
        return this.http.post('drainage/completeRepair', value);
    }

    getOfflineCount(): Observable<any> {
        return this.http.get('device/offlineCount');
    }

    getSamplingRecord(param: any): Observable<any> {
        return this.http.post('sampling/getSamplingRecord', param);
    }

    getImmediateList(): Observable<any> {
        return this.http.get('drainage/getImmediateList');
    }

    queryFacilityDetail(param: any) {
        return this.http.post('drainage/getFacilityDetail', param);
    }

    getDeviceStatusList(): Observable<any> {
        return this.http.get('device/statusList');
    }

    getListByDeviceId(id: string): Observable<any> {
        return this.http.get('deviceFactor/getListByDeviceId/' + id);
    }

    getBxss(id: string): Observable<any> {
        return this.http.get('drainage/getBxss/' + id);
    }
}
