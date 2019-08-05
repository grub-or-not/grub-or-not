let searchForm = document.querySelector('#search-form');
let searchInput = document.querySelector('#search-input');
let resultsDisplay = document.querySelector('#results-display');
 

function clearResultsDisplay() {
    resultsDisplay.innerHTML = '';
}

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

// Wake County Restaurants API
function createFullRestaurantDetailsUrl() {
    let restaurantApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?outFields=*&outSR=4326&f=json&where=NAME%20%3D%20';
    let restaurantName = encodeURI(searchInput.value);
    return `${restaurantApi}'${restaurantName}'`;
}

// call Wake County Restaurants API
// and display an individual restaurant's details
function displayRestaurantDetails(restaurant) {

    // Yelp API
    fetch(createFullYelpSearchUrl(restaurant))
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            console.log('this is yelp');
            console.log(response);
            let restaurantRating = response.businesses[0].rating;
            let restaurantNumReviews = response.businesses[0].review_count;
            
// ADDED YELP STAR RATING
            let numberOfStars = ''; 
            if (restaurantRating == 1) {
                numberOfStars = '../static/yelp-stars/small_1@2x.png'
            } else if (restaurantRating == 2) {
                numberOfStars = '../static/yelp-stars/small_2@2x.png'
            } else if (restaurantRating == 3) {
                numberOfStars = '../static/yelp-stars/small_3@2x.png'
            } else if (restaurantRating == 4) {
                numberOfStars = '../static/yelp-stars/small_4@2x.png'
            } else  if (restaurantRating == 5) {
                numberOfStars = '../static/yelp-stars/small_5@2x.png'
            } else {
                numberOfStars = '../yelp-stars/small_0@2x.png'
            }


// SET IMAGE INSTEAD OF ICON USING IMG_URL FROM YELP API
            // let restaurantImgUrl = response.businesses[0].image_url;
            // // USE IMG FROM YELP API INSTEAD OF ICON
            // let restaurantPicture = document.createElement('img');
            // restaurantPicture.setAttribute('src', `${restaurantImgUrl}`);
            // resultDiv.appendChild(restaurantPicture);
            // // add a classlist for styling purposes
            // // restaurantIcon.classList += 'material-icons mdl-list__item-avatar';
            // console.log(restaurantImgUrl);
            // create div to hold restaurant yelp rating and num reviews
            let restaurantYelpRating = document.createElement('div');
// ADDED ${numberOfStars} to this line
            restaurantYelpRating.innerHTML = `Yelp Rating: ${restaurantRating}/5 ${numberOfStars} (${restaurantNumReviews} Reviews)`;
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


// SMILEY ICON--- I REMOVED THIS
    // let ratingIcon = document.createElement('div');
    // ratingIcon.classList += 'material-icons rating';
    // ratingIcon.innerHTML = 'tag_faces';
    // resultDiv.appendChild(ratingIcon);

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
            console.log(feature.attributes);
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
    console.log('THIS IS THE RESPONSE YOURE LOOKING AT:');
    console.log(response.features[response.features.length - 1].attributes.SCORE);

    // display inspection results if there are matches,
    // else display a message that no inspections are found
    if (response.features.length > 0) {

        let listOfInspectionScoreDates = [];
        let listOfInspectionScores = [];

        for (let feature of response.features) {
            console.log(feature.attributes);
            // displayInspectionDetails(feature.attributes);

            let date = new Date(feature.attributes.DATE_);
            listOfInspectionScoreDates.push(date.toLocaleString().split(',')[0]);
            listOfInspectionScores.push(feature.attributes.SCORE);
        }
        console.log('INSPECTION SCORES: ');
        console.log(listOfInspectionScoreDates);
        console.log(listOfInspectionScores);
        
        // add inspection chart to restaurant div
        let restaurantDisplay = document.querySelector(`[data-hsisid='${response.features[0].attributes.HSISID}']`);
        
// ADDED RATING SCORES FOR INSPECTIONS 
        let latestScore = response.features[response.features.length - 1].attributes.SCORE;
        let numberOfIcons = '';
            if (latestScore >= 1 && latestScore <= 20) {
                numberOfIcons = '💩'
            } else if (latestScore>= 21 && latestScore <= 40) {
                numberOfIcons = '💩💩'
            } else if (latestScore>=41 && latestScore <= 60) {
                numberOfIcons = '💩💩💩'
            } else if (latestScore>= 61 && latestScore <=69) {
                numberOfIcons = '💩💩💩💩'
            } else if (latestScore>= 70 && latestScore <=80) {
                numberOfIcons = '🤔🤔🤔🤔'
            } else if (latestScore>= 81 && latestScore <=89) {
                numberOfIcons = '🤔🤔🤔🤔🤔'
            } else if (latestScore>= 90 && latestScore <=100) {
                numberOfIcons = '😍😍😍😍😍'
            } else {
                console.log('No score available');
            }

        let latestInspectionScore = document.createElement('span');
        let date = new Date(response.features[response.features.length - 1].attributes.DATE_);
        date = date.toLocaleString().split(',')[0];
// CHANGE MADE HERE: DATE VARIABLE MOVED IN FRONT OF SCORE, ICONS VARIABLE ADDED-- ORDER OF VARIABLES ALTERED
        latestInspectionScore.innerHTML = `Latest Inspection Score: ${date } ${ numberOfIcons} (${response.features[response.features.length - 1].attributes.SCORE}) `;
        restaurantDisplay.appendChild(latestInspectionScore);


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
    sanitationChart.id = `${restaurantDisplay.getAttribute('data-hsisid')}`;
    sanitationChartDiv.classList.add('sanitation-chart');
    sanitationChartDiv.appendChild(sanitationChart);
    restaurantDisplay.appendChild(sanitationChartDiv);

    var ctx = document.getElementById(`${restaurantDisplay.getAttribute('data-hsisid')}`).getContext('2d');
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

