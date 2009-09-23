LocationPicker
==============

A Google Maps widget to help with entering geographic data into web forms. Provides
an address search field to place a marker on the map; the marker can then be dragged
to the exact location required, firing events that update form fields with the marker's
co-ordinates.


Usage
-----

If loading through Helium, the Google API key must be set:

    Helium.GOOGLE_KEY = '{your API key}';

Instantiate the widget by specifying the dimensions of the map and references to the
form fields that should be updated when the marker is moved:

    new LocationPicker('after', '#dataForm', {
        width:      600,
        height:     400,
        latField:   '#dataForm [name=lat]',
        lngField:   '#dataForm [name=lng]'
    });

The first two arguments specify where to insert the widget in the document; here we
insert it `after` the element selected by `#dataForm`.

