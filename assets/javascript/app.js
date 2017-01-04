//wait for the page to load
$(document).ready(function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyByWTJGeG8HO1UyH2pubvp022Q2AXvJc88",
        authDomain: "why-go-alone.firebaseapp.com",
        databaseURL: "https://why-go-alone.firebaseio.com",
        storageBucket: "why-go-alone.appspot.com",
        messagingSenderId: "141733030000"
    };

    var usersApp = firebase.initializeApp(config, "users-database");

    // var usersDatabase = 'https://why-go-alone.firebaseio.com/users';
    var usersDatabase = usersApp.database();

    //array of interests
    var interests;
    var map;
    var infowindow;
    //userRadius not being used yet
    var userRadius;
    var currentInterest;
    var latitude;
    var longitude;
    var numPeople;
    var uid;
    var user_name;

    var user = {
        lat: latitude,
        lng: longitude
    };
    var infinityCount = 0;
    var userObject;

    var currentUser = firebase.auth().currentUser;

    function createUser(uid, doesNotExist) {
        if (doesNotExist) {
            usersDatabase.ref().child("users").child(uid).set({ 
                name: user_name, 
                interests: ["PIZZA", "MOVIE", "BOWLING"] 
            });
        } else {
            console.log('user ' + uid + 'already exists!');
            usersDatabase.ref().child("users").child(uid).on('value', function(snapshot) {
                interests = snapshot.val().interests;
                renderButton();
            });
        }
    }

    firebase.auth().onAuthStateChanged(function(currentUser) {
        if (currentUser) {
            console.log("there is a user");
            uid = currentUser.uid;
            user_name = currentUser.displayName;
            console.log(uid);
            // usersDatabase.ref().child("users").child(uid).set({ name: "Mary Willis", interests: ["sushi", "pizza", "shopping"] });
            usersDatabase.ref().child("users").child(uid).on('value', function(snapshot) {
                var doesNotExist = (snapshot.val() === null);
                createUser(uid, doesNotExist);
            });
        } else {
            console.log("there is no user");
        }
    });

    //Generic function display the interests
    function renderButton() {
        $("#interestView").empty();

        //loop through the array of interests
        for (var i = 0; i < interests.length; i++) {
            //dynamically generate the buttons when the page isloaded
            var newButton = $('<button data-name="' + interests[i] + '" class="btn btn-primary interestButton">' + interests[i] + '</button>');
            newButton.append($("<div class='closeInterest'>x</div>"));
            //jQuery
            $("#interestView").append(newButton);
        }
    };

    // renderButton();

    //handle when one button is clicked
    $("#addInterest").on("click", function() {
        console.log("Submit button is clicked");

        //takes the input from the user typed in
        var currentInterest = $("#interestInput").val().trim();
        currentInterest = currentInterest.toUpperCase();
        console.log(currentInterest);

        console.log(currentInterest + " is added to the Array");
        if (currentInterest != "") {
            interests.push(currentInterest);
            //wipe array from database and push new array to database
            usersDatabase.ref().child("users").child(uid).set({ 
                interests: interests
            });
            $("#interestInput").val("");
            $("#interestInput").attr("placeholder", "tell me your interest");
            renderButton();
        } else {
            return;
        }
        return false;
    });

    function closeInterest() {
        var index = interests.indexOf($(this).parent().attr("data-name"));
        interests.splice(index, 1);
        //wipe array from database and push new array to database
        usersDatabase.ref().child("users").child(uid).set({ 
            interests: interests
        });
        $("#map").html($("<p style='margin-top: 25px'>Click on an interest to find things to do with people near you!</p>"));
        renderButton();
        if (interests.indexOf(currentInterest) !== -1) {
            initMap();
        }
    };

    function selectInterest() {
        currentInterest = $(this).data("name");
        numPeople = 0;
        if (interests.indexOf(currentInterest) !== -1) {
            if (latitude === undefined || longitude === undefined) {
                checkDatabase();
                geoFindMe();
            } else {
                checkDatabase();
                initMap();
            }
        }
    };

    //TODO change this to listen to changes in people's interstes rather than users added
    function checkDatabase() {
        usersDatabase.ref("/users").on("child_added", function(snap) {
            var len = snap.numChildren();
            console.log(len);
            var key = snap.key; //"ada"
            var name = snap.val().name;
            var interestList = snap.val().interests;
            if (interestList.indexOf(currentInterest) !== -1) {
                numPeople++;
            }
            console.log("Key = " + key + " Name = " + name);
            console.log(interestList);
        });
    };

    usersDatabase.ref("/users").on("child_added", function(snap) {
        console.log("hello");
        initMap();
    });   

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
            query: currentInterest
        };

        var iconBase = 'http://maps.google.com/mapfiles/kml/paddle/';

        var userMarker = new google.maps.Marker({
            map: map,
            position: user,
            icon: iconBase + 'blu-circle.png'
        });
        userMarker.name = "You are here";

        console.log("request: ");
        console.log(request);

        infowindow = new google.maps.InfoWindow();

        var service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
    };

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    };

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    };

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
        });

        google.maps.event.addListener(marker, 'click', function() {
            //infoWindow.setContent contains all of the information you want to show up in the marker.  Custom Text can be added via a string or variable.
            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + place.formatted_address + '</strong><br>' + 'Google Rating: ' + place.rating + '<strong><br>' + numPeople + " people want to go here!");
            infowindow.open(map, this);
        });

    };

    function addMarker(feature) {
        var marker = new google.maps.Marker({
            position: feature.position,
            icon: icons[feature.type].icon,
            map: map
        });
    };
    //START OF GEOLOCATION CODING
    function geoFindMe() {
        var output = document.getElementById("out");


        if (!navigator.geolocation) {
            error();
            return;
        }

        function success(position) {
            user.lat = position.coords.latitude;
            user.lng = position.coords.longitude;
            console.log("User in Success = ");
            console.log(user);
            console.log("Calling InitMap");
            initMap();
        };

        function error() {
            console.log("Error retreiving location");
        };

        console.log("Success Being called now!");
        navigator.geolocation.getCurrentPosition(success, error);
    };

    $(document).on("click", ".interestButton", selectInterest);
    $(document).on("click", ".closeInterest", closeInterest);
});
