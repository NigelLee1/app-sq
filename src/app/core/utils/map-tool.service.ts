import {Injectable} from '@angular/core';
import {LatLng, LatLngBounds} from 'leaflet';
import {DatePipe} from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class MapToolService {
    private ee = 0.00669342162296594323;
    private a = 6378245.0;
    private regExes = {
        typeStr: /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
        spaces: /\s+/,
        parenComma: /\)\s*,\s*\(/,
        doubleParenComma: /\)\s*\)\s*,\s*\(\s*\(/,
        trimParens: /^\s*\(?(.*?)\)?\s*$/
    };

    private parse = {
        point: (str) => {
            const coords = this.trim(str).split(this.regExes.spaces);
            coords[0] = parseFloat(coords[0]);
            coords[1] = parseFloat(coords[1]);
            return coords;
        },
        linestring: (str) => {
            const points = this.trim(str).split(',');
            const components = [];
            for (let i = 0, len = points.length; i < len; ++i) {
                components.push(this.parse.point.apply(this, [points[i]]));
            }
            return components;
        },
        polygon: (str) => {
            let ring, linestring;
            const rings = this.trim(str).split(this.regExes.parenComma);
            const components = [];
            for (let i = 0, len = rings.length; i < len; ++i) {
                ring = rings[i].replace(this.regExes.trimParens, '$1');
                linestring = this.parse.linestring.apply(this, [ring]);
                components.push(linestring);
            }
            return components;
        }
    };

    constructor(private datePipe: DatePipe) {
    }

    public read(wkt) {
        let features, type, str;
        wkt = wkt.replace(/[\n\r]/g, ' ');
        const matches = this.regExes.typeStr.exec(wkt);
        if (matches) {
            type = matches[1].toLowerCase();
            str = matches[2];
            if (this.parse[type]) {
                features = this.parse[type].apply(this, [str]);
            }
        }
        const result: any = {};
        result.type = type;
        result.features = features;
        return result;
    }

    getLatLngBounds(pointArray: any[]) {
        let minLat: number, maxLat: number, minLon: number, maxLon: number;
        pointArray.forEach((value: number[]) => {
            if (minLat === undefined) {
                minLat = maxLat = value[0];
                minLon = maxLon = value[1];
            } else {
                minLat = value[0] < minLat ? value[0] : minLat;
                maxLat = value[0] > maxLat ? value[0] : maxLat;
                minLon = value[1] < minLon ? value[1] : minLon;
                maxLon = value[1] > maxLon ? value[1] : maxLon;
            }
        });
        return new LatLngBounds(new LatLng(minLat, minLon), new LatLng(maxLat, maxLon));
    }

    private trim(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    public convertListToIntArray(listArray: any[], configArray: any[]) {
        if (listArray === null) {
            listArray = [];
        }
        const result = new Array();
        try {
            configArray.map(item => item.value).forEach((item, index) => {
                result[index] = listArray.indexOf(item) !== -1 ? 1 : 0;
            });
        } catch (e) {}
        return result;
    }

    /**
     * 手机GPS坐标转火星坐标
     */
    public transformFromWGSToGCJ(wgLoc: LatLng): LatLng {
        if (this.outOfChina(wgLoc.lat, wgLoc.lng)) {
            return new LatLng(wgLoc.lat, wgLoc.lng);
        }
        let dLat: number = this.transformLat(wgLoc.lng - 105.0,
            wgLoc.lat - 35.0);
        let dLon: number = this.transformLon(wgLoc.lng - 105.0,
            wgLoc.lat - 35.0);
        const radLat: number = wgLoc.lat / 180.0 * Math.PI;
        let magic: number = Math.sin(radLat);
        magic = 1 - this.ee * magic * magic;
        const sqrtMagic: number = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * Math.PI);
        dLon = (dLon * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * Math.PI);
        return new LatLng(wgLoc.lat + dLat, wgLoc.lng + dLon);
    }

    public outOfChina(lat: number, lon: number): boolean {
        if (lon < 72.004 || lon > 137.8347) {
            return true;
        }
        return lat < 0.8293 || lat > 55.8271;
    }

    public transformLat(x: number, y: number): number {
        let ret: number = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
            + 0.2 * Math.sqrt(x > 0 ? x : -x);
        ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x
            * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0
            * Math.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y
            * Math.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    public transformLon(x: number, y: number): number {
        let ret: number = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
            * Math.sqrt(x > 0 ? x : -x);
        ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x
            * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0
            * Math.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x
            / 30.0 * Math.PI)) * 2.0 / 3.0;
        return ret;
    }

    /**
     * 墨卡托转4326
     *
     */
    public mercatorToLonLat(x, y): any {
        const toX: number = x / 20037508.34 * 180;
        let toY: number = y / 20037508.34 * 180;
        toY = 180 / Math.PI * (2 * Math.atan(Math.exp(toY * Math.PI / 180)) - Math.PI / 2);
        return [toY, toX];
    }

    public lonLat2Mercator(lonLat: LatLng) {
        const x = lonLat.lng * 20037508.34 / 180;
        let y = Math.log(Math.tan((90 + lonLat.lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return {gdX: x, gdY: y};
    }

    formatLocateStr(point: number, digit: number): number {
        const pow = Math.pow(10, digit);
        return Math.floor(point * pow) / pow;
    }

    isPassed(wcsj: any) {
        const date = parseInt(this.datePipe.transform(wcsj, 'yyyyMMdd'), 0);
        return parseInt(this.datePipe.transform(new Date(), 'yyyyMMdd'), 0) > date;
    }
}
