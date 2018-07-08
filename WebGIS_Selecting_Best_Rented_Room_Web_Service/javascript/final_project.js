//html interactive,,건들지말것
var TxtRotate = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};
TxtRotate.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        // this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }
    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';
    var that = this;
    var delta = 200 - Math.random() * 100;
    if (this.isDeleting) {
        delta /= 2;
    }
    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }
    setTimeout(function () {
        that.tick();
    }, delta);
};
window.onload = function () {
    var elements = document.getElementsByClassName('txt-rotate');
    for (var i = 0; i < elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-rotate');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtRotate(elements[i], JSON.parse(toRotate), period);
        }
    }
};
//fullscreen
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {
    L.Control.Fullscreen = L.Control.extend({
        options: {
            position: 'topleft',
            title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
            }
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control-fullscreen leaflet-bar leaflet-control');

            this.link = L.DomUtil.create('a', 'leaflet-control-fullscreen-button leaflet-bar-part', container);
            this.link.href = '#';

            this._map = map;
            this._map.on('fullscreenchange', this._toggleTitle, this);
            this._toggleTitle();

            L.DomEvent.on(this.link, 'click', this._click, this);

            return container;
        },

        _click: function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            this._map.toggleFullscreen(this.options);
        },

        _toggleTitle: function () {
            this.link.title = this.options.title[this._map.isFullscreen()];
        }
    });

    L.Map.include({
        isFullscreen: function () {
            return this._isFullscreen || false;
        },

        toggleFullscreen: function (options) {
            var container = this.getContainer();
            if (this.isFullscreen()) {
                if (options && options.pseudoFullscreen) {
                    this._disablePseudoFullscreen(container);
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else {
                    this._disablePseudoFullscreen(container);
                }
            } else {
                if (options && options.pseudoFullscreen) {
                    this._enablePseudoFullscreen(container);
                } else if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                } else {
                    this._enablePseudoFullscreen(container);
                }
            }

        },

        _enablePseudoFullscreen: function (container) {
            L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
            this._setFullscreen(true);
            this.fire('fullscreenchange');
        },

        _disablePseudoFullscreen: function (container) {
            L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
            this._setFullscreen(false);
            this.fire('fullscreenchange');
        },

        _setFullscreen: function (fullscreen) {
            this._isFullscreen = fullscreen;
            var container = this.getContainer();
            if (fullscreen) {
                L.DomUtil.addClass(container, 'leaflet-fullscreen-on');
            } else {
                L.DomUtil.removeClass(container, 'leaflet-fullscreen-on');
            }
            this.invalidateSize();
        },

        _onFullscreenChange: function (e) {
            var fullscreenElement =
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;

            if (fullscreenElement === this.getContainer() && !this._isFullscreen) {
                this._setFullscreen(true);
                this.fire('fullscreenchange');
            } else if (fullscreenElement !== this.getContainer() && this._isFullscreen) {
                this._setFullscreen(false);
                this.fire('fullscreenchange');
            }
        }
    });

    L.Map.mergeOptions({
        fullscreenControl: false
    });

    L.Map.addInitHook(function () {
        if (this.options.fullscreenControl) {
            this.fullscreenControl = new L.Control.Fullscreen(this.options.fullscreenControl);
            this.addControl(this.fullscreenControl);
        }

        var fullscreenchange;

        if ('onfullscreenchange' in document) {
            fullscreenchange = 'fullscreenchange';
        } else if ('onmozfullscreenchange' in document) {
            fullscreenchange = 'mozfullscreenchange';
        } else if ('onwebkitfullscreenchange' in document) {
            fullscreenchange = 'webkitfullscreenchange';
        } else if ('onmsfullscreenchange' in document) {
            fullscreenchange = 'MSFullscreenChange';
        }

        if (fullscreenchange) {
            var onFullscreenChange = L.bind(this._onFullscreenChange, this);

            this.whenReady(function () {
                L.DomEvent.on(document, fullscreenchange, onFullscreenChange);
            });

            this.on('unload', function () {
                L.DomEvent.off(document, fullscreenchange, onFullscreenChange);
            });
        }
    });

    L.control.fullscreen = function (options) {
        return new L.Control.Fullscreen(options);
    };
}));
//Map//
var map = L.map('map', {
    fullscreenControl: {
        pseudoFullscreen: false
    }
}).setView([37.54925, 127.08513], 16);


var layer = new L.TileLayer('http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png', {
    attribution: '© Vworld',
    minZoom: 1,
    maxZoom: 19
}).addTo(map);

var wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/webgis/wms?SERVICE=WMS&', {
    layers: 'station4326_2',
    format: 'image/png',
    transparent: true
}).addTo(map);

//
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 7,
        color: 'black',
        fillColor: 'blue',
        dashArray: '',
        fillOpacity: 0.7
    });
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}


/********************************* Icon example poi********************************/
// 1. play_icon
var play_icon = L.icon({
    iconUrl: 'img/play22.png',
    iconSize: [70, 110]
});

// 2. hospital_icon
var hospital_icon = L.icon({
    iconUrl: 'img/hospital22.png',
    iconSize: [50, 70]
});

// 3. market_icon
var market_icon = L.icon({
    iconUrl: 'img/market22.png',
    iconSize: [120, 120]
});

// 4. school_icon
var school_icon = L.icon({
    iconUrl: 'img/school22.png',
    iconSize: [100, 100]
})

// 5. cctv_icon
var cctv_icon = L.icon({
    iconUrl: 'img/cctv.png',
    iconSize: [30, 30]
});

// 6. house1
var house_icon1 = L.icon({
    iconUrl: 'img/house22.png',
    iconSize: [30, 30]
});
// 7. house2
var house_icon2 = L.icon({
    iconUrl: 'img/house22.png',
    iconSize: [120, 120]
});

// 8. house3
var smallIcon = new L.Icon({
    iconSize: [30, 30],
    iconUrl: 'img/house22.png'
});

// 9. station
var station_icon = new L.Icon({
    iconSize: [60, 60],
    iconUrl: 'img/station.png'
});

// merge cctv
var cctv = {};
var cctvs = Object.assign(cctv, cctv4326, cctv4326_2);

var boths = L.geoJson(cctvs, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: cctv_icon
        });
    }
})

/******************** 시설별로 나누기(노래방, 피씨방, 편의점 등) 마크 포함****************************/

// 1. Play  
function filter_play(feature, latlng) {
    if (feature.properties.KINDVALUEB == ("노래방" || "PC방")) return true;
}

function pointToLayer_play(feature, latlng) {
    return a = L.marker(latlng, { icon: play_icon })
}

var geojson_poi_play = L.geoJson(poi4326, {
    filter: filter_play,
    pointToLayer: pointToLayer_play
}).toGeoJSON();

// 2. hospital
function filter_hospital(feature, latlng) {
    if (feature.properties.KINDVALUEB == "병원") return true;
}

function pointToLayer_hospital(feature, latlng) {
    return b = L.marker(latlng, { icon: hospital_icon })
}

var geojson_poi_hospital = L.geoJson(poi4326, {
    filter: filter_hospital,
    pointToLayer: pointToLayer_hospital
}).toGeoJSON();

// 3. market
function filter_market(feature, latlng) {
    if (feature.properties.KINDVALUEB == "편의점") return true;
}

function pointToLayer_market(feature, latlng) {
    return c = L.marker(latlng, { icon: market_icon })
}

var geojson_poi_market = L.geoJson(poi4326, {
    filter: filter_market,
    pointToLayer: pointToLayer_market
}).toGeoJSON();

// 4. school
function filter_school(feature, latlng) {
    if (feature.properties.DETAILNAME == "2층생라면오케이세종대점") return true;
}

function pointToLayer_school(feature, latlng) {
    return d = L.marker(latlng, { icon: school_icon })
}

var geojson_poi_school = L.geoJson(poi4326, {
    filter: filter_school,
    pointToLayer: pointToLayer_school
}).toGeoJSON();

// 5. station
function pointToLayer_station(feature, latlng) {
    return f = L.marker(latlng, { icon: station_icon })
}

var geojson_poi_station = L.geoJson(station4326, {
    pointToLayer: pointToLayer_station
}).toGeoJSON();




/************************ 클릭 시 event 실행 ******************************/

function seconds2time(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var seconds = seconds - (hours * 3600) - (minutes * 60);
    var time = "";

    if (hours != 0) {
        time = hours + "시간";
    }
    if (minutes != 0 || time !== "") {
        minutes = (minutes < 10 && time !== "") ? "0" + minutes : String(minutes);
        time += minutes + "분";
    }
    if (time === "") {
        time = seconds + "초";
    }
    else {
        time += (seconds < 10) ? "0" + seconds : String(seconds) + '초';
    }
    return time;
}

