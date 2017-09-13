//wait for the page to load
$(document).ready(function() {

    // Initialize Firebase
    var config = {
        //ARGG Wheres me API.
    };
    // The second argument to initialize app differentiates this database from Friendly Chat.
    var usersApp = firebase.initializeApp(config, "users-database");
    var usersDatabase = usersApp.database();

    var interests;
    var map;
    var infowindow;
    var currentInterest;
    var latitude;
    var longitude;
    var numPeople;
    var uid;
    var user = {
        lat: latitude,
        lng: longitude
    };
    //variables that is used to check if a user is logged into friendly chat.
    var currentUser = firebase.auth().currentUser;
    //If a user does not exist the user object will be created in the why go alone database.
    //If user exists we will get the users current interests
    function createUserOrGetInterests(uid, doesNotExist) {
        if (doesNotExist) {
            usersDatabase.ref().child("users").child(uid).set({ 
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
    //If there is a logout or login activity there will be a check to see if a user is logged in and calls the create user function.
    firebase.auth().onAuthStateChanged(function(currentUser) {
        if (currentUser) {
            console.log("there is a user");
            uid = currentUser.uid;
            user_name = currentUser.displayName;
            usersDatabase.ref().child("users").child(uid).on('value', function(snapshot) {
                var doesNotExist = (snapshot.val() === null);
                createUserOrGetInterests(uid, doesNotExist);
            });
        } else {
            console.log("there is no user");
        }
    });

    //Creates a button for the interests in the interests array.
    function renderButton() {
        $("#interestView").empty();
        for (var i = 0; i < interests.length; i++) {
            var newButton = $('<button data-name="' + interests[i] + '" class="btn btn-primary interestButton">' + interests[i] + '</button>');
            newButton.append($("<div class='closeInterest'>x</div>"));
            $("#interestView").append(newButton);
        }
    };

    //an interest is added and pushed into the interest array.  The interest array is then pushed into the database.
    $("#addInterest").on("click", function() {
        //takes the input from the user typed in
        var currentInterest = $("#interestInput").val().trim();
        currentInterest = currentInterest.toUpperCase();
        if (currentInterest != "") {
            interests.push(currentInterest);
            //wipe array from database and push new array to database.
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
    //This function deletes the interest button from the page and creates a new array with the still active interests.
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
    //When interest button is clicked a map is created for the interest
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
    //Checks the database for people who are interested in a particular activity.
    function checkDatabase() {
        usersDatabase.ref("/users").on("child_added", function(snap) {
            var len = snap.numChildren();
            var key = snap.key; //"ada"
            var name = snap.val().name;
            var interestList = snap.val().interests;
            if (interestList.indexOf(currentInterest) !== -1) {
                numPeople++;
            }
        });
    };  
    //InitMap function generates the google map and calls functions to create the place markers and user location marker.
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: user,
            zoom: 11
        });
        var request = {
            location: user,
            radius: '500',
            query: currentInterest
        };
        //added to reference a certain set of markers styles
        var iconBase = 'http://maps.google.com/mapfiles/kml/paddle/';
        //This is the marker for the specific user location.
        var userMarker = new google.maps.Marker({
            map: map,
            position: user,
            icon: iconBase + 'blu-circle.png'
        });
        userMarker.name = "You are here";
        //Infowindow is used to display Google Maps content in the popup window such as ratings, address, etc.
        infowindow = new google.maps.InfoWindow();

        var service = new google.maps.places.PlacesService(map);
        //Searches for what the users interest is
        service.textSearch(request, callback);
    };
    //Function that gives an error if the location can't be found.
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    };
    //Function that calls createMarker for each place the query returns.
    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    };
    //Function that creates the marker of the interest locations
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

    // function addMarker(feature) {
    //     var marker = new google.maps.Marker({
    //         position: feature.position,
    //         icon: icons[feature.type].icon,
    //         map: map
    //     });
    // };
    
    //This function pulls the location of the current user.
    function geoFindMe() {
        var output = document.getElementById("out");


        if (!navigator.geolocation) {
            error();
            return;
        }

        //This function sets the coordinates and calls the map if a location if found.
        function success(position) {
            user.lat = position.coords.latitude;
            user.lng = position.coords.longitude;
            initMap();
        };
        function error() {
            console.log("Error retreiving location");
        };

        navigator.geolocation.getCurrentPosition(success, error);
    };

    $(document).on("click", ".interestButton", selectInterest);
    $(document).on("click", ".closeInterest", closeInterest);
});