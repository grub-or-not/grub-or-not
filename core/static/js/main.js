let searchForm = document.querySelector('#search-form');
let searchInput = document.querySelector('#search-input');
let resultsDisplay = document.querySelector('#results-display');

function clearResultsDisplay() {
    resultsDisplay.innerHTML = '';
}

// search event listener
// when user searches for a restaurant
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    let fullRestaurantDetailsUrl = createFullRestaurantDetailsUrl();

    fetch(fullRestaurantDetailsUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            clearResultsDisplay();

            displayRestaurantResults(response);
        })
        .catch(function(error) {
            console.log('Request failed', error);
        });
});

// create URL for Wake County Restaurants API
function createFullRestaurantDetailsUrl() {
    let restaurantApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?outFields=*&outSR=4326&f=json&where=NAME%20%3D%20';
    let restaurantName = encodeURI(searchInput.value);
    return `${restaurantApi}'${restaurantName}'`;
}

// from the result of Wake County Restaurants API,
// display an individual restaurant's details
function displayRestaurantDetails(restaurant) {

    // call Inspections API
    // and display latest Inspection score
    let fullRestaurantInspectionsUrl = createFullRestaurantInspectionsUrl(restaurant.PERMITID);

    fetch(fullRestaurantInspectionsUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {

            // clearResultsDisplay();

            displayLatestInspectionScore(response);
        })
        .catch(function(error) {
            console.log('Request failed', error);
        });   

    // call Yelp API
    // and display Yelp Rating
    fetch(createFullYelpSearchUrl(restaurant))
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            let restaurantRating = response.businesses[0].rating;
            let restaurantNumReviews = response.businesses[0].review_count;

            // create div to hold restaurant yelp rating and num reviews
            let restaurantYelpRating = document.createElement('div');
            restaurantYelpRating.innerHTML = `Yelp Rating: ${restaurantRating}/5 (${restaurantNumReviews} Reviews)`;
            resultDiv.appendChild(restaurantYelpRating);
        })
        .catch(function(error) {
            console.log('Request failed', error);
        });

    // create div to hold all restaurant details
    let resultDiv = document.createElement('div');
    resultDiv.classList.add('restaurant');
    resultDiv.setAttribute('data-permitid', restaurant.PERMITID);


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

    // add restaurant detail div to results display div
    resultsDisplay.appendChild(resultDiv);
}

// display all restaurant results returned
// from Wake County Restaurants API
function displayRestaurantResults(response) {
    // display restaurant results if there are matches,
    // else display a message that no restaurants are found
    if (response.features.length > 0) {
        for (let feature of response.features) {
            displayRestaurantDetails(feature.attributes);
        }
    }
    else {
        resultsDisplay.innerHTML = 'No Restaurants Found.';
    }
}

// call Wake County Restaurants Inspections API
// and display inspections when a restaurant is clicked
resultsDisplay.addEventListener('click', function (event) {
    // targetResultDiv must have data-permitid attribute
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

        let fullRestaurantInspectionsUrl = createFullRestaurantInspectionsUrl(targetResultDiv.dataset.permitid);

        fetch(fullRestaurantInspectionsUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
    
                // clearResultsDisplay();
    
                displayInspectionResults(response);
            })
            .catch(function(error) {
                console.log('Request failed', error);
            });
    }
});

// Wake County Food Inspections API
function createFullRestaurantInspectionsUrl(permitid) {
    let inspectionsApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/1/query?outFields=*&outSR=4326&f=json&where=PERMITID%20%3D%20';
    return `${inspectionsApi}${permitid}`;
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
    let restaurantDisplay = document.querySelector(`[data-permitid='${inspection.PERMITID}']`);
    restaurantDisplay.appendChild(resultDiv);
}

// display latest inspection score returned from Wake County Inspections API
function displayLatestInspectionScore(response) {

    // display latest inspection score if there are matches,
    // else display a message that no inspections are found
    if (response.features.length > 0) {
        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);
        let latestInspectionScore = document.createElement('span');
        let date = new Date(response.features[response.features.length - 1].attributes.DATE_);
        date = date.toLocaleString().split(',')[0];
        latestInspectionScore.innerHTML = `Latest Inspection Score: ${response.features[response.features.length - 1].attributes.SCORE} (${date})`;
        restaurantDisplay.appendChild(latestInspectionScore);
    }
    else {
        resultsDisplay.innerHTML = 'No Inspections Found.';
    }
}


// display all inspection results returned from api call
function displayInspectionResults(response) {

    // display inspection results if there are matches,
    // else display a message that no inspections are found
    if (response.features.length > 0) {

        let listOfInspectionScoreDates = [];
        let listOfInspectionScores = [];

        for (let feature of response.features) {
            // displayInspectionDetails(feature.attributes);

            let date = new Date(feature.attributes.DATE_);
            listOfInspectionScoreDates.push(date.toLocaleString().split(',')[0]);
            listOfInspectionScores.push(feature.attributes.SCORE);
        }
        
        // add inspection chart to restaurant div
        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);

        // add inspection chart to restaurant div
        displayInspectionChart(restaurantDisplay, listOfInspectionScoreDates, listOfInspectionScores);
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

// given an html element, and two lists holding inspection dates and scores,
// generate a line chart and place in the html element
function displayInspectionChart(restaurantDisplay, listOfInspectionScoreDates, listOfInspectionScores) {
    // create div to hold inspection chart
    let sanitationChartDiv = document.createElement('div');
    sanitationChartDiv.classList.add('sanitation-chart');
    let sanitationChart = document.createElement('canvas');
    sanitationChart.id = `${restaurantDisplay.getAttribute('data-permitid')}`;
    sanitationChartDiv.classList.add('sanitation-chart');
    sanitationChartDiv.appendChild(sanitationChart);
    restaurantDisplay.appendChild(sanitationChartDiv);

    var ctx = document.getElementById(`${restaurantDisplay.getAttribute('data-permitid')}`).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: listOfInspectionScoreDates,
            datasets: [{
                label: 'Sanitation Score',
                data: listOfInspectionScores,
                borderWidth: 3,
                backgroundColor: 'rgba(244, 151, 108, 0.5)',
                borderColor: 'rgb(244, 151, 108)',
            }]
        },
        options: {
            scales: { 
                yAxes: [{ 
                    ticks: {
                        // beginAtZero: true
                        min: 70
                    }
                }]
            }
        }
    });

}

