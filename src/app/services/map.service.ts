import { Injectable, NgZone } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

import { environment } from 'src/environments/environment';
import { ChurchData } from '../models/church-data';
import { PopupService } from './popup.service';
import { MapInteractionState } from '../models/map-interaction-state';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    constructor(
        private ngZone: NgZone,
        private popupService: PopupService
    ) { }

    // =====================================================
    // MAP
    // =====================================================

    private map!: mapboxgl.Map;

    private animationId: number | null = null;

    private loading = true;

    // =====================================================
    // MARKERS
    // =====================================================

    private churchMarkers: mapboxgl.Marker[] = [];

    // =====================================================
    // GETTERS
    // =====================================================

    get instance(): mapboxgl.Map {

        return this.map;

    }

    get isLoaded(): boolean {

        return !this.loading;

    }

    get markers(): mapboxgl.Marker[] {

        return this.churchMarkers;

    }

    // =====================================================
    // INITIALIZE MAP
    // =====================================================

    initializeMap(

        onLoad: () => void,

        onZoomChanged?: (zoom: number) => void

    ): void {

        (mapboxgl as any).accessToken =
            environment.mapboxToken;

        this.map = new mapboxgl.Map({

            container: 'globe-map',

            style: {

                version: 8,

                sources: {

                    'osm-tiles': {

                        type: 'raster',

                        tiles: [

                            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',

                            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',

                            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'

                        ],

                        tileSize: 256,

                        attribution: ''

                    }

                },

                layers: [

                    {

                        id: 'osm-tiles',

                        type: 'raster',

                        source: 'osm-tiles',

                        minzoom: 0,

                        maxzoom: 19

                    }

                ]

            },

            center: [0, 20],

            zoom: 1.5,

            projection: 'globe'

        });

        // ---------------------------------------------

        this.map.on(

            'style.load',

            () => this.map.setFog({})

        );

        // ---------------------------------------------

        this.map.on(

            'load',

            () => {

                this.loading = false;

                onLoad();

            }

        );

        // ---------------------------------------------

        this.map.on(

            'zoom',

            () => {

                if (onZoomChanged) {

                    onZoomChanged(

                        this.map.getZoom()

                    );

                }

            }

        );

    }

    // =====================================================
    // ZOOM
    // =====================================================

    zoomIn(): void {

        if (!this.map) {

            return;

        }

        this.map.easeTo({

            zoom:

                this.map.getZoom() + 1,

            duration: 1000,

            easing: t =>

                t * (2 - t)

        });

    }

    // =====================================================

    zoomOut(): void {

        if (!this.map) {

            return;

        }

        this.map.easeTo({

            zoom:

                this.map.getZoom() - 1,

            duration: 1000,

            easing: t =>

                t * (2 - t)

        });

    }

    // =====================================================
    // MARKERS
    // =====================================================

    showChurches(

        churches: ChurchData[],

        state: MapInteractionState

    ): void {

        if (

            this.churchMarkers.length > 0 ||

            churches.length === 0

        ) {

            return;

        }

        this.churchMarkers = churches.map(

            church =>

                this.addMarkerWithHover(

                    church,

                    '',
                    state

                )

        );

    }

    // =====================================================

    hideChurches(): void {

        this.churchMarkers.forEach(marker => {

            try {

                marker.remove();

            }
            catch { }

        });

        this.churchMarkers = [];

    }

    // =====================================================
    // ADD MARKER
    // =====================================================

    private addMarkerWithHover(

        church: ChurchData,

        iconPath: string,

        state: MapInteractionState

    ): mapboxgl.Marker {

        const element =

            document.createElement('div');

        element.className = 'marker';

        element.style.backgroundImage =
            `url(${iconPath})`;

        element.style.width = '30px';

        element.style.height = '30px';

        element.style.backgroundSize =
            'cover';

        element.style.cursor = 'pointer';

        const popup =

            new mapboxgl.Popup({

                offset: 25,

                closeButton: false,

                closeOnClick: false

            })

                .setHTML(

                    this.popupService.buildPopupCard(

                        church

                    )

                );

        const marker =

            new mapboxgl.Marker(

                element

            )

                .setLngLat([

                    church.longitude,

                    church.latitude

                ])

                .addTo(

                    this.map

                );

        // ------------------------------------------

        element.addEventListener(

            'mouseenter',

            () => {

                if (

                    state.slideshowRunning ||

                    state.flying ||

                    state.mainPopupActive

                ) {

                    return;

                }

                popup

                    .addTo(this.map)

                    .setLngLat([

                        church.longitude,

                        church.latitude

                    ]);

            }

        );

        // ------------------------------------------

        element.addEventListener(

            'mouseleave',

            () => {

                if (!state.mainPopupActive) {

                    popup.remove();

                }

            }

        );

        return marker;

    }

    // =====================================================
    // TRANSITION BETWEEN CARDS
    // =====================================================

    transitionBetweenCards(

        fromLngLat: [number, number],

        toLngLat: [number, number],

        transitionDurationMs: number = 2000,

        onTransitionFinished?: () => void

    ): Promise<void> {

        return new Promise(resolve => {

            try {

                (this.map as any).stop?.();

            }
            catch { }

            this.ngZone.runOutsideAngular(() => {

                const startTime = performance.now();

                const animate = (time: number) => {

                    const elapsed = time - startTime;

                    const progress = Math.min(

                        elapsed / transitionDurationMs,

                        1

                    );

                    let currentLng: number;

                    let currentLat: number;

                    let currentZoom: number;

                    // ------------------------------------
                    // Zoom Out
                    // ------------------------------------

                    if (progress < 0.33) {

                        const p = progress / 0.33;

                        currentLng = fromLngLat[0];

                        currentLat = fromLngLat[1];

                        currentZoom =

                            5 -

                            (5 - 1.5) * p;

                    }

                    // ------------------------------------
                    // Rotate Globe
                    // ------------------------------------

                    else if (progress < 0.66) {

                        const p =

                            (progress - 0.33) / 0.33;

                        currentLng =

                            fromLngLat[0] +

                            (

                                toLngLat[0] -

                                fromLngLat[0]

                            ) * p;

                        currentLat =

                            fromLngLat[1] +

                            (

                                toLngLat[1] -

                                fromLngLat[1]

                            ) * p;

                        currentZoom = 1.5;

                    }

                    // ------------------------------------
                    // Zoom In
                    // ------------------------------------

                    else {

                        const p =

                            (progress - 0.66) / 0.34;

                        currentLng = toLngLat[0];

                        currentLat = toLngLat[1];

                        currentZoom =

                            1.5 +

                            (5 - 1.5) * p;

                    }

                    this.map.jumpTo({

                        center: [

                            currentLng,

                            currentLat

                        ],

                        zoom: currentZoom,

                        bearing: 0,

                        pitch: 0

                    });

                    if (progress < 1) {

                        this.animationId =

                            requestAnimationFrame(

                                animate

                            );

                    }

                    else {

                        if (this.animationId) {

                            cancelAnimationFrame(

                                this.animationId

                            );

                        }

                        this.animationId = null;

                        if (onTransitionFinished) {

                            onTransitionFinished();

                        }

                        resolve();

                    }

                };

                this.animationId =

                    requestAnimationFrame(

                        animate

                    );

            });

        });

    }

    // =====================================================
    // FLY TO
    // =====================================================

    flyTo(

        lng: number,

        lat: number,

        zoom = 5

    ): void {

        if (!this.map) {

            return;

        }

        this.map.flyTo({

            center: [

                lng,

                lat

            ],

            zoom,

            speed: 1.2,

            curve: 1.2,

            essential: true

        });

    }

    // =====================================================
    // STOP CURRENT ANIMATION
    // =====================================================

    stopAnimation(): void {

        try {

            (this.map as any).stop?.();

        }
        catch { }

        if (this.animationId) {

            cancelAnimationFrame(

                this.animationId

            );

            this.animationId = null;

        }

    }

    // =====================================================
    // REMOVE MAP
    // =====================================================

    removeMap(): void {

        try {

            this.clearMarkers();

            if (this.map) {

                this.map.remove();

            }

        }
        catch (error) {

            console.error(
                'Failed to remove map.',
                error
            );

        }

    }

    // =====================================================
    // CLEAR MARKERS
    // =====================================================

    clearMarkers(): void {

        this.churchMarkers.forEach(marker => {

            try {

                marker.remove();

            }
            catch { }

        });

        this.churchMarkers = [];

    }

    // =====================================================
    // DESTROY
    // =====================================================

    destroy(): void {

        this.stopAnimation();

        this.clearMarkers();

        this.removeMap();

    }

    // =====================================================
    // HELPERS
    // =====================================================

    getMap(): mapboxgl.Map {

        return this.map;

    }

    hasMap(): boolean {

        return !!this.map;

    }

    getZoom(): number {

        if (!this.map) {

            return 0;

        }

        return this.map.getZoom();

    }

    setCenter(

        lng: number,

        lat: number

    ): void {

        if (!this.map) {

            return;

        }

        this.map.setCenter([

            lng,

            lat

        ]);

    }

    jumpTo(

        lng: number,

        lat: number,

        zoom: number

    ): void {

        if (!this.map) {

            return;

        }

        this.map.jumpTo({

            center: [

                lng,

                lat

            ],

            zoom,

            bearing: 0,

            pitch: 0

        });

    }

    easeTo(

        lng: number,

        lat: number,

        zoom: number,

        duration = 1000

    ): void {

        if (!this.map) {

            return;

        }

        this.map.easeTo({

            center: [

                lng,

                lat

            ],

            zoom,

            duration

        });

    }

    // =====================================================
    // MARKER INFO
    // =====================================================

    get markerCount(): number {

        return this.churchMarkers.length;

    }

    // =====================================================
    // MAP INFO
    // =====================================================

    get center(): mapboxgl.LngLat {

        return this.map.getCenter();

    }

    get bounds(): mapboxgl.LngLatBounds | null {

        if (!this.map) {
            return null;
        }

        return this.map.getBounds();

    }

    // =====================================================
    // LOADING
    // =====================================================

    setLoading(

        loading: boolean

    ): void {

        this.loading = loading;

    }

    isLoading(): boolean {

        return this.loading;

    }

}