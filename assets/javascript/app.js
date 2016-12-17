    var map;
    var infowindow;
    //need to ask user for this
    var userRadius;
    var interest = "pizza";
    var keyword;
    //plug user location in here
    // var latitude = 30.4704588;
    // var longitude = -97.68593229999999;
    var latitude;
    var longitude;

    var user = {
        lat: latitude,
        lng: longitude
    };

    // var queryURL = "https://api.yelp.com/v2/search?term=" + interest + "&location=" + user;
    // console.log(queryURL);
    // $.ajax({ url: queryURL, method: "GET" }).done(function(response) {
    //     console.log(response);
    // });

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
            // keyword: interest,
            query: interest
        };

        console.log("request: ");
        console.log(request);

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        // service.nearbySearch(request, callback);
        service.textSearch(request, callback);
    }

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < 3; i++) {
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
    //START OF GEOLOCATION CODING
    function geoFindMe() {
        var output = document.getElementById("out");

        if (!navigator.geolocation) {
            output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
            return;
        }

        function success(position) {
            user.lat = position.coords.latitude;
            user.lng = position.coords.longitude;
            console.log("User in Success = ");
            console.log(user);
            output.innerHTML = '<p>Latitude is ' + user.lat + '&deg; <br>Longitude is ' + user.lng + '&deg;</p>';
            // var img = new Image();
            // img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";
            // output.appendChild(img);
            console.log("Calling InitMap");
            initMap();
        }

        function error() {
            output.innerHTML = "Unable to retrieve your location";
        }

        output.innerHTML = "<p>Locating…</p>";
        console.log("Success Being called now!");
        navigator.geolocation.getCurrentPosition(success, error);
    }

    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            testAPI();
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            document.getElementById('status').innerHTML = 'Please log ' +
                'into this app.';
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            document.getElementById('status').innerHTML = 'Please log ' +
                'into Facebook.';
        }
    }

    // This function is called when someone finishes with the Login
    // Button.  See the onlogin handler attached to it in the sample
    // code below.
    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId: '858186090985499',
            cookie: true, // enable cookies to allow the server to access 
            // the session
            xfbml: true, // parse social plugins on this page
            version: 'v2.8' // use graph api version 2.8
        });

        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });

    };

    // Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log('Successful login for: ' + response.name);
            document.getElementById('status').innerHTML =
                'Thanks for logging in, ' + response.name + '!';
        });
    }


    function myFacebookLogin() {
        FB.login(function() {}, {
            scope: 'publish_actions'
        });
    }

    $("#myFacebookLogin").on("click", function(event) {
        myFacebookLogin();
    });

    $("#geoFindMe").on("click", function(event) {
        geoFindMe();
        console.log("Calling Functions");
        // $("#addGoogle").attr("src",'https://maps.googleapis.com/maps/api/js?key=AIzaSyC6as3rvHxfYoYeZ00Qk-6hFyY0qm0LQGc&libraries=places');
        // initMap();
    });
