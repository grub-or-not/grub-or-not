let searchForm = document.querySelector('#search-form');
let searchInput = document.querySelector('#search-input');
let resultsDisplay = document.querySelector('#results-display');

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

function createFullRestaurantDetailsUrl() {
    let restaurantApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?outFields=*&outSR=4326&f=json&where=NAME%20%3D%20';
    let restaurantName = encodeURI(searchInput.value);
    return `${restaurantApi}'${restaurantName}'`;
}

// display an individual restaurant's details
function displayRestaurantDetails(restaurant) {
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