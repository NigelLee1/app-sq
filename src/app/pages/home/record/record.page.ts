import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import * as Highcharts from 'highcharts';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../core/net/api.service';
import {DatePipe} from '@angular/common';
import {MsgService} from '../../../core/utils/msg.service';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-record',
    templateUrl: './record.page.html',
    styleUrls: ['./record.page.scss'],
})
export class RecordPage implements AfterViewInit {
    start: any;
    end: any;
    name: any;
    mn: any;
    @ViewChild('linechart', {static: true}) lineChartDiv: ElementRef;
    series = [];

    constructor(private route: ActivatedRoute,
                private datePipe: DatePipe,
                private msgService: MsgService,
                public navCtrl: NavController,
                private apiService: ApiService) {
        this.start = datePipe.transform(new Date().getTime() - 2 * (32 * 60 * 60 * 1000), 'yyyy-MM-dd');
        this.end = datePipe.transform(new Date().getTime(), 'yyyy-MM-dd');
    }

    ngAfterViewInit(): void {
        this.route.params.subscribe(param => {
            this.mn = param.mn;
            this.query();
        });
    }

    async query() {
        if (this.series.length === 0) {
            await this.msgService.showLoading('数据加载中');
        }
        Highcharts.charts.forEach(value => {
            value.showLoading('加载中');
        });
        this.apiService.getSamplingRecord({
            cn: '2011',
            normal: true,
            mns: [this.mn],
            start: new Date(this.datePipe.transform(this.start, 'yyyy-MM-dd') + ' 00:00:00'),
            end: new Date(this.datePipe.transform(this.end, 'yyyy-MM-dd') + ' 23:59:59'),
        }).subscribe(res => {
            this.name = res.data.name;
            const chartHtml = (this.lineChartDiv.nativeElement as HTMLElement);
            chartHtml.innerHTML = '';
            this.series = [];
            res.data.series.forEach(item => {
                const factor = res.data.factorList.filter(i => i.name === item.name)[0];
                this.series.push({
                    title: item.name,
                    data: item.data.map(point => {
                        const date = new Date(point[0]);
                        return [Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
                            date.getMinutes(), date.getSeconds()), point[1]];
                    }),
                    color: factor.color,
                    unit: factor.densityUnit,
                    markLine: item.markLine,
                    min: factor.min,
                    max: factor.max
                });
            });
            this.series.forEach(value => {
                const htmlElement = document.createElement('div');
                htmlElement.className = 'chart';
                chartHtml.appendChild(htmlElement);
                const factor = res.data.factorList.filter(item => item.name === value.title)[0];
                const plotLines = [];
                if (factor.ground) {
                    try {
                        value.markLine.data.forEach(mark => {
                            // console.log(mark.lineStyle.color, mark.yAxis);
                            plotLines.push({
                                color: mark.lineStyle.color,
                                dashStyle: 'Dot',
                                width: 2,
                                value: mark.yAxis,
                                label: {
                                    align: 'center',
                                    style: {
                                        fontStyle: 'italic'
                                    },
                                    text: mark.name,
                                    x: -10
                                },
                                zIndex: 3
                            });
                        });
                    } catch (e) {}
                }

                const ctx = this;
                Highcharts.chart(htmlElement, {
                    title: {
                        text: value.title,
                        x: 30,
                        align: 'left',
                        style: {
                            fontSize: '14px'
                        }
                    },
                    chart: {
                        margin: 40,
                        marginLeft: 90,
                        zoomType: 'x',
                        width: window.screen.availWidth,
                        height: 200
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        crosshair: true,
                        labels: {
                            formatter: function () {
                                return ctx.datePipe.transform(this.value, 'MM-dd HH:mm');
                            }
                        }
                    },
                    yAxis: {
                        reversed: value.reversed !== undefined ? value.reversed : false,
                        title: {
                            text: null
                        },
                        min: value.min,
                        max: value.max,
                        labels: {
                          formatter: function () {
                              return this.value + ' ' + value.unit;
                          }
                        },
                        plotLines
                    },
                    tooltip: {
                        enabled: true,
                        dateTimeLabelFormats: {
                            millisecond: '%Y-%m-%d %H:%M',
                            second: '%Y-%m-%d %H:%M',
                            minute: '%Y-%m-%d %H:%M'
                        }
                    },
                    series: [
                        {
                            name: value.title,
                            type: 'line',
                            data: value.data,
                            color: value.color,
                            fillOpacity: 0.3,
                            tooltip: {
                                enabled: false,
                                valueSuffix: ' ' + value.unit
                            }
                        }
                    ],
                    credits: {
                        enabled: false
                    }
                });
            });
        }, () => { }, () => {
            this.msgService.dismissLoading();
        });
    }

    synchroTable(e: MouseEvent) {
        let chart, point, i, event;

        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            event = chart.pointer.normalize(e); // Find coordinates within the chart
            point = chart.series[0].searchPoint(event, true); // Get the hovered point
            if (point) {
                point.highlight(e);
            }
        }
    }

    @HostListener('document:ionBackButton', ['$event'])
    public overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.navCtrl.back();
        });
    }
}

/**
 * 重写内部的方法， 这里是将提示框即十字准星的隐藏函数关闭
 */
(Highcharts as any).Pointer.prototype.reset = function () {
    return undefined;
};
/**
 * 高亮当前的数据点，并设置鼠标滑动状态及绘制十字准星线
 */
(Highcharts as any).Point.prototype.highlight = function (event) {
    this.onMouseOver(); // 显示鼠标激活标识
    this.series.chart.tooltip.refresh(this); // 显示提示框
    this.series.chart.xAxis[0].drawCrosshair(event, this); // 显示十字准星线
};

