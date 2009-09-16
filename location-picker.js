// IMPORTANT - DO NOT REMOVE
if (window.GUnload) Ojay(window).on('unload', GUnload);
if (window.GMap2) JS.MethodChain.addMethods(GMap2);

var LocationPicker = new JS.Class({
    extend: {
        WIDTH:              600,
        HEIGHT:             400,
        CONTAINER_CLASS:    'location-picker',
        DEFAULT_LATITUDE:   51.498945,
        DEFAULT_LONGITUDE:  -0.080874,
        ZOOM_LEVEL:         15,
        PRECISION:          6,
        
        round: function(number) {
            var scale = Math.pow(10, this.PRECISION);
            return Math.round(number * scale) / scale;
        },
        
        getGeocoder: function() {
        	return this._geoc = this._geoc || new GClientGeocoder();
        }
    },
    
    initialize: function(position, element, options) {
        this._container = Ojay( Ojay.HTML.div({className: this.klass.CONTAINER_CLASS}) );
        this._options = options || {};
        this._elements = {};
        this._latField = Ojay(this._options.latField).node;
        this._lngField = Ojay(this._options.lngField).node;
        
        Ojay(element).insert(this.getHTML(), position);
        this._map = new GMap2(this._elements._map.node);
        this._map.enableScrollWheelZoom();
        this._map.enableContinuousZoom();
        this._map.disableDoubleClickZoom();
        this._map.addControl(new GSmallMapControl());
        
        GEvent.addListener(this._map, 'dblclick', function(overlay, latlng) {
            this._loc = latlng;
            this.positionMarker();
        }.bind(this));
        
        this.pullLocation();
    },
    
    getHTML: function() {
        var elements = this._elements;
        if (elements._container) return elements._container;
        
        elements._container = Ojay( Ojay.HTML.div({className: this.klass.CONTAINER_CLASS}, function(HTML) {
            elements._form = Ojay( HTML.form(function(HTML) {
                elements._address = HTML.input({type: 'text'});
                elements._button = Ojay( HTML.button('Search') );
            }) ); 
            elements._map = Ojay( HTML.div() );
        }) );
        
        elements._map.setStyle({
            width:    (this._options.width || this.klass.WIDTH) + 'px',
            height:   (this._options.height || this.klass.HEIGHT) + 'px'
        });
        
        elements._form.on('submit', Ojay.stopDefault)._(this).search();
        
        return elements._container;
    },
    
    pullLocation: function() {
        var lat = (this._latField||{}).value, lng = (this._lngField||{}).value;
        if (lat === undefined) lat = this.klass.DEFAULT_LATITUDE;
        if (lng === undefined) lng = this.klass.DEFAULT_LONGITUDE;
        
        this._loc = new GLatLng(Number(lat), Number(lng));
        this._map.setCenter(this._loc, this.klass.ZOOM_LEVEL);
        this.positionMarker();
    },
    
    pushLocation: function() {
        var latlng = this._marker.getLatLng();
        (this._latField||{}).value = this.klass.round(latlng.lat());
        (this._lngField||{}).value = this.klass.round(latlng.lng());
    },
    
    getMarker: function() {
        if (this._marker) return this._marker;
        this._marker = new GMarker(this._loc, {draggable: true});
        this._marker.enableDragging();
        GEvent.addListener(this._marker, 'dragend', this.method('pushLocation'));
        this._map.addOverlay(this._marker);
        return this._marker;
    },
    
    positionMarker: function() {
        this.getMarker().setLatLng(this._loc);
        this.pushLocation();
    },
    
    search: function() {
        this.klass.getGeocoder().getLatLng(this._elements._address.value, function(latlng) {
            if (latlng === null) return;
            this._loc = latlng;
            this._map.setCenter(latlng);
            this.positionMarker();
        }.bind(this));
    },
    
    setAddress: function(value) {
        this._elements._address.value = value;
    }
});

