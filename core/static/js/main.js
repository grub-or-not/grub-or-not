let searchForm = document.querySelector('#search-form');
let searchInput = document.querySelector('#search-input');
let resultsDisplay = document.querySelector('#results-display');

// search event listener
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    let fullUrl = createFullRestaurantDetailsUrl();

    fetch(fullUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            console.log(response);

            clearResultsDisplay();

            displayRestaurantResults(response);
        })
        .catch(function(error) {
            console.log('Request failed', error);
        });
});

function clearResultsDisplay() {
    resultsDisplay.innerHTML = '';
}

// Wake County Restaurants API
function createFullRestaurantDetailsUrl() {
    let restaurantApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?outFields=*&outSR=4326&f=json&where=NAME%20%3D%20';
    let restaurantName = encodeURI(searchInput.value);
    return `${restaurantApi}'${restaurantName}'`;
}

// display an individual restaurant's details
function displayRestaurantDetails(restaurant) {

    // Yelp API
    fetch(createFullYelpSearchUrl(restaurant))
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            console.log(response);
            let restaurantRating = response.businesses[0].rating;
            let restaurantNumReviews = response.businesses[0].review_count;

            // create div to hold restaurant yelp rating and num reviews
            let restaurantYelpRating = document.createElement('div');
            restaurantYelpRating.innerHTML = `Yelp Rating: ${restaurantRating}/5 (${restaurantNumReviews} Reviews)`;
            resultDiv.appendChild(restaurantYelpRating);    
            
            // add line break for spacing
            resultDiv.appendChild(document.createElement('br'));
        })
        .catch(err => {
          console.log(err);
        });

    // create div to hold all restaurant details
    let resultDiv = document.createElement('li');
    resultDiv.classList += 'mdl-list__item mdl-list__item--three-line';
    resultDiv.setAttribute('data-hsisid', restaurant.HSISID);


    // Create span class to hold detail information
    let restaurantDetail = document.createElement('span');
    restaurantDetail.classList += 'mdl-list__item-primary-content';
    resultDiv.appendChild(restaurantDetail);


    // create icon for each restaurant result
    let restaurantIcon = document.createElement('i');
    restaurantIcon.classList += 'material-icons mdl-list__item-avatar';
    restaurantIcon.innerHTML = 'restaurant';
    restaurantDetail.appendChild(restaurantIcon);


    // create div to hold restaurant name
    let restaurantName = document.createElement('span');
    restaurantName.innerHTML = restaurant.NAME;
    restaurantDetail.appendChild(restaurantName);


    // create div to hold restaurant address
    let restaurantAddress = document.createElement('span');
    restaurantAddress.classList += 'mdl-list__item-text-body';
    restaurantAddress.innerHTML = restaurant.ADDRESS1 + ' ' + restaurant.CITY + ' ' + restaurant.POSTALCODE + ' ' + restaurant.PHONENUMBER;
    restaurantDetail.appendChild(restaurantAddress);


    let restaurantRating = document.createElement('span');
    restaurantRating.classList += 'mdl-list__item-secondary-content';
    resultDiv.appendChild(restaurantRating);

    let ratingIcon = document.createElement('i');
    ratingIcon.classList += 'material-icons rating';
    ratingIcon.innerHTML = 'tag_faces';
    restaurantRating.appendChild(ratingIcon);


    // create div to hold restaurant city
    // let restaurantCity = document.createElement('div');
    // restaurantCity.innerHTML = restaurant.CITY;
    // resultDiv.appendChild(restaurantCity);

    // create div to hold restaurant postal code
    // let restaurantPostalCode = document.createElement('div');
    // restaurantPostalCode.innerHTML = restaurant.POSTALCODE;
    // resultDiv.appendChild(restaurantPostalCode);

    // create div to hold restaurant phone number
    // let restaurantPhoneNumber = document.createElement('div');
    // restaurantPhoneNumber.innerHTML = restaurant.PHONENUMBER;
    // resultDiv.appendChild(restaurantPhoneNumber);

    // add line break for spacing
    resultDiv.appendChild(document.createElement('br'));

    // add restaurant detail div to results display div
    resultsDisplay.appendChild(resultDiv);
}

