//wait for the page to load
$(document).ready(function() {
    //array of interests

    var interests = ["pizza", "movie", "bowling"];
    //Generic function display the interests
    function renderButton() {
        $("#interestView").empty();

        //loop through the array of interests
        for (var i = 0; i < interests.length; i++) {
            //dynamically generate the buttons when the page isloaded

            //jQuery
            $("#interestView").append('<button data-name="' + interests[i] + '" class="btn btn-primary interestButton">' + interests[i] + '</button>');
        }
    }
    //handle when one button is clicked
    $("#addInterest").on("click", function() {
        console.log("Submit button is clicked");

        //takes the input from the user typed in
        var interest = $("#interestInput").val().trim();

        console.log(interest + " is added to the Array");
        if (interest != "") {
            interests.push(interest);

            $("#interestInput").val("");
            $("#interestInput").attr("placeholder", "tell me your interest");
            renderButton();
        } else {
            return;
        }
        return false;
    });
    renderButton();
});

var map;
var infowindow;
var userRadius;
var interest = "pizza";
var keyword;
// var latitude = 30.4704588;
// var longitude = -97.68593229999999;
var latitude;
var longitude;

var user = {
    lat: latitude,
    lng: longitude
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: user,
        //need to figure appropriate zoom (maybe based on how far of a radius the user chooses)
        zoom: 11
    });
    console.log("initMap - USER:");
    console.log(user);


    var request = {
        location: user,
        radius: '500',
        query: interest
    };

    console.log("request: ");
    console.log(request);

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function selectInterest() {
    interest = $(this).data("name");
    if (latitude === undefined || longitude === undefined) {
        geoFindMe();
    } else {
        initMap();
    }
};

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });

}
//START OF GEOLOCATION CODING
function geoFindMe() {
    var output = document.getElementById("out");

    if (!navigator.geolocation) {

        output.innerHTML = "<p>Geolocation is not supported by your browser</p>";

        error();

        return;
    }

    function success(position) {
        user.lat = position.coords.latitude;
        user.lng = position.coords.longitude;
        console.log("User in Success = ");
        console.log(user);

        // output.innerHTML = '<p>Latitude is ' + user.lat + '&deg; <br>Longitude is ' + user.lng + '&deg;</p>';

        console.log("Calling InitMap");
        initMap();
    }

    function error() {

        output.innerHTML = "Unable to retrieve your location";
    }

    // output.innerHTML = "<p>Locating…</p>";
    console.log("Success Being called now!");
    navigator.geolocation.getCurrentPosition(success, error);
}



$("#geoFindMe").on("click", function(event) {
    geoFindMe();
    console.log("Calling Functions");
});

$(document).on("click", ".interestButton", selectInterest);
