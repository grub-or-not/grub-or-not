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
        })
        .catch(err => {
          console.log(err);
        });

    // create div to hold all restaurant details
    let resultDiv = document.createElement('div');
    resultDiv.classList.add('restaurant');
    resultDiv.setAttribute('data-hsisid', restaurant.HSISID);


    // create icon for each restaurant result
    let restaurantIcon = document.createElement('span');
    restaurantIcon.classList += 'material-icons mdl-list__item-avatar';
    restaurantIcon.innerHTML = 'restaurant';
    resultDiv.appendChild(restaurantIcon);


    // create div to hold restaurant name
    let restaurantName = document.createElement('div');
    restaurantName.innerHTML = restaurant.NAME;
    resultDiv.appendChild(restaurantName);


    // create div to hold restaurant address
    let restaurantAddress = document.createElement('div');
    restaurantAddress.innerHTML = restaurant.ADDRESS1 + ' ' + restaurant.CITY + ' ' + restaurant.POSTALCODE + ' ' + restaurant.PHONENUMBER;
    resultDiv.appendChild(restaurantAddress);

    let ratingIcon = document.createElement('div');
    ratingIcon.classList += 'material-icons rating';
    ratingIcon.innerHTML = 'tag_faces';
    resultDiv.appendChild(ratingIcon);


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



// display inspections when a restaurant is clicked
resultsDisplay.addEventListener('click', function (event) {
    // targetResultDiv must have data-hsisid attribute
    // if event.target is a child of li class="restaurant", set targetResultDiv to the parent div
    // else, set targetResultDiv to event.target
    let targetResultDiv;
    if (event.target.classList.contains('restaurant')) {
        targetResultDiv = event.target;
    }
    else if (event.target.closest('div.restaurant')){
        targetResultDiv = event.target.parentElement;
    }

    // if event.target is li class="restaurant" or if event.target is a child of li class="restaurant"
    if (event.target.classList.contains('restaurant') || event.target.closest('div.restaurant')) {
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

    // add inspection detail div to results display div
    let restaurantDisplay = document.querySelector(`[data-hsisid='${inspection.HSISID}']`);
    restaurantDisplay.appendChild(resultDiv);
}


// display all inspection results returned from api call
function displayInspectionResults(response) {
    // display inspection results if there are matches,
    // else display a message that no inspections are found
    if (response.features.length > 0) {

        let listOfInspectionScoreDates = [];
        let listOfInspectionScores = [];

        for (let feature of response.features) {
            console.log(feature.attributes);
            displayInspectionDetails(feature.attributes);

            let date = new Date(feature.attributes.DATE_);
            listOfInspectionScoreDates.push(date.toLocaleString().split(',')[0]);
            listOfInspectionScores.push(feature.attributes.SCORE);
        }
        console.log('INSPECTION SCORES: ');
        console.log(listOfInspectionScoreDates);
        console.log(listOfInspectionScores);

        displayInspectionChart(listOfInspectionScoreDates, listOfInspectionScores);
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

function displayInspectionChart(listOfInspectionScoreDates, listOfInspectionScores) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: listOfInspectionScoreDates,
            datasets: [{
                label: 'Sanitation Scores',
                data: listOfInspectionScores,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 3
            }]
        },
        options: {
            scales: { 
                yAxes: [{ 
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    });

}

