const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const resultsDisplay = document.querySelector('#results-display');
let latestInspectionDate;
 
// when page loads, start querying Wake County Restaurants API
// to create array of all restaurant names
window.addEventListener('DOMContentLoaded', (event) => {
    let restaurantNames = [];
    // fetch Wake County Restaurants API
    fetch('https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?where=1%3D1&outFields=NAME&outSR=4326&f=json')
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            for (let feature of response.features) {
                restaurantNames.push(feature.attributes.NAME);
            }
            return restaurantNames;
        })
        .then(function(restaurantNames) {

            fetch('https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?where=1%3D1&outFields=NAME&outSR=4326&f=json&resultOffset=1000')
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    for (let feature of response.features) {
                        restaurantNames.push(feature.attributes.NAME);
                    }
                    return restaurantNames;
                })
                .then(function(restaurantNames) {
                    fetch('https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?where=1%3D1&outFields=NAME&outSR=4326&f=json&resultOffset=2000')
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(response) {
                            for (let feature of response.features) {
                                restaurantNames.push(feature.attributes.NAME);
                            }
                            return restaurantNames;
                        })
                        .then(function(restaurantNames) {
                            fetch('https://maps.wakegov.com/arcgis/rest/services/Inspections/RestaurantInspectionsOpenData/MapServer/0/query?where=1%3D1&outFields=NAME&outSR=4326&f=json&resultOffset=3000')
                                .then(function(response) {
                                    return response.json();
                                })
                                .then(function(response) {
                                    for (let feature of response.features) {
                                        restaurantNames.push(feature.attributes.NAME);
                                    }
                                    console.log(restaurantNames);



                                    /******  Need to put autocomplete code here  ******/
                                    /*
                                    *
                                    *   Feed restaurantNames variable
                                    *   into autocomplete code
                                    * 
                                    */

  
                                    autocomplete(searchInput, restaurantNames);



                                })
                                .catch(function(error) {
                                    console.log('Request failed', error);
                            });
                        })
                        .catch(function(error) {
                            console.log('Request failed', error);
                    }); 
                })
                .catch(function(error) {
                    console.log('Request failed', error);
            });
        })
        .catch(function(error) {
            console.log('Request failed', error);
    });
});

function clearResultsDisplay() {
    resultsDisplay.innerHTML = '';
}

// search event listener
// when user searches for a restaurant
if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
    
        let fullRestaurantDetailsUrl = createFullRestaurantDetailsUrl();
    
        // fetch Wake County Restaurants API
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
            displayLatestInspectionScore(response);

            // call Yelp API
            // and display Yelp Rating
            fetch(createFullYelpSearchUrl(restaurant))
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    let restaurantRating = response.businesses[0].rating;

                    let restaurantYelpRatingContainer = document.createElement('div');
                    restaurantYelpRatingContainer.classList.add('browse-restaurant-yelp-score');
            
                    let restaurantYelpRating = document.createElement('div');
                    restaurantYelpRating.classList.add('browse-restaurant-yelp-score-number');
                    restaurantYelpRating.innerHTML = restaurantRating;
                    let restaurantYelpRatingHeading = document.createElement('div');
                    restaurantYelpRatingHeading.innerHTML = 'Yelp Rating';
                    restaurantYelpRatingHeading.classList.add('browse-restaurant-yelp-score-heading');
                    restaurantYelpRatingContainer.appendChild(restaurantYelpRating);
                    restaurantYelpRatingContainer.appendChild(restaurantYelpRatingHeading);
                    resultDiv.appendChild(restaurantYelpRatingContainer);


                    // call Restaurant Inspections API
                    let fullRestaurantInspectionsUrl = createFullRestaurantInspectionsUrl(restaurant.PERMITID);

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

                })
                .catch(function(error) {
                    console.log('Request failed', error);
            });

        })
        .catch(function(error) {
            console.log('Request failed', error);
        });   

    // create div to hold all restaurant details
    let resultDiv = document.createElement('div');
    resultDiv.classList.add('restaurant');
    resultDiv.setAttribute('data-permitid', restaurant.PERMITID);
    
    let restaurantDetails = document.createElement('div');
    
    // create div to hold restaurant name
    let restaurantName = document.createElement('div');
    restaurantName.innerHTML = restaurant.NAME;
    restaurantName.classList.add('restaurant-name');
    resultDiv.appendChild(restaurantName);

    // create div to hold restaurant address
    let restaurantAddress = document.createElement('div');
    restaurantAddress.innerHTML = restaurant.ADDRESS1 + '<br> ' + restaurant.CITY + ' ' + restaurant.POSTALCODE + '<br> ' + restaurant.PHONENUMBER;
    restaurantAddress.classList.add('restaurant-address');
    resultDiv.appendChild(restaurantAddress);

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