// Events about house click //
function onEachFeature(feature, layer) {

    // House icon expansion//
    layer.on("mouseover", function (e) {
        layer.setIcon(house_icon2)
    });

    // House icon reduction //
    layer.on("mouseout", function (e) {
        layer.setIcon(house_icon1)
    });


    // Add house name, address to in the sidebar //
    layer.on('click', function () {
        $('h1').html('');
        $('h1').append(feature.properties.Name);
        $('div p:nth-child(2)').html('');
        $('div p:nth-child(2)').append(feature.properties.DO_NAME, ' ', feature.properties.GUN_NAME, ' ', feature.properties.YUB_NAME, ' ', feature.properties.LOTNO)
    });

    // 공간 분석 //
    layer.on('click', function () {

        // Layer 초기화 //
        map.removeLayer(a)
        map.removeLayer(b)
        map.removeLayer(c)
        map.removeLayer(d)
        map.removeLayer(f)

        // House centroid //
        var centroid = turf.centroid(feature)

        // Nearest point //
        var nearest_play = turf.nearestPoint(centroid, geojson_poi_play)
        var nearest_hospital = turf.nearestPoint(centroid, geojson_poi_hospital)
        var nearest_market = turf.nearestPoint(centroid, geojson_poi_market)
        var nearest_school = turf.nearestPoint(centroid, geojson_poi_school)
        var nearest_station = turf.nearestPoint(centroid, geojson_poi_station)
        console.log(nearest_school)

        // Distance //
        var dis_play = turf.distance(centroid, nearest_play, { units: 'kilometers' })
        var dis_hospital = turf.distance(centroid, nearest_hospital, { units: 'kilometers' })
        var dis_market = turf.distance(centroid, nearest_market, { units: 'kilometers' })
        var dis_school = turf.distance(centroid, nearest_school, { units: 'kilometers' })
        var dis_station = turf.distance(centroid, nearest_station, { units: 'kilometers' })
        console.log(((dis_play / 4.5) * 60).toPrecision(3), '분')
        console.log(((dis_hospital / 4.5) * 60).toPrecision(3), '분')
        console.log(((dis_market / 4.5) * 60).toPrecision(3), '분')
        console.log(((dis_school / 30) * 60).toPrecision(3), '분')
        console.log(((dis_station / 30) * 60).toPrecision(3), '분')


        // Add to sidebar //
        $('#play').html(seconds2time(((dis_play / 4.5) * 3600).toPrecision(1)))
        $('#hospital').html(seconds2time(((dis_hospital / 4.5) * 3600).toPrecision(1)))
        $('#market').html(seconds2time(((dis_market / 4.5) * 3600).toPrecision(1)))
        $('#school_t').html(seconds2time(((dis_school / 4.5) * 3600).toPrecision(1)))
        $('#station').html(seconds2time(((dis_station / 4.5) * 3600).toPrecision(1)))


        // Routing //
        var dir1 = MQ.routing.directions();
        dir1.route({
            locations: [
                { latLng: { lat: centroid.geometry.coordinates[1], lng: centroid.geometry.coordinates[0] } },
                { latLng: { lat: nearest_school.geometry.coordinates[1], lng: nearest_school.geometry.coordinates[0] } }
            ],
            options: {
                routeType: 'shortest',
                bestFit: true
            }
        });
        var mao = MQ.routing.routeLayer({
            directions: dir1
        })
        mao.addTo(map)


        // Number of CCTV for security //
        var aaa = turf.buffer(feature, 0.18, { units: 'kilometers' })
        var ccc = turf.within(cctvs, aaa);
        console.log('cctv갯수는' + ccc.features.length + '개')

        // Chart //
        Chart.defaults.global.legend.display = false;
        var ctx = document.getElementById("myChart1");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["놀이시설", "의료시설", "편의시설", "교육시설", "치안"],
                datasets: [{
                    data: [
                        10 - (dis_play / 4.5) * 60,
                        10 - (dis_hospital / 4.5) * 60,
                        10 - (dis_market / 4.5) * 60,
                        10 - (dis_school / 4.5) * 60 / 6,
                        ccc.features.length * 2],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',

                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',

                    ],
                    borderWidth: 5
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: '소요시간'
                }
            }
        });

        // Total score of each house //
        var total_s = ((dis_play / 4.5) * 3600) + ((dis_hospital / 4.5) * 3600) + (dis_market / 4.5) * 3600 + (dis_school / 4.5) * 3600
        var total_m = Number((total_s) / 60)
        console.log(total_m)
        console.log(typeof (total_m))
        if (total_m < 10) {
            var score = 100
        }
        else if (total_m < 20) {
            var score = 80
        }
        else if (total_m < 30) {
            var score = 60
        }
        else if (total_m < 40) {
            var score = 40
        }
        else {
            var score = 20
        }



        // Number increase animation //
        var decimal_places = 1;
        var decimal_factor = decimal_places === 0 ? 1 : decimal_places * 10;

        $('#target').animateNumber(
            {
                number: score * 10,
                color: 'green',
                'font-size': '30px',

                numberStep: function (now, tween) {
                    var floored_number = Math.floor(now) / decimal_factor,
                        target = $(tween.elem);
                    if (decimal_places > 0) {
                        floored_number = floored_number.toFixed(decimal_places);
                    }

                    target.text(floored_number + ' 점');
                }
            },
            1500
        )

        // Makers of poi //
        var nearest_play_l = L.geoJson(nearest_play, {
            pointToLayer: pointToLayer_play
        }).addTo(map)
        var nearest_hospital_l = L.geoJson(nearest_hospital, {
            pointToLayer: pointToLayer_hospital
        }).addTo(map)
        var nearest_market_l = L.geoJson(nearest_market, {
            pointToLayer: pointToLayer_market
        }).addTo(map)
        var nearest_school_l = L.geoJson(nearest_school, {
            pointToLayer: pointToLayer_school
        }).addTo(map)
        var nearest_station_l = L.geoJson(nearest_station, {
            pointToLayer: pointToLayer_station
        }).addTo(map)

        // Display CCTV //
        var cctvrow = document.querySelector('#cctv_row');
        var cctvmid = document.querySelector('#cctv_mid');
        var cctvhigh = document.querySelector('#cctv_high');
        cctvrow.style.visibility = 'hidden';
        cctvmid.style.visibility = 'hidden';
        cctvhigh.style.visibility = 'hidden';
        if (ccc.features.length <= 2)
            return cctvrow.style.visibility = 'visible';
        else if (ccc.features.length <= 4)
            return cctvmid.style.visibility = 'visible';
        else
            return cctvhigh.style.visibility = 'visible';

    });
}


