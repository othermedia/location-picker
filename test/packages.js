JS.Packages(function() { with(this) {

    file('./lib/location-picker-min.js')
        .provides("LocationPicker")
        .requires("JS.MethodChain", "JS.Class", "GMap2", "GClientGeocoder", "GEvent", "GLatLng", "GMarker")
        .uses("Ojay", "Ojay.HTML");
}});
