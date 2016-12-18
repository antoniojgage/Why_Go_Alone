//wait for the page to load

$(document).ready(function() {
    //array of interests

    var interests = ["pizza", "movie", "bowling"];
    var map;
    var infowindow;
    //userRadius not being used yet
    var userRadius;
    var interest;
    var latitude;
    var longitude;

    var user = {
        lat: latitude,
        lng: longitude
    };

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
    }

    renderButton();

    //handle when one button is clicked
    $("#addInterest").on("click", function() {
        console.log("Submit button is clicked");

        //takes the input from the user typed in
        var interest = $("#interestInput").val().trim();

        console.log(interest + " is added to the Array");
        if (interest != "") {
            interests.push(interest);

            renderButton();
        } else {
            $("#interestInput").attr("placeholder", "Enter your interest here.");
            renderButton();
        }
        return false;

    });

    function closeInterest() {
        var index = interests.indexOf($(this).parent().attr("data-name"));
        interests.splice(index, 1);
        renderButton();
    };

    function selectInterest() {
        interest = $(this).data("name");
        if (latitude === undefined || longitude === undefined) {
            geoFindMe();
        } else {
            initMap();
        }
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
        }

        function error() {
            console.log("Error retreiving location");
        }

        console.log("Success Being called now!");
        navigator.geolocation.getCurrentPosition(success, error);
    }

    $(document).on("click", ".interestButton", selectInterest);
    $(document).on("click", ".closeInterest", closeInterest);
});