// Sampling house
var sample_house = turf.sample(house4326, 400)


// Display sidebar event(click) //
var justin = L.geoJson(random_house, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: smallIcon });
    },
    onEachFeature: onEachFeature
}).addTo(map).on('click', function () {
    sidebar.show();
});

// Control Layer //
var overlays = {
    "cctv": boths,
    "houses": justin,
    "station": wmsLayer
}
L.control.layers(overlays).addTo(map)

// Score chart //
var arr = [];
var names = [];
var i;
for (i = 0; i < 400; i++) {
    var house_name = random_house.features[i].properties.Name
    var centroid = turf.centroid(random_house.features[i])
    var nearest_play = turf.nearestPoint(centroid, geojson_poi_play)
    var nearest_hospital = turf.nearestPoint(centroid, geojson_poi_hospital)
    var nearest_market = turf.nearestPoint(centroid, geojson_poi_market)
    var nearest_school = turf.nearestPoint(centroid, geojson_poi_school)
    var dis_play = turf.distance(centroid, nearest_play, { units: 'kilometers' })
    var dis_hospital = turf.distance(centroid, nearest_hospital, { units: 'kilometers' })
    var dis_market = turf.distance(centroid, nearest_market, { units: 'kilometers' })
    var dis_school = turf.distance(centroid, nearest_school, { units: 'kilometers' })
    var total_s = ((dis_play / 4.5) * 3600) + ((dis_hospital / 4.5) * 3600) + (dis_market / 4.5) * 3600 + (dis_school / 4.5) * 3600
    var total_m = Number((total_s) / 60)
    if (total_m < 10) {
        var score = 100
    }
    else if (total_m < 20) {
        var score = 80
    }
    else if (total_m < 30) {
        var score = 60
    }
    else if (total_m < 40) {
        var score = 40
    }
    else {
        var score = 20
    }
    arr.push(score);
    names.push(house_name);
}
// Plot chart with x axis scroll bar
var ctx = document.getElementById("myChart2").getContext("2d");
var chart = {
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                display: false,
                categoryPercentage: 1.0,
                barPercentage: 1.0,
                stacked: true
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    fontSize: 40,
                    fontColor: 'black'
                }
            }]
        },
        title: {
            display: true,
            text: '총점수'
        }

    },
    type: 'bar',
    data: {
        labels: names,
        datasets: [
            {
                data: arr,
                label: "Total Score",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                backgroundColor: 'white',
                borderColor: 'black',
                borderWidth: 2,
                pointHoverRadius: 10
            }
        ]
    }
};

var myLiveChart = new Chart(ctx, chart);