function displayInspectionViolationResults(response) {

    // display inspection violation results if there are matches,
    // else display a message that no inspections violations are found
    if (response.features.length > 0) {
        
        // add violation details to restaurant div
        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);

        let violationsTitle = document.createElement('h2');
        violationsTitle.classList.add('violations-title');
        violationsTitle.innerHTML = 'Comments from Most Recent Inspection';
        restaurantDisplay.appendChild(violationsTitle);


        for (let feature of response.features) {
            console.log(feature.attributes);

            if (feature.attributes.INSPECTDATE == latestInspectionDate) {
                displayViolationDetails(feature.attributes);
            }

        }

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
    violationScore.innerHTML = `Points Deducted: ${violation.POINTVALUE}`;
    resultDiv.appendChild(violationScore);

    // create div to hold violation description
    let violationDescription = document.createElement('div');
    violationDescription.innerHTML = violation.COMMENTS;
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

        let latestInspectionScoreContainer = document.createElement('div');
        latestInspectionScoreContainer.classList.add('browse-restaurant-inspection-score');

        let latestInspectionScore = document.createElement('div');
        latestInspectionScore.classList.add('browse-restaurant-inspection-score-number');
        let latestInspectionScoreHeading = document.createElement('div');
        latestInspectionScoreHeading.innerHTML = 'Inspection Score';
        latestInspectionScoreHeading.classList.add('browse-restaurant-inspection-score-heading');
        latestInspectionScoreContainer.appendChild(latestInspectionScore);
        latestInspectionScoreContainer.appendChild(latestInspectionScoreHeading);

        latestInspectionDate = response.features[response.features.length - 1].attributes.DATE_;
        let date = new Date(latestInspectionDate);
        date = date.toLocaleString().split(',')[0];

        latestInspectionScore.innerHTML = latestScore;
        latestInspectionScoreHeading.innerHTML = 'Inspection Score';

        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);

        restaurantDisplay.appendChild(latestInspectionScoreContainer);
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

        let showCommentsButton = document.createElement('button');
        showCommentsButton.classList.add('show-comments-button');
        showCommentsButton.innerText = 'Show Comments from Most Recent Inspection';
        restaurantDisplay.appendChild(showCommentsButton);

        showCommentsButton.addEventListener('click', function (event) {
                // call Restaurant Violations API
                let fullRestaurantInspectionViolationsUrl = createFullRestaurantInspectionViolationsUrl(response.features[0].attributes.PERMITID);
        
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
        });







    }
    else {
        resultsDisplay.innerHTML = 'No Inspections Found.';
    }
}

// create the url for the yelp_search view function
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
    let sanitationChartTitle = document.createElement('h3');
    sanitationChartTitle.classList.add('sanitation-chart-title');
    sanitationChartTitle.innerHTML = 'Sanitation Score History';
    sanitationChartDiv.appendChild(sanitationChartTitle);

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

function autocomplete(inp, arr) {
   
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("Select");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);

        
        
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("OPTION");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }