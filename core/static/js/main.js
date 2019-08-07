const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const resultsDisplay = document.querySelector('#results-display');
let latestInspectionDate;
 

function clearResultsDisplay() {
    resultsDisplay.innerHTML = '';
}

// search event listener
// when user searches for a restaurant
if (searchForm) {
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
}

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
            
             
            // ADDED YELP STAR RATING
            let numberOfStars = ''; 
            if (restaurantRating == 1) {
                numberOfStars = '../static/yelp-stars/small_1@2x.png'
            } else if (restaurantRating == 1.5) {
                numberOfStars = '../static/yelp-stars/small_1_half@2x.png'
            } else if (restaurantRating == 2) {
                numberOfStars = '../static/yelp-stars/small_2@2x.png'
            } else if (restaurantRating == 2.5) {
                numberOfStars = '../static/yelp-stars/small_2_half@2x.png'
            } else if (restaurantRating == 3) {
                numberOfStars = '../static/yelp-stars/small_3@2x.png'
            } else if (restaurantRating == 3.5) {
                numberOfStars = '../static/yelp-stars/small_3_half@2x.png'
            } else if (restaurantRating == 4) {
                numberOfStars = '../static/yelp-stars/small_4@2x.png'
            } else if (restaurantRating == 4.5) {
                numberOfStars = '../static/yelp-stars/small_4_half@2x.png'
            } else  if (restaurantRating == 5) {
                numberOfStars = '../static/yelp-stars/small_5@2x.png'
            } else {
                numberOfStars = '../static/yelp-stars/small_0@2x.png'
            }


            // SET IMAGE INSTEAD OF ICON USING IMG_URL FROM YELP API
            let restaurantImgUrl = response.businesses[0].image_url;
            // USE IMG FROM YELP API INSTEAD OF ICON
            let restaurantPicture = document.createElement('img');
            restaurantPicture.setAttribute('src', `${restaurantImgUrl}`);
            resultDiv.appendChild(restaurantPicture);
            // ADDED A CLASS LIST 
            restaurantPicture.classList += 'yelp-image';
            console.log(restaurantImgUrl);



            // create div to hold restaurant yelp rating and num reviews
            let restaurantYelpRating = document.createElement('div');
            let restaurantYelpRatingStars = document.createElement('img');
            restaurantYelpRatingStars.src = numberOfStars;
            restaurantYelpRating.innerHTML = `Yelp Rating: ${restaurantRating}/5 (${restaurantNumReviews} Reviews)`;
            restaurantYelpRating.appendChild(restaurantYelpRatingStars);
            resultDiv.appendChild(restaurantYelpRating);
        })
        .catch(function(error) {
            console.log('Request failed', error);
        });

    // create div to hold all restaurant details
    let resultDiv = document.createElement('div');
    resultDiv.classList.add('restaurant');
    resultDiv.setAttribute('data-permitid', restaurant.PERMITID);


    // // create icon for each restaurant result
    // let restaurantIcon = document.createElement('span');
    // restaurantIcon.classList += 'material-icons mdl-list__item-avatar';
    // restaurantIcon.innerHTML = 'restaurant';
    // resultDiv.appendChild(restaurantIcon);
    
    // create favorite button for user to save to profile
    let favButton = document.createElement('a');
    favButton.innerHTML = '<i class="material-icons">favorite </i>';
    favButton.href = '/favorite/'+ restaurant.PERMITID+'/'+restaurant.NAME;
    resultDiv.appendChild(favButton);


    
    // create div to hold restaurant name
    let restaurantName = document.createElement('div');
    restaurantName.innerHTML = restaurant.NAME;
// ADDED CLASS LIST 
    restaurantName.classList.add('restaurant-name');
    resultDiv.appendChild(restaurantName);
 

    // create div to hold restaurant address
    let restaurantAddress = document.createElement('div');
    restaurantAddress.innerHTML = restaurant.ADDRESS1 + '<br> ' + restaurant.CITY + ' ' + restaurant.POSTALCODE + '<br> ' + restaurant.PHONENUMBER;
    restaurantAddress.classList.add('restaurant-address');
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
            displayRestaurantDetails(feature.attributes);
        }
    }
    else {
        resultsDisplay.innerHTML = 'No Restaurants Found.';
    }
}

