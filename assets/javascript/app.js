var map;
var infowindow;
//need to ask user for this
var userRadius;

function initMap() {
    //plug user location in here
    var austin = { lat: 30.267, lng: -97.743 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: austin,
        //need to figure appropriate zoom (maybe based on how far of a radius the user chooses)
        zoom: 11
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: austin,
        //once again need to determine the radius based on user input
        radius: 50000,
        //take the top names from yelp results and put them in here (how to do multiple keywords on one map?)
        keyword: 'top golf'
    }, callback);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {

            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        //can put yelp reults in the bubble here
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}