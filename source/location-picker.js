// IMPORTANT - DO NOT REMOVE
if (window.GUnload) Ojay(window).on('unload', GUnload);
if (window.GMap2) JS.MethodChain.addMethods(GMap2);

/**
 * == libs ==
 **/

/** section: libs
 * class LocationPicker
 * 
 * The `LocationPicker` class provides a UI for entering geographic data
 * (lat/lng co-ordinates) into web forms. The user can search for an address
 * to position a map marker, then drag the marker to the precise location
 * they want. Interaction fires events that can export the current marker
 * position to form fields.
 **/
LocationPicker = new JS.Class({
    extend: {
        // Default dimensions
        WIDTH:              600,
        HEIGHT:             400,
        
        // HTML classes
        CONTAINER_CLASS:    'location-picker',
        
        // Default location: tOm office
        DEFAULT_LATITUDE:   51.498945,
        DEFAULT_LONGITUDE:  -0.080874,
        
        // Default zoom level and co-ordinate precision
        // 6 decimal places in lat/lng values = 11cm on-the-ground precision
        ZOOM_LEVEL:         15,
        PRECISION:          6,
        
        /**
         * LocationPicker.round(number) -> Number
         * - number (Number)
         * Returns the given number rounded to the current precision level.
         **/
        round: function(number) {
            var scale = Math.pow(10, this.PRECISION);
            return Math.round(number * scale) / scale;
        },
        
        /**
         * LocationPicker.getGeocoder() -> GClientGeocoder
         * Returns a geocoder object from Google Maps.
         **/
        getGeocoder: function() {
            return this._geoc = this._geoc || new GClientGeocoder();
        }
    },
    
    /**
     * new LocationPicker(position, element, options)
     * - position (String)
     * - element (HTMLElement)
     * - options (Object)
     * 
     * `LocationPicker` is initialized using a `position` (either `'before'` or
     * `'after'`), and an element after/before which to insert to map UI. The `options`
     * object should include:
     * 
     * * `width` -- width of the widget in pixels
     * * `height` -- height of the widget in pixels
     * * `latField` -- reference to the form field to populuate with latitude
     * * `lngField` -- reference to the form field to populuate with longitude
     **/
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
    
    /**
     * LocationPicker#getHTML() -> Ojay.DomCollection
     * Returns the HTML that makes up the widget.
     **/
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
    
    /**
     * LocationPicker#pullLocation() -> undefined
     * Extracts location data from the form fields and updates the marker location.
     **/
    pullLocation: function() {
        var lat = (this._latField||{}).value, lng = (this._lngField||{}).value;
        if (!lat) lat = this.klass.DEFAULT_LATITUDE;
        if (!lng) lng = this.klass.DEFAULT_LONGITUDE;
        
        this._loc = new GLatLng(Number(lat), Number(lng));
        this._map.setCenter(this._loc, this.klass.ZOOM_LEVEL);
        this.positionMarker();
    },
    
    /**
     * LocationPicker#pushLocation() -> undefined
     * Updates the form fields with the current marker position.
     **/
    pushLocation: function() {
        var latlng = this._marker.getLatLng();
        (this._latField||{}).value = this.klass.round(latlng.lat());
        (this._lngField||{}).value = this.klass.round(latlng.lng());
    },
    
    /**
     * LocationPicker#getMarker() -> GMarker
     * Returns the Google Maps marker used by the widget.
     **/
    getMarker: function() {
        if (this._marker) return this._marker;
        this._marker = new GMarker(this._loc, {draggable: true});
        this._marker.enableDragging();
        GEvent.addListener(this._marker, 'dragend', this.method('pushLocation'));
        this._map.addOverlay(this._marker);
        return this._marker;
    },
    
    /**
     * LocationPicker#positionMarker() -> undefined
     * Places the marker at the correct location and updates the form fields.
     **/
    positionMarker: function() {
        this.getMarker().setLatLng(this._loc);
        this.pushLocation();
    },
    
    /**
     * LocationPicker#search() -> undefined
     * - address (String)
     * Runs a geocoding search using the current address value and moves the
     * marker to the resulting location. If the address parameter is provided,
     * the address field will be set to that value prior to performing the
     * search.
     **/
    search: function(address) {
        if (address) this.setAddress(address);
        
        this.klass.getGeocoder().getLocations(this.getAddress(), function(response) {
            var place = response.Placemark[0];
            if (!place) return;
            
            var coords = place.Point.coordinates,
                box    = place.ExtendedData.LatLonBox,
                bounds = new GLatLngBounds(new GLatLng(box.south, box.west),
                                           new GLatLng(box.north, box.east)),
                zoom = this._map.getBoundsZoomLevel(bounds);
            
            this._loc = new GLatLng(coords[1], coords[0]);
            this._map.setCenter(this._loc, zoom);
            this.positionMarker();
        }.bind(this));
    },
    
    /**
     * LocationPicker#getAddress() -> String
     * Returns the value of the address field.
     */
    getAddress: function() {
        return this._elements._address.value;
    },
    
    /**
     * LocationPicker#setAddress(value) -> undefined
     * - value (String)
     * Sets the value of the address field.
     **/
    setAddress: function(value) {
        this._elements._address.value = value;
    }
});
