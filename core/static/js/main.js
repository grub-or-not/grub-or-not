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



            // create div to hold restaurant yelp rating and num reviews
            let restaurantYelpRating = document.createElement('div');
            restaurantYelpRating.classList.add('restaurant-score');

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
    
    // create favorite button for user to save to profile
    //let favButton = document.createElement('a');
   //favButton.innerHTML = '<i class="material-icons">favorite </i>';
    //favButton.href = '/favorite/'+ restaurant.PERMITID+'/'+restaurant.NAME;
    //resultDiv.appendChild(favButton);

    
     
        
        
    
    

    


    
    let restaurantDetails = document.createElement('div');
    
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
if (resultsDisplay){
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
    violationScore.innerHTML = violation.POINTVALUE;
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
                numberOfIcons = '💩💩💩🤔'
            } else if (latestScore>= 81 && latestScore <=89) {
                numberOfIcons = '💩💩💩🤔🤔'
            } else if (latestScore>= 90 && latestScore <=100) {
                numberOfIcons = '💩💩💩🤔😍'
            } else {
                numberOfIcons = 'No score available'
            }

        let restaurantDisplay = document.querySelector(`[data-permitid='${response.features[0].attributes.PERMITID}']`);


        let latestInspectionScore = document.createElement('span');
        latestInspectionScore.classList.add('restaurant-score');
        latestInspectionDate = response.features[response.features.length - 1].attributes.DATE_;
        let date = new Date(latestInspectionDate);
        date = date.toLocaleString().split(',')[0];
        // CHANGE MADE HERE: DATE VARIABLE MOVED IN FRONT OF SCORE, ICONS VARIABLE ADDED-- ORDER OF VARIABLES ALTERED
        latestInspectionScore.innerHTML = `Latest Inspection Score: ${response.features[response.features.length - 1].attributes.SCORE} ${numberOfIcons}`;
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
//create function to remove favorite item from user profile
    
//let buttons = document.getElementsByClassName("trash");
//for (let button of buttons){
   // button.addEventListener('click', function(event){ console.log();});
//}

let restaurantAuto=['The Pit','Starbucks','Cinebistro',]
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
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("search-input")[0].value;
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

  autocomplete(document.getElementById("search-input"), restaurantAuto);