// display all restaurant results returned from api call
function displayRestaurantResults(response) {
    // display restaurant results if there are matches,
    // else display a message that no restaurants are found
    if (response.features.length > 0) {
        for (let feature of response.features) {
            console.log(feature.attributes);
            displayRestaurantDetails(feature.attributes);
        }
    }
    else {
        resultsDisplay.innerHTML = 'No Restaurants Found.';
    }
}



// event listener for when an individual restaurant is clicked
resultsDisplay.addEventListener('click', function (event) {
    // if event.target is a child of div class="restaurant", set targetResultDiv to the parent div
    // else, set targetResultDiv to event.target
    let targetResultDiv;
    if (event.target.matches('div.restaurant')) {
        targetResultDiv = event.target;
    }
    else if (event.target.closest('div.restaurant')) {
        targetResultDiv = event.target.parentElement;
    }

    // if event.target is div class="restaurant" or if event.target is a child of div class="restaurant"
    if (event.target.matches('div.restaurant') || event.target.closest('div.restaurant')) {
        console.log('restaurant clicked: ' + targetResultDiv.dataset.hsisid);

        let fullUrl = createFullRestaurantInspectionsUrl(targetResultDiv.dataset.hsisid);

        fetch(fullUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                console.log('inspections:');
                console.log(response);
    
                // clearResultsDisplay();
    
                displayInspectionResults(response);
            })
            .catch(function(error) {
                console.log('Request failed', error);
            });
    }
});

// Wake County Food Inspections API
function createFullRestaurantInspectionsUrl(hsisid) {
    let inspectionsApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/1/query?outFields=*&outSR=4326&f=json&where=HSISID%20%3D%20';
    return `${inspectionsApi}${hsisid}`;
}

// display an individual inspection's details
function displayInspectionDetails(inspection) {
    // create div to hold all inspection details
    let resultDiv = document.createElement('div');
    resultDiv.classList += 'inspection';

    // create div to hold inspection date
    let inspectionDate = document.createElement('div');
    let date = new Date(inspection.DATE_);
    inspectionDate.innerHTML = date.toLocaleString().split(',')[0];
    resultDiv.appendChild(inspectionDate);

    // create div to hold inspection score
    let inspectionScore = document.createElement('div');
    inspectionScore.innerHTML = inspection.SCORE;
    resultDiv.appendChild(inspectionScore);

    // create div to hold inspection description
    let inspectionDescription = document.createElement('div');
    inspectionDescription.innerHTML = inspection.DESCRIPTION;
    resultDiv.appendChild(inspectionDescription);

    // add line break for spacing
    resultDiv.appendChild(document.createElement('br'));

    // add inspection detail div to results display div
    let restaurantDisplay = document.querySelector(`[data-hsisid='${inspection.HSISID}']`);
    restaurantDisplay.appendChild(resultDiv);
}


// display all inspection results returned from api call
function displayInspectionResults(response) {
    // display inspection results if there are matches,
    // else display a message that no inspections are found
    if (response.features.length > 0) {
        for (let feature of response.features) {
            console.log(feature.attributes);
            displayInspectionDetails(feature.attributes);
        }
    }
    else {
        resultsDisplay.innerHTML = 'No Inspections Found.';
    }
}



function createFullYelpSearchUrl(restaurant) {
    let yelpSearchUrl = '/yelp';
    let term = encodeURI(restaurant.NAME);
    let longitude = encodeURI(restaurant.X);
    let latitude = encodeURI(restaurant.Y);
    let limit = 1;
    return `${yelpSearchUrl}/${term}/${longitude}/${latitude}/${limit}`;
}