// when user clicks on an individual restaurant
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
        // call Restaurant Inspections API
        let fullRestaurantInspectionsUrl = createFullRestaurantInspectionsUrl(targetResultDiv.dataset.permitid);

        fetch(fullRestaurantInspectionsUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
    
                // clearResultsDisplay();
    
                console.log(response);
    
                displayInspectionResults(response);
            })
            .catch(function(error) {
                console.log('Request failed', error);
            });

        // call Restaurant Violations API
        let fullRestaurantInspectionViolationsUrl = createFullRestaurantInspectionViolationsUrl(targetResultDiv.dataset.permitid);

        fetch(fullRestaurantInspectionViolationsUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
    
                console.log(response);

                displayInspectionViolationResults(response);
            })
            .catch(function(error) {
                console.log('Request failed', error);
            });
    }
});

function displayInspectionViolationResults(response) {

    // display inspection violation results if there are matches,
    // else display a message that no inspections violations are found
    if (response.features.length > 0) {
        
        // add violation details to restaurant div
        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);


        for (let feature of response.features) {
            console.log(feature.attributes);

            if (feature.attributes.INSPECTDATE == latestInspectionDate) {
                displayViolationDetails(feature.attributes);
            }

        }

    }
    else {
        resultsDisplay.innerHTML = 'No Inspection Violations Found.';
    }
}

// Wake County Food Inspections API
function createFullRestaurantInspectionsUrl(permitid) {
    let inspectionsApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/1/query?outFields=*&outSR=4326&f=json&where=PERMITID%20%3D%20';
    return `${inspectionsApi}${permitid}`;
}

// Wake County Food Inspection Violations API
function createFullRestaurantInspectionViolationsUrl(permitid) {
    let inspectionViolationsApi = 'https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/2/query?outFields=*&outSR=4326&f=json&where=PERMITID%20%3D%20';
    return `${inspectionViolationsApi}${permitid}`;
}

// display an individual violation's details
function displayViolationDetails(violation) {
    // create div to hold all violation details
    let resultDiv = document.createElement('div');
    resultDiv.classList += 'violation';

    // create div to hold violation date
    let violationDate = document.createElement('div');
    let date = new Date(violation.INSPECTDATE);
    violationDate.innerHTML = date.toLocaleString().split(',')[0];
    resultDiv.appendChild(violationDate);

    // create div to hold violation score
    let violationScore = document.createElement('div');
    violationScore.innerHTML = violation.POINTVALUE;
    resultDiv.appendChild(violationScore);

    // create div to hold violation description
    let violationDescription = document.createElement('div');
    violationDescription.innerHTML = violation.SHORTDESC;
    resultDiv.appendChild(violationDescription);

    // add violation detail div to results display div
    let restaurantDisplay = document.querySelector(`[data-permitid='${violation.PERMITID}']`);
    restaurantDisplay.appendChild(resultDiv);
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
                numberOfIcons = 'No score available'
            }

        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);


        let latestInspectionScore = document.createElement('span');
        latestInspectionDate = response.features[response.features.length - 1].attributes.DATE_;
        let date = new Date(latestInspectionDate);
        date = date.toLocaleString().split(',')[0];
        // CHANGE MADE HERE: DATE VARIABLE MOVED IN FRONT OF SCORE, ICONS VARIABLE ADDED-- ORDER OF VARIABLES ALTERED
        latestInspectionScore.innerHTML = `Latest Inspection Score: ${date } ${ numberOfIcons} (${response.features[response.features.length - 1].attributes.SCORE}) `;
        restaurantDisplay.appendChild(latestInspectionScore);
    }
    else {
        resultsDisplay.innerHTML = 'No Inspections Found.';
    }
}


// display all inspection results
// returned from Wake County Inspections API call
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

//add user ability to favorite a restaurant
const favRestaurantLinks = document.querySelectorAll('.fav-restaurant-link');

if (favRestaurantLinks) {
    for (let link of favRestaurantLinks) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            fetch(`${restaurantName}`)
                .then(res => res.json())
                .then(function (data) {
                    console.log('data', data);
                })
                .then(function () {
                    link.setAttribute('hidden', true);
                    let favMessage = document.createElement('span');
                    favMessage.innerText = 'Restaurant marked as favorite';
                    link.parentElement.appendChild(favMessage);
                });
        });
    }
}