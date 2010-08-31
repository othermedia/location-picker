LocationPicker
==============

LocationPicker is a Google Maps widget to help with entering geographic data
into web forms. It provides an address search field to place a marker on the
map; the marker can then be dragged to the exact location required, firing
events that update form fields with the marker's coordinates.


Usage
-----

LocationPicker uses version 2 of the Google Maps API.

### Loading the Google Maps library

If loading through Helium, the Google API key must be set:

    Helium.GOOGLE_API_KEY = '{your API key}';

Your [Helium custom loader file][helium] will need to include some code to load
the Google Maps library:

    /**
     * Loads the `google.load` function, required to load other
     * parts of the Google API. Requires `Helium.GOOGLE_API_KEY`
     * to be set beforehand.
     **/
    loader(function(cb) {
        var url = 'http://www.google.com/jsapi?key=' + Helium.GOOGLE_API_KEY;
        load(url, cb);
    })
    .provides('google.load');
    
    /**
     * Loads the Google Maps API. Requires `Helium.GOOGLE_API_KEY`
     * to be set beforehand.
     **/
    loader(function(cb) { google.load('maps', '2.x', {callback: cb}) })
        .provides('GMap2',  'GClientGeocoder',
                  'GEvent', 'GLatLng', 'GMarker')
        .requires('google.load');

Otherwise, load the Google Maps library as specified in the
[Google Maps API V2 documentation][gmap2docs].

### Using `LocationPicker`

Instantiate the widget by specifying the dimensions of the map and references to the
form fields that should be updated when the marker is moved:

    new LocationPicker('after', '#dataForm', {
        width:      600,
        height:     400,
        latField:   '#dataForm [name=lat]',
        lngField:   '#dataForm [name=lng]'
    });

The first two arguments specify where to insert the widget in the document;
here we insert it `after` the element selected by `#dataForm`. THe other valid
position arguments are `before`, `top` and `bottom`.

  [helium]:    http://github.com/othermedia/helium
  [gmap2docs]: http://code.google.com/apis/maps/documentation/javascript/v2/index.html


API methods
-----------

Instances of the `LocationPicker` class have the following methods available.

### `LocationPicker#getHTML()`

Returns the HTML representation of the widget.

### `LocationPicker#pullLocation()`

Extracts location data from the form fields and updates the marker location.

### `LocationPicker#pushLocation()`

Updates the form fields with the current marker position.

### `LocationPicker#getMarker()`

Returns the Google Maps marker used by the widget.

### `LocationPicker#positionMarker()`

Places the marker at the correct location and updates the form fields.

### `LocationPicker#search([address])`

Runs a geocoding search using the current address value and moves the marker to
the resulting location. If the `address` parameter is provided, the address
field will be set to that value prior to performing the search.

### `LocationPicker#getAddress()`

Returns the value of the address field.

### `LocationPicker#setAddress(address)`

Sets the value attribute of the address field to the `address` argument.
