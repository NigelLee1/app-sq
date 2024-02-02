import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import * as L from 'leaflet';
import {Map} from 'leaflet';
import * as esri from 'esri-leaflet';
import {LatLng} from 'leaflet';
import {DivIcon} from 'leaflet';
import {Marker} from 'leaflet';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import {Geolocation, Geoposition} from '@ionic-native/geolocation/ngx';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnChanges {
    @Input() isSatellite = false;
    @Input() showFullScreen = false;
    @Input() isFullScreen = true;
    @Input() isContentFooter = false;
    @Input() initLocate = false;
    @Output() mapInitialized: EventEmitter<Map> = new EventEmitter();
    @Output() fullScreenChange: EventEmitter<boolean> = new EventEmitter();
    @Output() locationSuccess: EventEmitter<LatLng> = new EventEmitter();
    map: Map;
    locating = false;
    locateMarker: Marker;
    baseLayer = esri.basemapLayer('BaseLayer', {detectRetina: true});
    textAnnotationLayer = esri.basemapLayer('TextAnnotationLayer', {detectRetina: true});
    @ViewChild('mapDiv', {static: false}) mapDiv: ElementRef;
    watchPosition: any;
    watchHeading: any;

    constructor(private geolocation: Geolocation,
                private deviceOrientation: DeviceOrientation) {
    }

    ngAfterViewInit(): void {
        const gaoDe = L.layerGroup([this.baseLayer, this.textAnnotationLayer]);
        this.map = L.map(this.mapDiv.nativeElement, {
            crs: L.CRS.EPSG3857,
            attributionControl: false,
            zoomControl: true,
            zoom: 11,
            minZoom: 11,
            maxZoom: 22,
            center: [33.928012, 118.329508],
            layers: [gaoDe]
        });
        console.log(this.map);
        this.map.whenReady(() => {
            setTimeout(() => {
                this.map.invalidateSize(true);
                if (this.initLocate) {
                    this.location(false);
                }
                this.mapInitialized.emit(this.map);
            }, 500);
        });
    }

    location(goToCenter?: boolean) {
        if (this.locating) {
            return;
        }
        this.locating = true;
        this.geolocation.getCurrentPosition().then(res => {
            if (this.watchPosition) {
                this.watchPosition.unsubscribe();
            }
            if (this.watchHeading) {
                this.watchHeading.unsubscribe();
            }
            if (this.locateMarker) {
                this.locateMarker.remove();
            }
            const id = Math.random().toString(36).substr(2);
            const center = new LatLng(res.coords.latitude, res.coords.longitude);
            this.locateMarker = L.marker(center, {
                icon: new DivIcon({
                    html: '<div class="ripple"><img id="' + id + '" style="transform: rotate(180deg); transform-origin: 20px 14.3px" ' +
                        'src="assets/icon/orientation.svg"/></div>',
                    className: 'marker'
                })
            });
            this.locateMarker.addTo(this.map);
            if (goToCenter === undefined || goToCenter) {
                this.map.setView(center, 14);
            }
            this.map.invalidateSize(true);
            this.locationSuccess.emit(this.map.getCenter());
            this.watchPosition = this.geolocation.watchPosition({
                enableHighAccuracy: true
            }).subscribe(resp => {
                this.locateMarker.setLatLng(new LatLng(resp.coords.latitude, resp.coords.longitude));
            });
            this.watchHeading = this.deviceOrientation.watchHeading().subscribe(resp => {
                const angle = 180 + resp.magneticHeading;
                document.getElementById(id).style.transform = 'rotate(' + angle + 'deg)';
            });
        }).finally(() => {
            this.locating = false;
        });
    }

    orientation(magneticHeading: number) {
        const angle = 180 + magneticHeading;
        document.getElementById('locate-arrow').style.transform = 'rotate(' + angle + 'deg)';
    }

    setFullScreen() {
        this.isFullScreen = !this.isFullScreen;
        this.fullScreenChange.emit(this.isFullScreen);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isSatellite !== undefined && !changes.isSatellite.firstChange) {
            const res = changes.isSatellite.currentValue;
            this.baseLayer.setUrl(res ? 'http://120.236.226.84:6001/googleMap/image/{z}/{y}/{x}.png' :
                'http://120.79.139.65:8148/tianditu/street/{z}/{y}/{x}.png');
        }
    }
}
