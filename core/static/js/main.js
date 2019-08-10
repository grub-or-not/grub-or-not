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
  
  /*An array containing all the country names in the world:*/
  var restaurants = [
    

    "#1 CHINA,"
    “#1 CHINA WOK,”
    “1213 Catering (WCID #619),”
    “1250 Heritage,”
    “13 Tacos &amp; Taps,”
    “1705 Prime Catering and Events,”
    “1853 Grille,”
    “1887 BISTRO,”
    “2K Taqueria (WCID #661),”
    “3 OLIVES PIZZA &amp; DELI,”
    “41 Hundred,”
    “41 NORTH COFFEE CO.,”
    “42 &amp; LAWRENCE,”
    “42nd St Oyster Bar,”
    “42ND STREET OYSTER BAR,”
    “454 GRILL (WCID # 605),”
    “701 Cafe,”
    “815 GOURMET GRILL (WCID # 604),”
    “9.19 Island Cuisine,”
    “A & K Food Mart #2,”
    “A &amp; C Supermarket Meat Market,”
    “A Place at the Table,”
    “A Slice of NY Pizza,”
    “A Taste of New York #1 (WCID #163),”
    “A TASTE OF NEW YORK #2 (WCID #019),”
    “A TASTE OF NEW YORK #3 ( WCID # 366 ),”
    “A Taste of New York #4 (WCID #007),”
    “A Taste of NY Commissary,”
    “A'NETS KATCH,”
    “ABBEY ROAD TAVERN &amp; GRILL,”
    “Abbey Road Tavern &amp; Grill,”
    “ABBEY ROAD TAVERN &amp; GRILL APEX,”
    “Abbotswood Assisted Living Dining Services,”
    “ABBOTTS CREEK ELEMENTARY CAFETERIA,”
    “AC MARRIOTT FOOD SERVICE,”
    “Acacia Tree Asian Cuisine,”
    “ACADEMY STREET BISTRO,”
    “ACC AMERICAN CAFE/LA TAPENADE,”
    “ACME PIZZA CO,”
    “ACRO CAFE,”
    “Adams Elementary Cafeteria,”
    “Administration Bldg. Snack Bar,”
    “ADOBO JOE (WCID #575),”
    “Adventure Landing,”
    “AGAVE MEXICAN BAR &amp; GRILL,”
    “AGGIE'S GRILL STATION,”
    “Agori International African Market,”
    “Agriculture Bldg. Snack Bar,”
    “AJ'S FOOD MART,”
    “Ajisai Japanese Fusion,”
    “AKARI EXPRESS,”
    “Al Aseel,”
    “ALADDIN'S EATERY,”
    “ALADDINS EATERY,”
    “Alaina's Bangin BBQ (WCID #683),”
    “Alamo Drafthouse Cinema,”
    “ALBARAKA GRILL,”
    “ALBARAKA MEAT MARKET,”
    “ALEX &amp; TERESA'S PIZZA &amp; TRATTORIA,”
    “ALEXANDER'S MEDITERRANEAN CUISINE,”
    “Align Technology All Hands Cafe,”
    “ALKAREEM GROCERY,”
    “ALMADINA SUPERMARKET,”
    “ALOFT RDU REFUEL,”
    “ALOFT REFUEL AND WXYZ LOUNGE,”
    “ALPACA PERUVIAN CHARCOAL CHICKEN,”
    “ALPACA PERUVIAN CHARCOAL CHICKEN,”
    “Alpaca Peruvian Charcoal Chicken,”
    “ALSTON RIDGE ELEMENTARY SCHOOL CAFETERIA,”
    “Alston Ridge Middle School Cafeteria,”
    “Altaif's Hot Dogs (WCID #553),”
    “Amalia's Authentic Italian Restaurant,”
    “AMC Dine In Holly Springs 9,”
    “AMC Theatres Concessions,”
    “AMEDEO`S,”
    “AMERICAN DELI,”
    “AMF Snack Bar and Lounge,”
    “AMF South Hills Snack Bar,”
    “AMORINO GELATO,”
    “Andres` Coffee &amp; Crepes,”
    “ANGIE'S RESTAURANT,”
    “Angus Barn,”
    “Anise Pho,”
    “Anjappar,”
    “ANNA`S PIZZERIA,”
    “ANNAS PIZZERIA,”
    “ANOTHER BROKEN EGG,”
    “ANOTHER BROKEN EGG,”
    “ANOTHER BROKEN EGG CAFE,”
    “Antojitos Dona Mary (WCID #004),”
    “Anton Airfood Commissary Kitchen,”
    “ANVIL`S CHEESESTEAKS,”
    “Apero,”
    “Apex Elementary Cafeteria,”
    “APEX FRIENDSHIP HIGH SCHOOL CAFETERIA,”
    “Apex Friendship Middle School Cafeteria,”
    “Apex High School Cafeteria,”
    “Apex High School Culinary Arts,”
    “APEX HS at GREEN LEVEL HS CAFETERIA,”
    “Apex Middle School Cafeteria,”
    “APEX WINGS,”
    “Apple Spice Box Lunch &amp; Catering,”
    “Applebee's Grill &amp; Bar,”
    “Applebee's Grill &amp; Bar,”
    “APPLEBEE'S GRILL &amp; BAR,”
    “APPLEBEE'S GRILL &amp; BAR,”
    “Applebee's Grill and Bar,”
    “APPLEBEES GRILL &amp; BAR,”
    “ARANDAS MEXICAN CUISINE,”
    “ARBY'S #179,”
    “ARBY'S #6151,”
    “ARBY'S #6335,”
    “ARBY'S #6554,”
    “ARBY'S #7668,”
    “ARBY'S RESTAURANT  #6036,”
    “Arby`s #7814,”
    “Arby`s #7820,”
    “Arby`s Restaurant,”
    “ARBYS #6657,”
    “ARBYS #6768,”
    “Archdale Bldg. Snack Bar,”
    “Arena Cafe- Cisco Bldg 7,”
    “Armadillo Grill,”
    “AROMA KOREA,”
    “Asali Desserts and Cafe,”
    “Ashworth Rexall Drug,”
    “Asia Express,”
    “ASIAN BISTRO,”
    “ASIAN GARDEN,”
    “Assaggio`s,”
    “Assagios Pizzeria Ristorante,”
    “Asuka,”
    “Athens Drive Sr. High Cafeteria,”
    “ATRIA OAKRIDGE DINING,”
    “ATRIUM,”
    “Atrium Cafe, The,”
    “AU BON PAIN CAFE #254,”
    “Aubrey &amp; Peedi`s Grill,”
    “AUNTIE ANNE'S NC #111,”
    “AUNTIE ANNE'S PRETZELS NC#101,”
    “AUX. Kitchen,”
    “Aversboro Elementary School Lunchroom,”
    “Aversboro Restaurant and Sports Bar,”
    “AVIATOR BREW #2,”
    “AVIATOR BREWING TAP HOUSE,”
    “AVIATOR SMOKEHOUSE,”
    “AWAZ'E ETHIOPIAN/ERITREAN CUISINE,”
    “Axis,”
    “Azitra Indian Restaurant,”
    “B. GOOD,”
    “B. GOOD,”
    “B. GOOD #19048,”
    “Ba-Da Wings,”
    “BA-DA WINGS,”
    “BAAN THAI RESTAURANT,”
    “BABA GHANNOUJ,”
    “Babymoon Cafe,”
    “BACK 9 PUB,”
    “Backfins Crabhouse,”
    “BACKYARD BISTRO,”
    “BACKYARD BISTRO #1 CONCESSION TRAILER (WCID #267),”
    “BACKYARD BISTRO #2 (WCID #531),”
    “Backyard Bistro #3 (WCID #706),”
    “BACKYARD BISTRO PUC #2 (WCID # 556),”
    “BACKYARD BISTRO PUSHCART (WCID #444),”
    “Backyard Burgers #1130,”
    “Bad Cat Coffee Company  @ MSFH,”
    “BAD DADDY'S BURGER BAR,”
    “BAD DADDY'S BURGER BAR,”
    “BAD DADDY'S BURGER BAR,”
    “Bad Daddy's Burger bar #235,”
    “BADA BEAN COFFEE &amp; THINGS,”
    “BAGELS PLUS,”
    “BAHAMA BREEZE RESTAURANT,”
    “Baileywick Elem Sch. Cafet.,”
    “Baja Burrito,”
    “BALI-HAI,”
    “Ballentine Elem. Sch. Cafeteria,”
    “Baltic Bites (WCID #669),”
    “BANANA LEAF,”
    “BANGKOK THAI,”
    “BANKS ROAD ELEMENTARY CAFETERIA,”
    “BAOZI (WCID #579),”
    “BAR LOUIE,”
    “Barcelona Wine Bar,”
    “Barham`s Restaurant,”
    “Barnes &amp; Noble Book Sellers #2126,”
    “Barnes &amp; Noble Cafe #2171,”
    “Barnes And Noble,”
    “Barnes And Noble Cafe,”
    “BARONE MEATBALL COMPANY (wcid #511),”
    “BARRON'S DELI,”
    “Barrys Cafe,”
    “Bartaco North Hills,”
    “Barwell Road Elem. Sch. Cafeteria,”
    “Bass Lake Draft House,”
    “Baucom Elem. Sch. Cafeteria,”
    “BAWARCHI,”
    “Bawarchi Grill &amp; Spirits,”
    “Bayleaf Convenience,”
    “BB`s Grill,”
    “BBQ PROPER (WCID #596),”
    “Beansprout Chinese Restaurant,”
    “BEASLEY'S/CHUCK'S/FOX,”
    “BEAVER CREEK CINEMAS 12,”
    “BEAVERDAM ELEMENTARY SCHOOL CAFETERIA,”
    “Bee Hive Cafe,”
    “Beefy Buns (WCID #650),”
    “BELGIAN CAFE,”
    “Belis Sazon (WCID #589),”
    “BELLA ITALIA PIZZERIA,”
    “Bella Italia Ristorante,”
    “Bella Monica,”
    “Bella's Hot Dogs   (WCID #624),”
    “Bella's Wood Fired Pizza @ MSFH,”
    “BellaRose Nursing and Rehab Center Foodservice,”
    “BELLINI FINE ITALIAN CUISINE,”
    “Benchwarmers Bagels,”
    “BENELUX CAFE,”
    “BENELUX COFFEE,”
    “Benny Capitale's,”
    “Bento Sushi,”
    “BEST WESTERN CARY CAFE,”
    “BEST WESTERN FOODSERVICE,”
    “BEST WESTERN PLUS EDISON INN FOODSERVICE,”
    “BI CAFE,”
    “BIDA MANDA,”
    “BIG AL'S BBQ,”
    “BIG AL`S BBQ &amp; CATERING SERVICES (WCID #351),”
    “BIG CHEESE PIZZA,”
    “Big Dom's Bagel Shop,”
    “Big Easy Cajun - Crabtree,”
    “BIG ED'S NORTH,”
    “Big Ed`s City Market Restaurant,”
    “Big Eds Garner,”
    “BIG MIKES BBQ (WCID #418),”
    “BIG RED'S DOGHOUSE (WCID #499),”
    “Big Sergio's Pizza of Apex,”
    “Billiam's Cafe &amp; Catering @TKA,”
    “BIRYANI MAXX,”
    “BIRYANI XPRX,”
    “Biscuitville,”
    “Biscuitville # 169,”
    “Biscuitville #175 ,”
    “BISCUITVILLE #184,”
    “BISTRO IN THE PARK,”
    “BITTERSWEET,”
    “BJ's Membership Club #177 Deli/Meat Market,”
    “BJ's Membership Club Meat Mkt,”
    “BJ'S RESTAURANT,”
    “BJ's Wholesale Club Deli &amp; Meat Market,”
    “BJ`s Warehouse Club #123 (Foodstand - MM Area),”
    “BJ`S Warehouse Deli,”
    “BLAZE PIZZA #1062,”
    “Blaze Pizza #1125,”
    “BLAZE PIZZA #1193,”
    “Bloomsbury Bistro,”
    “BLUE FOX INDIAN CUISINE,”
    “Blue Ridge - The Museum Restaurant,”
    “Bob Evan`s #427,”
    “Boba Brew @ MSFH,”
    “BOCCI TRATTORIA &amp; PIZZERIA,”
    “Bodega,”
    “Bogey's Bistro,”
    “Bojangles,”
    “Bojangles,”
    “BOJANGLES,”
    “Bojangles,”
    “Bojangles,”
    “Bojangles # 11,”
    “Bojangles # 2,”
    “Bojangles # 29,”
    “Bojangles # 3,”
    “Bojangles # 31,”
    “Bojangles #12,”
    “BOJANGLES #15,”
    “Bojangles #36,”
    “Bojangles #39,”
    “BOJANGLES #42,”
    “BOJANGLES #45,”
    “BOJANGLES #46,”
    “BOJANGLES #49,”
    “BOJANGLES #5,”
    “BOJANGLES #51,”
    “BOJANGLES MOBILE FOOD UNIT (WCID #446),”
    “Bojangles' #27,”
    “Bojangles#37,”
    “BOMBSHELL BEER COMPANY,”
    “BON APPETIT @ CITRIX,”
    “BOND BROTHERS BEER COMPANY,”
    “Bonefish Grill,”
    “Bonefish Grill,”
    “Boondinis,”
    “Bosphorus Restaurant,”
    “Boston Market,”
    “BOSTON MARKET,”
    “Boston Market,”
    “Boston Market,”
    “BOTTLE MIXX,”
    “BOTTLEDOG BITES &amp; BREWS,”
    “Bottles &amp; Cans,”
    “Boulevard Pizza,”
    “Bowl Out (WCID #682),”
    “BOXCAR COFFEE AND SCOOPS,”
    “BRAGAW C-STORE,”
    “Brasa Brazilian Steakhouse,”
    “Brassfield Road Elem. Cafeteria,”
    “BRAVO`S MEXICAN GRILL,”
    “BRAVOS PIZZERIA,”
    “brb,”
    “Brentwood Elementary Cafeteria,”
    “BREW AT THE CARY THEATER,”
    “Brew Coffee Bar,”
    “BREW N QUE,”
    “BREW N QUE,”
    “BREWERKS CAFE &amp; BAKERY,”
    “BREWERY BHAVANA,”
    “BREWSTER'S PUB,”
    “Briarcliff Elementary Cafeteria,”
    “BRIER CREEK BEER GARDEN,”
    “Brier Creek Elem. Sch. Lunchroom,”
    “Brighton Gardens Assisted Living of Raleigh Kitchen,”
    “Brigs,”
    “Brigs At The Crossing Restaurant,”
    “BRIGS AT THE FOREST,”
    “BRIGS AT TRYON VILLAGE ,”
    “BRINE,”
    “BRIO TUSCAN GRILLE,”
    “BRIXX 700,”
    “BRIXX BRADFORD,”
    “Brixx Briercreek,”
    “BRIXX WOOD FIRED PIZZA #4000,”
    “BROOKDALE CARY,”
    “Brookdale Macarthur Park,”
    “BROOKDALE OF NORTH RALEIGH FOOD SERVICE,”
    “BROOKDALE WAKE FOREST DINING,”
    “BROOKRIDGE ASSISTED LIVING FOODSERVICE,”
    “BROOKS ELEMENTARY MAGNET SCHOOL CAFETERIA,”
    “BROOKS STREET BOWL,”
    “Brothers of New York,”
    “Broughton High Cafeteria,”
    “Bruegger`s Bagel Bakery #0701,”
    “Bruegger`s Bagel Bakery #93-0683,”
    “Bruegger`s Bagels,”
    “Brueggers Bagel #3771,”
    “BRUEGGERS BAGELS #101,”
    “BRUEGGERS BAGELS #143,”
    “BRUEGGERS BAGELS #18,”
    “BRUEGGERS BAGELS #192,”
    “BRUEGGERS BAGELS #32,”
    “BRUEGGERS BAGELS #644,”
    “Brueggers`s Bagel ,”
    “BRUNO,”
    “BRYAN ROAD ELEMENTARY SCHOOL CAFETERIA,”
    “Buckhorn Elementary School Cafeteria,”
    “Budacai,”
    “Buff-O-Lina (WCID #635),”
    “Buffalo Brothers,”
    “Buffalo Brothers,”
    “Buffalo Brothers,”
    “BUFFALO BROTHERS,”
    “BUFFALO BROTHERS GARNER,”
    “Buffalo Wild Wings # 113,”
    “BUFFALO WILD WINGS #206,”
    “BUFFALO WILD WINGS #357,”
    “BUFFALO WILD WINGS #439,”
    “Buffaloe Lanes,”
    “Buffaloe Lanes - Cary,”
    “Buffaloe Lanes North Foodservice,”
    “Built Custom Burgers,”
    “Buku Wake Forest,”
    “Bul Box @ T Co,”
    “Buldaegi BBQ House,”
    “Bull And Bear,”
    “Bull City Hospitality,”
    “Bumble Tea,”
    “BUNS BARN,”
    “BUOY BOWLS (WCID #573),”
    “Buoy Bowls #2 (WCID #630),”
    “BURGER 21,”
    “BURGER 21,”
    “Burger 21 (WCID #617),”
    “Burger Fi,”
    “Burger Fi,”
    “Burger Fi,”
    “Burger IM,”
    “BURGER KING #10775,”
    “BURGER KING #1093,”
    “BURGER KING #1094,”
    “BURGER KING #11244,”
    “Burger King #12979,”
    “BURGER KING #17359,”
    “BURGER KING #19795,”
    “Burger King #223,”
    “BURGER KING #2983,”
    “BURGER KING #3768,”
    “BURGER KING #4521,”
    “BURGER KING #5719,”
    “BURGER KING #6010,”
    “BURGER KING #6063,”
    “BURGER KING #6563,”
    “Burger King #7810,”
    “BURGER KING #8018,”
    “BURGER KING #8513,”
    “Burger King #9246,”
    “BURGER KING #9362,”
    “Burial Beer Co.,”
    “Byte Cafe,”
    “C &amp; T WOK CHINESE AND THAI CUISINE,”
    “C Mini Mart,”
    “Cabo Del Sol (WCID #680),”
    “CAFE,”
    “Cafe 3000 At Wake Med,”
    “Cafe at the Forum,”
    “Cafe Capistrano,”
    “Cafe Carolina &amp; Bakery,”
    “Cafe Carolina #1,”
    “CAFE SAGE @HOLIDAY INN CARY,”
    “CAFE SOO,”
    “CAFE TIRAMISU,”
    “Caffe Luna,”
    “CAJUN CRAB HOUSE,”
    “Calavera Empanada &amp;Tequila Bar,”
    “CALDRONE HOT DOGS #2 (WCID #220),”
    “CAMBRIA SUITES BARISTA BAR,”
    “CAMBRIDGE VILLAGE DINING,”
    “CAMERON BAR &amp; GRILL,”
    “CANTINA 18,”
    “CANTINA 18 MORRISVILLE,”
    “Cape Fear Seafood Co,”
    “CAPITAL CITY CHOP HOUSE,”
    “CAPITAL CLUB 16 RESTAURANT &amp; BAR,”
    “Capital Creations Pizza,”
    “Capital Nursing and Rehabilitation Center Kitchen,”
    “CAPITAL OAKS CULINARY &amp; DINING SERVICES,”
    “Cappolla's Pizza &amp; Grill,”
    “Cappolla`s Pizza &amp; Grill,”
    “Capri Restaurant,”
    “Captain Stanley's Seafood,”
    “CARDINAL AT NORTH HILLS CLUB HOUSE,”
    “Cardinal Charter Academy,”
    “Cardinal Gibbons High School Concession Stand,”
    “Cardinal Gibbons School Cafeteria,”
    “Caretta Coffee &amp; Cafe,”
    “Caribbean Cafe,”
    “Caribbean Kickers (WCID #648),”
    “CARIBOU BRUEGGERS #312,”
    “CARIBOU COFFEE #301,”
    “CARIBOU COFFEE #306,”
    “Carillon Assisted Living of Garner Food Service,”
    “Carillon Assisted Living of Knightdale Dining,”
    “CARILLON ASSISTED LIVING OF RALEIGH DINING,”
    “Carillon Assisted Living of Wake Forest Dining,”
    “CARILLON OF FUQUAY FOOD SERVICE,”
    “Carl Sandburg Cafeteria,”
    “CARLIE C'S DELI,”
    “CARLIE C'S DELI #810,”
    “Carlie C's IGA #820 Deli,”
    “Carlie C's IGA #820 Meat Market,”
    “Carlie C's IGA #820 Seafood,”
    “CARLIE C'S MEAT,”
    “CARLIE C'S MEAT #810,”
    “CARLIE C'S PRODUCE,”
    “CARLIE C'S SEAFOOD,”
    “Carmen`s Cuban Cafe,”
    “Carnage Middle Cafeteria,”
    “CARNICERIA LA HACIENDA,”
    “Carolina Ale House,”
    “Carolina Ale House,”
    “CAROLINA ALE HOUSE,”
    “Carolina Ale House,”
    “CAROLINA ALE HOUSE,”
    “Carolina Ale House,”
    “CAROLINA ALE HOUSE #GMA,”
    “CAROLINA BARBECUE,”
    “CAROLINA BREWING COMPANY TAPROOM,”
    “CAROLINA CLASSIC HOT DOGS #2 (WCID #549),”
    “CAROLINA INTERNATIONAL MARKET,”
    “CAROLINA SUSHI &amp; ROLL,”
    “CAROLINA VINTAGES,”
    “Carolina's Catch (WCID #713),”
    “Carpenter Elementary School Cafeteria,”
    “CARRABBA'S ITALIAN GRILL #3420,”
    “CARRABBA'S ITALIAN GRILL #8412,”
    “Carroll Middle Sch.Cafeteria,”
    “CARROLL'S KITCHEN,”
    “Carroll's Kitchen @ MSFH,”
    “CARTER FINLEY CHICK-FIL-A,”
    “CARVEL,”
    “Carver Elementary Lunchroom,”
    “Cary Academy Cafeteria,”
    “Cary African and Caribbean Market,”
    “Cary Elementary Cafeteria,”
    “Cary Health &amp; Rehab Food Service,”
    “Cary Senior High Cafeteria,”
    “Casa Carbone,”
    “CASE DINING HALL,”
    “Caspian International Food Mart,”
    “CATERING BY DESIGN,”
    “Cattails Restaurant,”
    “Cava #84,”
    “Cava Grill #087,”
    “Cedar Fork Elementary Cafeteria,”
    “CELLAR 55,”
    “Centennial Campus Middle Sch. Cafeteria,”
    “Centro,”
    “Century Center Cafeteria (DOT building),”
    “CHAI`S ASIAN BISTRO,”
    “CHAMPA THAI &amp; SUSHI,”
    “CHANELLO'S PIZZA OF GARNER,”
    “CHANTICLEER CAFE &amp; BAKERY,”
    “CHAR GRILL/SALSARITAS,”
    “Char-Grill,”
    “Char-Grill,”
    “Char-grill,”
    “Char-Grill #1,”
    “CHAR-GRILL CARY,”
    “CHARLES BUGG CAFETERIA,”
    “CHARLEY'S PHILLY STEAKS,”
    “CHARLEY'S PHILLY STEAKS # 789,”
    “Charlie C's Hot Dogs on Wheels #2 (WCID #633),”
    “CHARLIE'S KABOB GRILL,”
    “CHARLIE'S KABOBS #2,”
    “CHARLIE'S KABOBS ON WHEELS (WCID #505),”
    “CHATHAM COMMONS - CARY REST HOME FOODSERVICE,”
    “Che Empanadas,”
    “CHECKER`S PIZZA &amp; SUBS,”
    “CHECKERS PIZZA,”
    “Chef Mario,”
    “CHEF`S PALETTE,”
    “Chen`s Garden,”
    “Chengdu 7 Sichuan Cuisine,”
    “Chesterbrook Academy #1122 Foodservice,”
    “Chesterbrook Academy Foodservice,”
    “Chhote's,”
    “Chhote's,”
    “Chicago J Hot Dogs (WCID #638),”
    “Chick-fil-A,”
    “Chick-fil-A,”
    “CHICK-FIL-A,”
    “Chick-fil-A,”
    “Chick-fil-A,”
    “Chick-fil-A #00678,”
    “Chick-Fil-A #01488,”
    “CHICK-FIL-A #03376,”
    “CHICK-FIL-A #1218,”
    “CHICK-FIL-A #1466,”
    “Chick-fil-A #1573,”
    “Chick-fil-A #1749,”
    “Chick-fil-A #1963,”
    “CHICK-FIL-A #2181,”
    “CHICK-FIL-A #2850,”
    “CHICK-FIL-A #3448,”
    “CHICK-FIL-A #699,”
    “CHICK-FIL-A #792,”
    “CHICK-FIL-A #868,”
    “CHICK-FIL-A AT CARY TOWNE CENTER,”
    “Chick-Fil-A at North Hills,”
    “Chick-Fil-A Crabtree Valley Mall #00060,”
    “CHICK-N-QUE (WCID #377),”
    “CHICK-N-QUE III (WCID #600),”
    “Chido Taco,”
    “Chilango Restaurant ,”
    “CHILD CARE SERVICES ASSOCIATION,”
    “CHILI'S #1534,”
    “CHILI'S GRILL &amp; BAR #1566,”
    “Chili's Grill and Bar #867,”
    “Chili`s,”
    “Chili`s #1393,”
    “Chili`s Bar and Grill,”
    “Chili`s Grill and Bar #1183,”
    “Chili`s Grill And Bar #953,”
    “Chilis Bar And Grill,”
    “CHINA BEST,”
    “CHINA CARY,”
    “China Chef,”
    “China Fu,”
    “China House,”
    “CHINA KING,”
    “China King,”
    “CHINA MOON,”
    “China One,”
    “CHINA PEARL CHINESE RESTAURANT,”
    “CHINA QUEEN,”
    “CHINA STAR,”
    “China Star,”
    “CHINA UNO,”
    “China Wok,”
    “China Wok,”
    “China Wok,”
    “China Won,”
    “Chinatown Express,”
    “CHIOS ROTISSERIE,”
    “Chipotle  #2822,”
    “CHIPOTLE #1659,”
    “CHIPOTLE #1946,”
    “CHIPOTLE #2066,”
    “CHIPOTLE #2386,”
    “CHIPOTLE #2950,”
    “CHIPOTLE #3024,”
    “Chipotle #3212,”
    “Chipotle #3266,”
    “CHIPOTLE 2485,”
    “Chipotle Mexican Grill #0942,”
    “CHIPOTLE MEXICAN GRILL #1087,”
    “Chipotle Mexican Grill Store # 0826,”
    “Chop Shop,”
    “CHOPSTIX,”
    “CHOPT,”
    “Chopt North Ridge,”
    “CHOW,”
    “CHRONIC TACOS,”
    “CHRONIC TACOS OLIVE PARK,”
    “CHUBBY`S TACOS,”
    “Chuck E Cheese,”
    “CHURCH'S CHICKEN,”
    “CHUY'S #48,”
    “CHUY'S #72,”
    “CiCi`s Pizza,”
    “CICI`S PIZZA,”
    “CiCi`s Pizza # 425,”
    “CiCi`s Pizza #413,”
    “CILANTRO INDIAN CAFE',”
    “Cinebistro,”
    “CIRCLE  K #3488,”
    “Circle K   #0846,”
    “Circle K # 8621,”
    “Circle K #1403,”
    “CIRCLE K #1511,”
    “Circle K #1516/SUBWAY #4286,”
    “CIRCLE K #2703126,”
    “CIRCLE K #2720320,”
    “CIRCLE K #2720457,”
    “CIRCLE K #2720850,”
    “Circle K #2720916,”
    “CIRCLE K #2723302,”
    “Circle K #2723303,”
    “Circle K #2723479,”
    “CIRCLE K #2723633,”
    “CIRCLE K #3146,”
    “CIRCLE K #3795,”
    “CIRCLE K #3797,”
    “CIRCLE K #3886,”
    “Circle K #6314,”
    “Circle K #6329,”
    “Circle K #8524,”
    “Circle K #8527,”
    “Circle K #8610,”
    “Circle K #8620,”
    “CIRCLE K/SUBWAY #2724280 ,”
    “Circle K#2723100,”
    “Circus Family Restaurant,”
    “Cisco Systems Building 10 Stillwater Cafe,”
    “Cisco Systems Triangle Terrace Cafe,”
    “CITY BARBECUE,”
    “CITY BARBEQUE #43,”
    “CITY BARBEQUE- GARNER,”
    “CITY CLUB RALEIGH,”
    “CITY MARKET SUSHI,”
    “CLARK DINING HALL,”
    “Clean Eatz,”
    “CLEAN EATZ,”
    “Clean Juice Parkwest,”
    “Cloos Coney Island,”
    “Clouds Brewing,”
    “CLYDE COOPER'S BARBECUE,”
    “Co Noodle,”
    “Cobblestone @ Koka Booth Amphitheatre,”
    “COCINA MEXICANA LA PENA DE HOREB,”
    “COCKADOODLEMOO (WCID #510),”
    “COCO BONGO,”
    “Cocula Mexican Restaurant,”
    “COFFEE &amp; (METLIFE 2),”
    “Cold off the Press,”
    “Combs Elementary Cafeteria,”
    “Comfort Inn,”
    “COMFORT INN &amp; SUITES,”
    “COMFORT INN BREAKFAST,”
    “COMFORT INN BREAKFAST FUQUAY VARINA,”
    “COMFORT SUITES REGENCY PARK BREAKFAST,”
    “COMMUNITY DELI,”
    “Community Mart,”
    “COMPARE FOODS MARKET,”
    “COMPARE FOODS MARKET,”
    “COMPASS ROSE BREWERY,”
    “Conference Dining Services Facility,”
    “CONNECTIONS CAFE,”
    “Cook Out,”
    “Cook Out,”
    “Cook Out # 24,”
    “Cook Out #13,”
    “Cook Out #19,”
    “Cook Out #25,”
    “COOKOUT #55,”
    “Coquette,”
    “CORBETT'S BURGERS &amp; SODA BAR,”
    “Corelife Eatery,”
    “Corner Boys BBQ (WCID #676),”
    “CORNER KICK CAFE,”
    “Corporate Caterers,”
    “CORTEZ SEAFOOD AND COCKTAILS,”
    “COSTCO WHOLESALE #1206 FOOD COURT,”
    “COSTCO WHOLESALE #1206 MEAT,”
    “COSTCO WHOLESALE #1206 ROTISSERIE/DELI,”
    “Costco Wholesale #645 Food Court,”
    “Costco Wholesale #645 Meat Department ,”
    “Costco Wholesale #645 Rotiserrie/Deli,”
    “COUNTRY CAFE,”
    “Country Inn &amp; Suites Breakfast Area,”
    “COURTHOUSE DELI,”
    “COURTNEY'S NY BAGEL &amp; DELI,”
    “COURTYARD BISTRO,”
    “Courtyard by Marriott Parkside Town Commons Food Service,”
    “Courtyard By Marriott/morrisville/restau,”
    “Cousin's Maine Lobster #1 (WCID # 610),”
    “COUSIN'S MAINE LOBSTER #2 (WCID #517),”
    “COUSINS CONFECTIONS #2 (WCID #473),”
    “COUSINS CONFECTIONS #3 (WCID #485),”
    “COUSINS CONFECTIONS #4 (WCID #486),”
    “COUSINS CONFECTIONS #5 (WCID #487),”
    “Cousins Maine Lobster @ MSFH,”
    “COVENTRY HOUSE OF ZEBULON,”
    “Cow Bar @ MSFH,”
    “CPK/BROOKWOOD FARMS FOODCOURT,”
    “CRABTREE ALE HOUSE,”
    “Cracker Barrel #461,”
    “Craft Public House,”
    “CRAFTY BEER SHOP,”
    “CRANK ARM BREWING COMPANY,”
    “CRAWFORD AND SON,”
    “Crazy Fire Mongolian Grill,”
    “CRAZY FIRE MONGOLIAN GRILL,”
    “CRAZY FIRE MONGOLIAN GRILL,”
    “Crazy Tamales (WCID #720),”
    “Crazy Tamales @ TKA,”
    “CREDIT SUISSE CAFE,”
    “Creech Road Elem. Cafeteria,”
    “CREEDMOOR CAFE,”
    “Crema at City Plaza,”
    “Crepe Traditions,”
    “CRISP,”
    “CRISTO'S BISTRO,”
    “CRISTO'S NY STYLE PIZZA, LLC,”
    “CROSSROADS STADIUM 20 UNIT #1874,”
    “CROSSTOWN PUB,”
    “Cruizers #19,”
    “CRUIZERS #44,”
    “Cruizers #83 Wendell;,”
    “Cruizers 28,”
    “Cue Burger (WCID #655),”
    “CULVER'S OF WAKE FOREST,”
    “Cup A Joe,”
    “Cup A Joe,”
    “CURRY IN A HURRY (WCID #599),”
    “Curry in a Hurry @ MSFH,”
    “Cut Bait Cafe (WCID #681),”
    “D & S CAFETERIA,”
    “D.P. Dough,”
    “D'S BOTTLE SHOP,”
    “D's Presto (WCID #658),”
    “DADDY BOB'S (WCID #559),”
    “Daddy D's BBQ,”
    “DAILY PLANET CAFE,”
    “Daily Taco,”
    “Dairy Queen,”
    “DAIRY QUEEN #40925,”
    “DAIRY QUEEN GRILL &amp; CHILL,”
    “DAIRY QUEEN ORANGE JULIUS,”
    “DALAT ASIA GRANDMA'S KITCHEN,”
    “Dallas Fried Chicken,”
    “Daly Cafe and Pub at Holiday Inn,”
    “DAME'S CHICKEN &amp; WAFFLES,”
    “Dan Sushi Hibachi,”
    “Daniels Middle School Cafeteria,”
    “Daniels Restaurant & Catering,”
    “Dank Burrito @ TCo,”
    “DANNY'S BARBEQUE,”
    “DANTE'S ITALIANO,”
    “DAVE AND BUSTERS,”
    “DAVID'S DUMPLING &amp; NOODLE BAR,”
    “Davis Drive Elem. Sch. Cafeteria,”
    “Davis Drive Middle Sch. Cafeteria,”
    “DEATH AND TAXES,”
    “Debra's Homemade Hot Dogs (WCID #675),”
    “Deja Brew,”
    “Delicias Chely (WCID #591),”
    “DELIGHTFUL INSPIRATIONS,”
    “DELL/EMC2,”
    “DeM0'S PIZZERIA &amp; DELI,”
    “DeMario's Smokin' Fry Masters (WCID #629),”
    “DENNY'S #8890,”
    “Denny`s Restaurant,”
    “Der Biergarten Cary,”
    “DESPINA'S CAFE,”
    “Devils Ridge Golf Club,”
    “DHARANI EXPRESS INDIAN RESTAURANT &amp; TAKE OUT,”
    “DHARANI SOUTH INDIAN CUISINE,”
    “Diced,”
    “DICED GOURMET SALADS &amp; WRAPS #2,”
    “DICED GOURMET SALADS AND WRAPS,”
    “DICKEY'S BARBECUE PIT #413,”
    “Dickey's Barbeque #1496,”
    “DILLARD DRIVE ELEMENTARY SCHOOL CAFETERIA,”
    “DILLARD DRIVE MIDDLE SCHOOL CAFETERIA,”
    “DIM SUM HOUSE,”
    “Dix Cafe,”
    “DOAK FIELD CONCESSIONS STAND 1ST BASE,”
    “DOAK FIELD CONCESSIONS STAND 3RD BASE,”
    “Dog Almighty Catering Company (WCID #685),”
    “Doherty's Fish &amp; Chips Paddy Wagon (WCID #663),”
    “DOHERTY'S IRISH PUB &amp; RESTAURANT,”
    “DOHERTY'S IRISH PUB &amp; RESTAURANT,”
    “Dolphin`s,”
    “Dominic`s NY Pizzeria,”
    “DOMINO'S #4453,”
    “Domino's #4464,”
    “DOMINO'S #5500,”
    “DOMINO'S #5504,”
    “Domino's #5561,”
    “Domino's #5577,”
    “DOMINO'S #5591,”
    “Domino's #7431,”
    “DOMINO'S #8855,”
    “Domino's #8908,”
    “DOMINO'S #8935,”
    “DOMINO'S #8938,”
    “DOMINO'S PIZZA #4486,”
    “DOMINO'S PIZZA #4495,”
    “Domino's Pizza #5501,”
    “Domino's Pizza #5505,”
    “Domino`s,”
    “Domino`s #8820,”
    “Domino`s Pizza,”
    “Domino`s Pizza # 7487,”
    “Domino`s Pizza #5506,”
    “Domino`s Pizza #8980,”
    “DOMINOS #8824,”
    “Dominos #8849,”
    “Dominos #8903,”
    “DOMINOS #8958,”
    “Dominos Pizza #4493,”
    “DOMINOS PIZZA #8940,”
    “DOMINOS PIZZA #8978,”
    “DON BELL'S GRILL HOUSE (WCID # 606),”
    “DON BETO'S TACOS,”
    “DON JUAN MEAT MARKET,”
    “DON JULIO MEXICAN RESTAURANT,”
    “Donatos,”
    “DONOVAN'S DISH,”
    “DOS TAQUITOS,”
    “Double U's Dawgs &amp; Catering (WCID #719),”
    “Douglas Elem Sch Cafeteria,”
    “DQ GRILL &amp; CHILL #24227,”
    “DQ GRILL &amp; CHILL #43767,”
    “DQ Grill and Chill #41609,”
    “DQ Grill and Chill #41656,”
    “DRIFTWOOD SOUTHERN KITCHEN,”
    “Drive Shack,”
    “DUCK DONUTS,”
    “DUCK DONUTS,”
    “Duke Raleigh Hospital Foodservice,”
    “DUNKIN DONUTS,”
    “DUNKIN DONUTS #306810,”
    “DUNKIN DONUTS #337301,”
    “DUNKIN DONUTS #347603,”
    “DUNKIN DONUTS #347837,”
    “DUNKIN DONUTS #348561,”
    “DUNKIN DONUTS #349131,”
    “DUNKIN DONUTS #350292,”
    “DUNKIN DONUTS #351119,”
    “DUNKIN DONUTS 344467,”
    “DUNKIN DONUTS 348408,”
    “DUNKIN DONUTS BASKIN ROBBINS #342104,”
    “DUNKIN DONUTS BASKIN ROBBINS #344346 ,”
    “DUNKIN DONUTS BASKIN ROBBINS #350706,”
    “DUNKIN DONUTS/BASKIN ROBBINS #331785,”
    “DUNKIN DONUTS/BASKIN ROBBINS #334786,”
    “DUNKIN DONUTS/BASKIN ROBBINS #339085,”
    “DUNKIN' DONUTS #348417,”
    “DUNKIN` DONUTS PC #347369,”
    “Durant Road Elem. Cafeteria,”
    “DURANT ROAD MIDDLE SCHOOL CAFETERIA,”
    “Durant's Dogs (WCID #628),”
    “EARTH FARE #145 CAFE,”
    “EARTH FARE #145 MEAT/SEAFOOD,”
    “EARTH FARE #145 PRODUCE,”
    “EARTH FARE #145 SPECIALTY,”
    “Earth Fare The Healthy Supermarket Meat Dept.,”
    “Earth Fare The Healthy Supermarket Produce,”
    “Earth Fare The Healthy Supermarket Restaurant,”
    “Earth Fare The Healthy Supermarket Specialty/Cheese,”
    “East Cary Middle Sch. Cafeteria,”
    “EAST COAST WINGS NC127,”
    “East Garner Elementary Lunchroom,”
    “East Garner Middle Sch. Cafeteria,”
    “EAST MILLBROOK MIDDLE SCHOOL CAFETERIA,”
    “EAST WAKE HIGH SCHOOL,”
    “East Wake Middle Sch. Cafeteria,”
    “EASTERN CHINA CHINESE RESTAURANT,”
    “Edible Arrangements,”
    “Edible Arrangements,”
    “EDIBLE ARRANGEMENTS #1159,”
    “EDIBLE ARRANGEMENTS #1585,”
    “EDIBLE ARRANGEMENTS #1614,”
    “EDIBLE ARRANGEMENTS #365-CARY,”
    “EDIBLE ARRANGEMENTS #391,”
    “Education Bldg. Snack Bar,”
    “EDWARDS MILL BAR AND GRILL ,”
    “EGGS UP GRILL #17,”
    “Eggs Up Grill #31,”
    “Eighty 8 (WCID #679),”
    “Eighty 8 Bistro,”
    “El Caracol Mexican Grill,”
    “EL CERRO BAR &amp; GRILL,”
    “El Cuscatleco Restaurant,”
    “El Dorado #3,”
    “El Dorado #8,”
    “El Dorado Mexican Restaurant,”
    “El Dorado Restaurant,”
    “El Lobo Mexican Restaurant,”
    “EL MANDADO COMIDA CASERA,”
    “El Mandado Meat Market,”
    “EL PARAISO MEXICAN FOOD (WCID #242),”
    “El Paseo,”
    “El Pollo Rico Market,”
    “EL POLLOTE,”
    “El Rey Minisuper (Meat Market),”
    “EL RINCONCITO,”
    “El Rodeo Restaurant,”
    “El Rodeo Restaurant,”
    “El Sazon de mi Tierra (WCID #620),”
    “El Senor,”
    “EL TACO FELIZ (WCID #412),”
    “EL TACO MARKET,”
    “El Tapatio,”
    “El Tapatio #4,”
    “El Toluco (WCID #689),”
    “EL TORO SUPERMARKET MEAT MARKET ,”
    “Elderly Nutrition Center Tucker St,”
    “Elements,”
    “Elevated Grains,”
    “Elmcroft of Northridge,”
    “EMBASSY SUITES AND FLYING SPOONS,”
    “Emma Conn Elementary Cafeteria,”
    “EMPIRE EATS CATERING KITCHEN,”
    “Enloe High School Cafeteria,”
    “ENRIGO ITALIAN BISTRO,”
    “ESMERALDA GRILL,”
    “EURO CAFE,”
    “Everest Kitchen,”
    “Everest Nepali Kitchen,”
    “Exposition Center Kitchen,”
    “FAINTING GOAT BREWING COMPANY,”
    “Fairfield Inn &amp;  Suites Kitchen,”
    “FAIRFIELD INN &amp; SUITES CRABTREE BREAKFAST,”
    “FAIRFIELD INN &amp; SUITES Foodservice,”
    “Fairfield Inn &amp; Suites RDU Foodservice,”
    “FAIRFIELD INN &amp; SUTIES RALEIGH CARY,”
    “Fairgrounds Deli,”
    “Falafel Co,”
    “FALLS RIVER COURT (FOOD SERVICE),”
    “FALLS RIVER VILLAGE (FOOD SERVICE),”
    “Falls Village Wine and Beer,”
    “FAMOUS TOASTERY,”
    “FAMOUS TOASTERY WESTIN CORNERS,”
    “Fancy Dogs #2 (WCID #106),”
    “FARINA NEIGHBORHOOD ITALIAN,”
    “Farmington Woods Elem. Cafeteria,”
    “FarmTable &amp; Gatehouse Tavern,”
    “Fast Food Mart,”
    “Fat Boys Kitchen, LLC (WCID # 613),”
    “FEI Huang Restaurant at A&amp;C ,”
    “Fiesta Mexicana,”
    “FIESTA MEXICANA #6,”
    “Fiesta Mexicana Restaurante,”
    “Fig,”
    “FILIPINO EXPRESS RESTAURANT,”
    “FIRE WOK,”
    “FIREBIRDS,”
    “FireBirds Rocky Mountain Grill #2,”
    “Firehouse Foods,”
    “Firehouse Subs,”
    “FIREHOUSE SUBS #0528,”
    “Firehouse Subs #1052,”
    “FIREHOUSE SUBS #1138,”
    “FIREHOUSE SUBS #122,”
    “Firehouse Subs #1517,”
    “Firehouse Subs #1530,”
    “FIREHOUSE SUBS #487,”
    “Firehouse Subs #785,”
    “Firehouse Subs #917,”
    “Firehouse Subs Ladder #178,”
    “Firenza Pizza,”
    “First Baptist Church,”
    “FIRST CHINA RESTAURANT,”
    “First Citizens Bank Kitchen,”
    “First Citizens Operations Center Cafeteria,”
    “FIRST PRESBYTERIAN CHURCH,”
    “FIRST WATCH,”
    “FIRST WATCH #517,”
    “First Watch 555,”
    “FIRST WATCH BRADFORD,”
    “First Watch Daytime Cafe #580,”
    “FIVE BROS PIZZA,”
    “FIVE GUYS #1728,”
    “FIVE GUYS #1784,”
    “FIVE GUYS #1797,”
    “FIVE GUYS 1710,”
    “Five Guys Burgers and Fries #2,”
    “Five Guys Famous Burgers and Fries of Knightdale,”
    “FIVE POINTS CENTER FOR ACTIVE ADULTS,”
    “Five Star,”
    “FLAME KABOB,”
    “Flask &amp; Beaker at Stateview Hotel,”
    “FLATTZ (WCID #538),”
    “FLAVORS KITCHEN,”
    “FLAVOURS,”
    “FLEMING'S PRIME STEAKHOUSE &amp; WINE BAR #4402,”
    “FLYING BURRITO,”
    “FOGATA BRAVA MEXICAN RESTURANT,”
    “Food Lion #1079 Deli,”
    “Food Lion #1079 Meat Market,”
    “FOOD LION #1079 PRODUCE,”
    “FOOD LION #1259,”
    “Food Lion #1259 Deli,”
    “Food Lion #1259 Meat Market ,”
    “FOOD LION #1338 DELI,”
    “FOOD LION #1338 MEAT/SEAFOOD,”
    “FOOD LION #1338 PRODUCE,”
    “Food Lion #1358 Deli,”
    “Food Lion #1358 Meat Market,”
    “FOOD LION #1358 PRODUCE,”
    “Food Lion #1374 Deli ,”
    “Food Lion #1374 Meat Market,”
    “FOOD LION #1374 PRODUCE,”
    “Food Lion #1454 Deli,”
    “Food Lion #1454 Meat Market,”
    “Food Lion #1454 Produce,”
    “Food Lion #1459 Deli,”
    “Food Lion #1459 Meat Market,”
    “FOOD LION #1459 PRODUCE,”
    “Food Lion #1481 Deli ,”
    “Food Lion #1481 Meat Market ,”
    “FOOD LION #1481 PRODUCE,”
    “Food Lion #1482 Deli,”
    “Food Lion #1482 Meat Market,”
    “FOOD LION #1482 PRODUCE,”
    “Food Lion #1484 Deli ,”
    “Food Lion #1484 Meat Market,”
    “FOOD LION #1484 PRODUCE,”
    “Food Lion #1491 Deli,”
    “Food Lion #1491 Meat Market,”
    “FOOD LION #1491 PRODUCE,”
    “Food Lion #1496 Deli ,”
    “Food Lion #1496 Meat Market ,”
    “FOOD LION #1496 PRODUCE,”
    “FOOD LION #1514 MEAT/SEAFOOD,”
    “FOOD LION #1514 PRODUCE,”
    “FOOD LION #1541 DELI,”
    “Food Lion #1557 Deli/Bakery ,”
    “Food Lion #1557 Meat Market ,”
    “FOOD LION #1557 PRODUCE,”
    “Food Lion #1573 Deli,”
    “Food Lion #1573 Meat Market,”
    “FOOD LION #1573 PRODUCE,”
    “Food Lion #1589 Deli ,”
    “Food Lion #1589 Meat Market ,”
    “FOOD LION #1589 PRODUCE,”
    “Food Lion #1654 Deli,”
    “Food Lion #1654 Meat Market,”
    “FOOD LION #1654 PRODUCE,”
    “Food Lion #1669 Deli ,”
    “Food Lion #1669 Meat Market,”
    “FOOD LION #1669 PRODUCE,”
    “Food Lion #193 Deli,”
    “Food Lion #193 Meat Market,”
    “FOOD LION #193 PRODUCE,”
    “FOOD LION #2196 DELI,”
    “FOOD LION #2196 MEAT MARKET/SEAFOOD,”
    “FOOD LION #2196 PRODUCE,”
    “FOOD LION #2198 DELI/BAKERY,”
    “FOOD LION #2198 MEAT MARKET,”
    “FOOD LION #2198 PRODUCE,”
    “FOOD LION #2199 DELI,”
    “FOOD LION #2199 Meat Market/SEAFOOD,”
    “FOOD LION #2199 PRODUCE,”
    “Food Lion #2227 Deli,”
    “Food Lion #2227 Meat Market,”
    “Food Lion #2227 Produce,”
    “Food Lion #247 Deli,”
    “Food Lion #247 Meat Market,”
    “FOOD LION #247 PRODUCE,”
    “Food Lion #2504 Deli ,”
    “Food Lion #2504 Meat Market ,”
    “FOOD LION #2504 PRODUCE,”
    “Food Lion #2534 Deli,”
    “Food Lion #2534 Meat Market/Seafood,”
    “FOOD LION #2534 PRODUCE,”
    “Food Lion #2638 Deli/Bakery,”
    “Food Lion #2638 Meat Market/Seafood,”
    “FOOD LION #2638 PRODUCE,”
    “Food Lion #341 Deli ,”
    “FOOD LION #341 MEAT MARKET,”
    “FOOD LION #341 PRODUCE,”
    “Food Lion #40 Deli ,”
    “Food Lion #40 Meat Market ,”
    “FOOD LION #40 PRODUCE,”
    “Food Lion #434 Deli,”
    “Food Lion #434 Meat Market,”
    “FOOD LION #434 PRODUCE,”
    “Food Lion #536 Deli ,”
    “Food Lion #536 Meat Market ,”
    “FOOD LION #536 PRODUCE,”
    “Food Lion #561 Deli,”
    “Food Lion #561 Meat Market,”
    “FOOD LION #561 PRODUCE,”
    “Food Lion #572 Deli,”
    “Food Lion #572 Meat Market ,”
    “Food Lion #572 Produce,”
    “Food Lion #586 Deli,”
    “Food Lion #586 Meat Market ,”
    “FOOD LION #586 PRODUCE,”
    “Food Lion #624 Deli ,”
    “Food Lion #624 Meat Market ,”
    “FOOD LION #624 PRODUCE,”
    “Food Lion #649 Deli ,”
    “Food Lion #649 Meat Market ,”
    “FOOD LION #649 PRODUCE,”
    “Food Lion #669 Deli,”
    “Food Lion #669 Meat Market,”
    “FOOD LION #669 PRODUCE,”
    “Food Lion #723 Deli ,”
    “Food Lion #723 Meat Market ,”
    “FOOD LION #723 PRODUCE,”
    “FOOD LION #727 DELI,”
    “Food Lion #727 Meat Market ,”
    “FOOD LION #727 PRODUCE,”
    “Food Lion #75 Deli ,”
    “Food Lion #75 Meat Market,”
    “FOOD LION #75 PRODUCE,”
    “Food Lion #757 Deli,”
    “Food Lion #757 Meat Market,”
    “FOOD LION #757 PRODUCE,”
    “Food Lion #815 Deli ,”
    “Food Lion #815 Meat Market ,”
    “FOOD LION #815 PRODUCE,”
    “Food Lion #816 Deli,”
    “Food Lion #816 Meat Market,”
    “FOOD LION #816 PRODUCE,”
    “Food Lion #90 Deli,”
    “Food Lion #90 Meat Market,”
    “FOOD LION #90 PRODUCE,”
    “Food Lion #938 Deli ,”
    “Food Lion #938 Meat Market,”
    “FOOD LION #938 PRODUCE,”
    “Food Lion #996 Deli,”
    “Food Lion #996 Meat Market,”
    “FOOD LION #996 PRODUCE,”
    “Food Runners Collaborative,”
    “FOODLAND 2 (WCID#404),”
    “FOODLAND 3 (WCID #406),”
    “FOODLAND 4 (WCID # 469),”
    “FOODLAND MOBILE FOOD UNIT ( WCID # 170 ),”
    “FOODLAND PUC #1 (WCID #322),”
    “Forest Pines Drive Elementary,”
    “Forestville Elementary School Cafeteria,”
    “FORTNIGHT BREWERY,”
    “Fount Coffee &amp; Kitchen,”
    “FOUNTAIN DINING HALL,”
    “Four Points Cafe,”
    “FOX AND HOUND #65077,”
    “Fox Road Elementary Cafeteria,”
    “Framework Juice + Kitchen @ TKA,”
    “FRANK THEATRES,”
    “Frankie`s Restaurant,”
    “Franks Pizza Restaurant,”
    “Fred Olds Elementary Cafeteria,”
    “FREDDY'S FROZEN CUSTARD &amp; STEAKBURGERS #3207,”
    “Freddy's Frozen Custard &amp; Steakburgers #3213,”
    “Fresca Cafe' and Gelato,”
    “FRESH LEVANT BISTRO,”
    “Fresh Market #8 Deli,”
    “Fresh Market #8 Meat Market ,”
    “Fresh Market #8 Produce,”
    “Fresh Market #8 Seafood,”
    “Fresh Market Deli,”
    “Fresh Market Produce,”
    “Fresh Market Seafood and Meat Market,”
    “FRESH OUTTA BROOKLYN (WCID #550),”
    “FRESHBERRY FROZEN YOGURT CAFE,”
    “FRIDA'S PATIO MEXICAN CUISINE,”
    “Friendship Christian Sch. Cafeteria,”
    “Fu Kee Express,”
    “Fuel Stop at Brier Creek,”
    “Fuji China,”
    “FUJI EXPRESS,”
    “FUJI SAN,”
    “FujiSan,”
    “Fujisan @ Sams,”
    “FULL BLOOM COFFEE AND CRAFT,”
    “FULL MOON OYSTER BAR,”
    “Fuller Elementary Cafeteria,”
    “FULLY LOADED FRITTERS (WCID #572),”
    “Funguys,”
    “Fuquay Elementary Cafeteria,”
    “Fuquay Meat Market,”
    “Fuquay Senior High Cafeteria,”
    “Fuquay Varina Cafeteria at Willow Springs High School,”
    “Fuquay Varina Middle Sch. Cafet.,”
    “FUZZY'S EMPANADAS (WCID #542),”
    “G &amp; C Deliciosos Hot Dogs (WCID #647),”
    “G-58 CUISINE,”
    “GALAXY FUN PARK,”
    “GARDENS AT WAKEFIELD PLANTATION,”
    “GARIBALDI TRATTORIA PIZZA E PASTA,”
    “GARLAND,”
    “Garner High School Cafeteria,”
    “Garner High School Indoor Concessions,”
    “Garner Polar Ice House,”
    “GARNER RD STOP N GO,”
    “GARNER RECREATIONAL PARK CONCESSION,”
    “Garner Senior Center,”
    “Gateway Restaurant,”
    “GENKI RESTAURANT &amp; SUSHI BAR,”
    “Georgina`s Pizzeria,”
    “Gettin' Sauced in the City (WCID #615),”
    “GiGi's Pizza,”
    “GINGER ASIAN CUISINE,”
    “GINO'S PIZZA,”
    “GLAXO ZEBULON FOODSERVICE,”
    “Glenaire Dining Services,”
    “Glenlake Cafe and Catering,”
    “Glenwood Grill,”
    “Global Village Organic Coffee,”
    “Glory Days Grill,”
    “GODAVARI TRULY SOUTH INDIAN,”
    “Goji Bistro,”
    “GOLDEN CHINA,”
    “Golden China - Zebulon,”
    “GOLDEN CHINA CHINESE RESTAURANT,”
    “Golden China Express ,”
    “Golden Corral #2485,”
    “GOLDEN CORRAL #935,”
    “GOLDEN CORRAL #942,”
    “GOLDEN CORRAL #950,”
    “Golden Dragon ,”
    “Golden Hex Foods,”
    “GOLDEN PIG,”
    “GOLDEN SEAFOOD AND CHICKEN,”
    “GONZA TACOS (WCID #583),”
    “GONZA TACOS &amp; TEQUILA,”
    “GONZA TACOS Y TEQUILA,”
    “GONZA TACOS Y TEQUILA,”
    “GONZA TACOS Y TEQUILA,”
    “GOOD HARVEST,”
    “Good Taste Chinese Restaurant,”
    “GOODBERRY'S #6,”
    “Goodberry`s,”
    “Goodberry`s,”
    “Goodberry`s #12,”
    “Goodberry`s Creamery,”
    “Goodberry`s Creamery,”
    “Goodberry`s Creamery,”
    “GOODBERRY`S CREAMERY AT CAMERON VILLAGE,”
    “Goodness GraceUs  (WCID# 626),”
    “GOOEY'S AMERICAN GRILLE,”
    “GORDON BIERSCH,”
    “GRABBAGREEN,”
    “GRACE Christian School Kitchen,”
    “GRAND ASIA MEAT MARKET,”
    “Grand Street Pizza,”
    “GRANDMA'S DINER,”
    “GRANDOTES TACO GRILL (wcid #530),”
    “Grandsons Garner,”
    “GRAVY,”
    “Great China,”
    “GREAT HARVEST BREAD CO.,”
    “Great Wok,”
    “GREEK BASMA,”
    “Greek Bistro,”
    “GREEK FIESTA,”
    “Greek Fiesta at Brier Creek,”
    “Greek Fiesta at Crossroads,”
    “Green Bubbles (WCID #717),”
    “Green Hope Elementary Cafeteria,”
    “Green Hope High Sch. Cafeteria,”
    “GREEN LEADERSHIP AND WORLD LANGUAGES MAGNET ELEMENTARY SCHOOL CAFETERIA,”
    “GREEN PLANET CATERING,”
    “GREENWAY BEER AND WINE,”
    “GREGORYS GOLF GRILL,”
    “Greyhound Bus Terminal,”
    “Grill Brazil,”
    “GRINGO A GOGO,”
    “GROCERY BOY JR.,”
    “GROUCHO'S DELI,”
    “Guasaca,”
    “GUASACA AREPA &amp; SALSA GRILL,”
    “GUASACA AREPA &amp; SALSA GRILL,”
    “GUMBY`S PIZZA & WINGS,”
    “Gusto Farm to Street,”
    “Gym Tacos (WCID #699),”
    “H Mart BBQ Chicken,”
    “H Mart Don-don,”
    “H Mart Kangnam Town,”
    “H Mart Meat Department,”
    “H Mart Produce Department,”
    “H Mart RTC Department,”
    “H Mart SDG Tofu House,”
    “H Mart Seafood Department,”
    “Habibi Grill,”
    “Hako Sushi,”
    “Hale Yeah Kitchen  (WCID #640),”
    “Hampton Inn - Foodservice,”
    “HAMPTON INN (Breakfast area),”
    “Hampton Inn & Suites Food Service,”
    “Hampton Inn &amp; Suites,”
    “HAMPTON INN &amp; SUITES,”
    “HAMPTON INN &amp; SUITES BREAKFAST HOLLY SPRINGS,”
    “Hampton Inn &amp; Suites Brier Creek Foodservice,”
    “HAMPTON INN &amp; SUITES CRABTREE RALEIGH KITCHEN,”
    “HAMPTON INN BREAKFAST,”
    “HAMPTON INN RALEIGH/CARY BREAKFAST,”
    “HAMPTON INN WAKE FOREST HOT BREAKFAST,”
    “Han-Dee Hugo's #46,”
    “HAN-DEE HUGO'S #54,”
    “Han-Dee Hugo`s #41,”
    “Han-Dee Hugo`s #43,”
    “Han-Dee Hugo`s #47,”
    “Han-Dee Hugo`s #60,”
    “Han-Dee Hugo`s #62,”
    “Han-Dee Hugo`s #90,”
    “Han-Dee Hugo`s #95,”
    “Happy &amp; Hale @ North Hills,”
    “HAPPY AND HALE,”
    “HARDEE'S #1655,”
    “Hardee`s #1189,”
    “Hardee`s #1204,”
    “Hardee`s #1205,”
    “Hardee`s #1206,”
    “Hardee`s #1207,”
    “Hardee`s #1216,”
    “Hardee`s #1219,”
    “Hardees,”
    “Hardees #1638,”
    “Hardees Of Knightdale,”
    “Harris Creek Elem. School Lunchroom,”
    “Harris Teeter #103 Deli,”
    “Harris Teeter #103 Meat Market/Seafood,”
    “Harris Teeter #103 Produce,”
    “Harris Teeter #104 Deli,”
    “Harris Teeter #104 Meat Market,”
    “Harris Teeter #104 Produce,”
    “HARRIS TEETER #104 STARBUCKS,”
    “Harris Teeter #112 Deli,”
    “Harris Teeter #112 Meat Market/Seafood,”
    “Harris Teeter #112 Produce,”
    “HARRIS TEETER #112 STARBUCKS,”
    “Harris Teeter #118 Deli,”
    “Harris Teeter #118 Meat Market,”
    “Harris Teeter #118 Produce,”
    “HARRIS TEETER #118 STARBUCKS,”
    “HARRIS TEETER #136 DELI,”
    “HARRIS TEETER #136 MEAT MARKET/SEAFOOD,”
    “HARRIS TEETER #136 PRODUCE,”
    “Harris Teeter #138 Deli,”
    “Harris Teeter #138 Meat/Seafood,”
    “Harris Teeter #138 Produce,”
    “Harris Teeter #21 Deli,”
    “Harris Teeter #21 Meat Market,”
    “Harris Teeter #21 Produce & Salad Bar,”
    “Harris Teeter #236 - Deli,”
    “Harris Teeter #236 - Meat/Seafood,”
    “HARRIS TEETER #236 - PRODUCE,”
    “HARRIS TEETER #236 STARBUCKS,”
    “Harris Teeter #257 Deli,”
    “HARRIS TEETER #257 MEAT/SEAFOOD,”
    “Harris Teeter #257 Produce,”
    “HARRIS TEETER #257 STARBUCKS,”
    “Harris Teeter #26 Deli,”
    “Harris Teeter #26 Meat/Seafood,”
    “Harris Teeter #26 Pizza Bar,”
    “Harris Teeter #26 Produce ,”
    “Harris Teeter #283 Deli ,”
    “Harris Teeter #283 Meat/Seafood,”
    “Harris Teeter #283 Produce ,”
    “HARRIS TEETER #283 STARBUCKS,”
    “Harris Teeter #289 Deli ,”
    “Harris Teeter #289 Meat Market,”
    “Harris Teeter #298 Deli/Bakery,”
    “Harris Teeter #298 Meat Seafood,”
    “Harris Teeter #298 Produce,”
    “HARRIS TEETER #298 STARBUCKS,”
    “Harris Teeter #304 Deli/Bakery,”
    “Harris Teeter #304 Meat/Seafood,”
    “Harris Teeter #304 Produce,”
    “Harris Teeter #304 Starbucks,”
    “Harris Teeter #304 Wine Bar,”
    “Harris Teeter #311 Cheese Island,”
    “HARRIS TEETER #311 DELI,”
    “HARRIS TEETER #311 MEAT MARKET,”
    “HARRIS TEETER #311 PRODUCE,”
    “Harris Teeter #311 Starbucks,”
    “HARRIS TEETER #319 DELI,”
    “HARRIS TEETER #319 MEAT &amp; SEAFOOD,”
    “HARRIS TEETER #319 PRODUCE,”
    “Harris Teeter #330 Deli,”
    “Harris Teeter #330 Meat/Seafood,”
    “Harris Teeter #330 Produce,”
    “HARRIS TEETER #331 DELI/BAKERY,”
    “HARRIS TEETER #331 MEAT/SEAFOOD,”
    “HARRIS TEETER #331 PRODUCE,”
    “HARRIS TEETER #331 STARBUCKS,”
    “Harris Teeter #344 Deli/Bakery,”
    “Harris Teeter #344 Meat/Seafood,”
    “Harris Teeter #344 Produce,”
    “HARRIS TEETER #353 DELI,”
    “HARRIS TEETER #353 MEAT &amp; SEAFOOD,”
    “HARRIS TEETER #353 PRODUCE,”
    “Harris Teeter #353 Starbucks,”
    “HARRIS TEETER #367 DELI,”
    “HARRIS TEETER #367 MEAT/SEAFOOD,”
    “HARRIS TEETER #367 PRODUCE,”
    “Harris Teeter #367 Starbucks,”
    “Harris Teeter #38 Deli ,”
    “Harris Teeter #38 Meat Market ,”
    “HARRIS TEETER #395 DELI,”
    “HARRIS TEETER #395 MEAT MARKET/SEAFOOD,”
    “HARRIS TEETER #395 PRODUCE,”
    “HARRIS TEETER #422 DELI,”
    “HARRIS TEETER #422 MM/SEAFOOD,”
    “HARRIS TEETER #422 PRODUCE,”
    “Harris Teeter #43 Deli,”
    “Harris Teeter #43 Meat Market & Seafood,”
    “Harris Teeter #43 Produce,”
    “HARRIS TEETER #43 STARBUCKS,”
    “HARRIS TEETER #430 - DELI,”
    “HARRIS TEETER #430 - MEAT/SEAFOOD,”
    “HARRIS TEETER #430 - PRODUCE,”
    “HARRIS TEETER #430 STARBUCKS,”
    “Harris Teeter #495 Deli,”
    “Harris Teeter #495 Meat/Seafood,”
    “Harris Teeter #495 Produce,”
    “Harris Teeter #495 Starbucks,”
    “Harris Teeter #495 Starbucks,”
    “Harris Teeter #496 Deli,”
    “Harris Teeter #496 Meat/Seafood,”
    “Harris Teeter #496 Produce,”
    “Harris Teeter #496 Starbucks,”
    “Harris Teeter #498 Deli,”
    “Harris Teeter #498 Produce,”
    “Harris Teeter #58 Deli,”
    “Harris Teeter #58 Meat/Seafood,”
    “Harris Teeter #58 Produce,”
    “Harris Teeter #58 Starbucks,”
    “Harris Teeter #69 Deli /Bakery,”
    “Harris Teeter #69 Meat Market,”
    “Harris Teeter #69 Produce,”
    “Harris Teeter #90 Deli,”
    “Harris Teeter #90 Meat Market,”
    “Harris Teeter #90 Produce ,”
    “Harris Teeter #90 Starbucks,”
    “HARRIS TEETER 138 STARBUCKS,”
    “Harris Teeter Meat/Seafood #498,”
    “Harvest Grille and Bistro (at Double Tree),”
    “Harvest Moon Bakery - Cafe,”
    “HAWKSNEST GRILL,”
    “HAWTHORN SUITES BREAKFAST,”
    “HAYASHI JAPANESE RESTAURANT,”
    “Hayes Barton Cafe &amp; Dessertery,”
    “Heirloom,”
    “HERBERT AKINS ELEMENTARY LUNCHROOM,”
    “Hereghty Heavenly Delicious,”
    “Heritage Elem. School Cafeteria,”
    “HERITAGE HIGH SCHOOL CAFETERIA,”
    “Heritage Middle School Cafeteria,”
    “Hi Poke,”
    “HIBACHI &amp; CO,”
    “HIBACHI 101,”
    “Hibachi 88,”
    “HIBACHI 88,”
    “HIBACHI ASIAN DINER,”
    “Hibachi Blue,”
    “HIBACHI BOWL,”
    “HIBACHI CHINA 88,”
    “HIBACHI CHINA BUFFET,”
    “HIBACHI CHINA BUFFET,”
    “Hibachi Express,”
    “HIBACHI GRILL &amp; SUPREME BUFFET,”
    “HIBACHI JAPAN,”
    “HIBACHI JAPAN #2,”
    “HIBACHI K EXPRESS,”
    “HIBACHI SUSHI,”
    “Hibachi Xpress (WCID #696),”
    “HIBACHI XPRESS CATERING,”
    “HIBERNIAN PUB,”
    “HIBERNIAN PUB &amp; RESTAURANT,”
    “Hickory Tavern,”
    “HICKORY TAVERN #29,”
    “Hieu Bowl,”
    “High Park Bar and Grill,”
    “HIGHCRAFT BEER MARKET,”
    “Highcroft Elementary Cafeteria,”
    “HIGHGROVE ESTATE,”
    “Highway 55 Burgers Shakes &amp; Fries,”
    “Hilburn Drive Elementary Cafeteria,”
    “HILBURN EXXON DELI,”
    “HILLCREST RALEIGH AT CRABTREE VALLEY REHAB &amp; HEALTHCARE,”
    “Hillside Nursing Center Foodservice,”
    “HILLTOP,”
    “HILLTOP CHRISTIAN SCHOOL CONCESSION,”
    “HILLTOP HOME KITCHEN,”
    “HILTON GARDEN INN RESTAURANT,”
    “Hilton North Raleigh Foodservice,”
    “Himalayan Grill and Bar,”
    “HIMALAYAN NEPALI CUISINE,”
    “HIMALAYAN RANGE,”
    “HL CATERING COMPANY,”
    “Hodge Road Elementary Cafeteria,”
    “HOLIDAY INN EXPRESS,”
    “Holiday Inn Express &amp; Suites Food Service,”
    “Holiday Inn Express &amp; Suites Foodservice,”
    “HOLIDAY INN EXPRESS BREAKFAST,”
    “HOLIDAY INN EXPRESS Foodservice,”
    “HOLIDAY INN EXPRESS HOTEL & SUITES BREAKFAST,”
    “Holly Grove Elementary Cafeteria,”
    “HOLLY GROVE MIDDLE SCHOOL CAFETERIA,”
    “Holly Hill Adult Hospital Foodservice,”
    “HOLLY HILL CHILDREN'S HOSPITAL DINING,”
    “Holly Hill Hospital Kitchen,”
    “Holly Ridge Elementary Cafeteria,”
    “Holly Ridge Middle Sch. Cafeteria,”
    “Holly Springs Elem. Cafeteria,”
    “HOLLY SPRINGS GAS AND GROCERY,”
    “Holly Springs High Sch. Cafeteria ,”
    “Holy Trinity Greek Orthodox Church Kitchen,”
    “HOME2 SUITES INSPIRED TABLE,”
    “Homegrown Pizza,”
    “HOMEWOOD SUITES BY HILTON CARY FOOD SERVICE,”
    “HOMEWOOD SUITES BY HILTON RALEIGH/CRABTREE FOODSERVICE,”
    “Homewood Suites Cary Foodservice,”
    “Honest Abe's Kitchen and Bar,”
    “HONEY BAKED HAM COMPANY #103,”
    “HONEYBAKED HAM &amp; CAFE,”
    “Honeybaked Ham Company,”
    “Hong Kong,”
    “Hong Kong #1 Chinese Restaurant,”
    “HONG KONG CHINESE KITCHEN,”
    “Hong Kong Chinese Restaurant,”
    “HOOTERS,”
    “HOOTERS OF RALEIGH,”
    “Hope Community Church,”
    “HORTON'S CREEK ELEMENTARY SCHOOL CAFETERIA,”
    “HOT BREADS CAFE,”
    “HOT CHIX (WCID # 602),”
    “Hot Diggady Dog (WCID #625),”
    “Hot Sauce &amp; Ketchup,”
    “Hot Tomato Pizzeria,”
    “Hugo's Kitchen,”
    “Humble Pie,”
    “Humming Bird,”
    “Hummus Cafe,”
    “HUNGRY HOWIE`S #613,”
    “Hungry Howie`s Pizza,”
    “HUNGRY HOWIES PIZZA,”
    “HUNT BROTHERS PIZZA,”
    “Hunter Elementary Cafeteria,”
    “HWY 55 BURGERS SHAKES &amp; FRIES,”
    “Hwy 55 Burgers, Shakes &amp; Fries,”
    “HWY 55 OF APEX,”
    “Hwy. 55 Burgers, Shakes &amp; Fries #185,”
    “Hyatt House Brier Creek H Bar,”
    “HYATT HOUSE FOOD SERVICE,”
    “HYATT HOUSE H BAR,”
    “HYATT PLACE,”
    “Hyatt Place Cafe,”
    “HYATT PLACE NORTH RALEIGH-MIDTOWN FOODSERVICE,”
    “HYDERABAD HOUSE,”
    “I LOVE NY PIZZA,”
    “I Really Mean It (WCID # 614),”
    “IHOP,”
    “IHOP #2130,”
    “IHOP #3181,”
    “IHOP #3331,”
    “IHOP #3487,”
    “IHOP-Midway Plantation #3180,”
    “IL BACIO,”
    “IMPERIAL GARDEN CHINESE RESTAURANT,”
    “IMURJ CAFE,”
    “Inchin`s Bamboo Garden,”
    “Independence Village,”
    “INTERFOOD 3 HERMANOS MEAT MARKET,”
    “Interfood Plaza Latina ,”
    “INTERFOOD PLAZA MEAT MARKET,”
    “International Foods,”
    “INTERNATIONAL FOODS DELI,”
    “International Foods Meats,”
    “International House Of Pancakes,”
    “International House Of Pancakes,”
    “IPHO SUSHI KITCHEN &amp; BAR,”
    “IRIS,”
    “Irregardless Cafe,”
    “Island Splash Grill (WCID #664),”
    “ISTANBUL RESTAURANT,”
    “ITALIAN KITCHEN,”
    “Iyla's Southern Kitchen @ MSFH,”
    “J &amp; S NEW YORK,”
    “J &amp; S NEW YORK PIZZA,”
    “J &amp; S New York Pizza,”
    “J J CHINA,”
    “J. ALEXANDER'S,”
    “J. Betski`s,”
    “J.Q.'S CORNER CAFE,”
    “J.R. Mobile Kitchen (WCID #704),”
    “JACK'S SEAFOOD,”
    “Jacks Seafood Restaurant,”
    “JADE GARDEN CHINESE RESTAURANT,”
    “Jaguar Club Gym Concessions,”
    “Jaguar Club Stadium Concessions,”
    “Jaipur Indian Cuisine,”
    “JAMAICA JERK MASTERS,”
    “JAMAICA JERK MASTERS,”
    “JAMAICAN GRILLE,”
    “Jamaican Tasty Delights,”
    “Jasmin & Olivz Mediterranean,”
    “Jasmin &amp; Olivz,”
    “JASMIN BISTRO,”
    “JASMIN BISTRO,”
    “Jasmin Mediterranean Bistro,”
    “JASMIN MEDITERRANEAN BISTRO,”
    “JASMIN MEDITERRANEAN BISTRO,”
    “JASON'S DELI #890,”
    “JASON'S DELI TALLEY STUDENT UNION,”
    “Jason`s Deli,”
    “Jason`s Deli,”
    “JASON`S DELI # 162,”
    “JAVA CITY,”
    “JD'S TAVERN,”
    “JEFFREYS GRILL (WCID # 608),”
    “Jeffreys Grove Elem. Cafeteria,”
    “Jelly Beans Rest,”
    “Jellybeans,”
    “JERRY'S GRILL,”
    “Jersey Mike's #3005,”
    “Jersey Mike's #3009,”
    “Jersey Mike's #3091,”
    “Jersey Mike's #3176,”
    “JERSEY MIKE'S #349,”
    “JERSEY MIKE'S 3157,”
    “Jersey Mike's Sub #3189,”
    “JERSEY MIKE'S SUBS,”
    “JERSEY MIKE'S SUBS #3150,”
    “JERSEY MIKE'S SUBS #3151,”
    “Jersey Mike's Subs #3181,”
    “Jersey Mike`s,”
    “Jersey Mike`s #3002-A,”
    “Jersey Mike`s #3042,”
    “Jersey Mike`s Of Cary,”
    “Jersey Mike`s Subs,”
    “Jersey Mike`s Subs #3008-B,”
    “Jersey Mikes,”
    “Jersey Mikes,”
    “JERSEY MIKES ,”
    “JERSEY MIKES #3131,”
    “JERSEY MIKES 3133,”
    “Jersey Mikes Restaurant,”
    “Jersey Mikes Restaurant,”
    “JERSEY MIKES SUBS,”
    “Jersey Mikes Subs,”
    “Jersey Mikes Subs,”
    “Jersey Mikes Subs,”
    “JERSEY MIKES SUBS #3132,”
    “JERUSALEM MEAT MARKET,”
    “JESSICA'S (WCID #540),”
    “JET'S PIZZA,”
    “Jet's Pizza,”
    “JET'S PIZZA,”
    “JIM'S OLD TYME HOT DOGS #2 (WCID #327),”
    “Jim's Ole Time Hot Dogs (WCID #454),”
    “Jim's Ole Time Hot Dogs (WCID #501),”
    “JIMMY JOHN'S #1863,”
    “JIMMY JOHN'S #3436,”
    “Jimmy John's #3665,”
    “JIMMY JOHN`S #1025,”
    “Jimmy John`s #1026,”
    “Jimmy John`s #700,”
    “Jimmy John`s #791,”
    “Jimmy John`s #895,”
    “Jimmy John`s #993,”
    “JIMMY JOHNS # 1027,”
    “Jimmy V`s Steak House,”
    “Jimmy's Pizza Time   (WCID # 391),”
    “Jin Jin China,”
    “Joe Van Gogh,”
    “John Deere Cafe,”
    “Johnny's Pizza,”
    “JOHNNY'S PIZZA,”
    “Johnny's Pizza #3,”
    “Jolly's Catering and Events (WCID #593),”
    “Jolly's on Bragg,”
    “Jones Dairy Elem. Sch. Cafeteria,”
    “JONESY'S CONCESSION & CATERING (WCID# 452),”
    “JORDAN LAKE BREWING COMPANY,”
    “Jordan Oaks,”
    “JOSE AND SONS,”
    “JOY LUCK CLUB OF GRAND ASIA MARKET,”
    “JOYCE AND FAMILY RESTAURANT,”
    “Joyner Elementary Cafeteria,”
    “JUBALA COFFEE,”
    “JUBALA VILLAGE COFFEE,”
    “JUBBA HALAL MARKET,”
    “JUICE VIBES,”
    “Juice-Keys #2,”
    “JUICEKEYS,”
    “Julians Intl. Restaurant and Deli,”
    “JUMBO CHINA,”
    “JUMBO CHINA,”
    “Jumbo China,”
    “Jumbo China,”
    “JUMBO CHINA,”
    “JUMBO CHINA RESTUARANT ,”
    “JUS' ENUFF HOME COOKIN',”
    “JUSTICE CENTER CAFE,”
    “Justin's Grill,”
    “K &amp; W Cafeteria,”
    “K&amp;W CAFETERIA,”
    “Kabab Grill (WCID #651),”
    “KABABISH CAFE,”
    “Kabob and Curry,”
    “KABOBI,”
    “Kabuki Japanese Steak House,”
    “Kadhai-The Indian Wok,”
    “KAI SUSHI &amp; SAKE BAR,”
    “Kale Me Crazy,”
    “Kale Me Crazy #18,”
    “KANGAROO EXPRESS # 2720823,”
    “KANGAROO EXPRESS #2720816,”
    “KANGAROO EXPRESS #2720869,”
    “KANGAROO EXPRESS #2720914,”
    “KANGAROO EXPRESS #2723098,”
    “KANGAROO EXPRESS #2723118,”
    “KANGAROO EXPRESS #2723475,”
    “Kanki Japanese House Of Steaks,”
    “KANKI JAPANESE HOUSE OF STEAKS AND SUSHI,”
    “KAPLAN CATERING,”
    “KARDIA,”
    “Kashin Restaurant,”
    “KAT-N-AROUND (WCID #534),”
    “Kathmandu Kitchen,”
    “KEBAB SKEWER,”
    “Keim Center (Ravenscroft School),”
    “KFC #J120095,”
    “KFC #J120098,”
    “KFC #J120099,”
    “KFC/A&W #J120103,”
    “KFC/Long John Silvers # J120031,”
    “KFC/TACO BELL #118,”
    “KFC/Taco Bell #J120093,”
    “KFC/Taco Bell #J120102,”
    “KFC/Taco Bell #J120104,”
    “KFC/Taco Bell Of Zebulon,”
    “KICK BACK JACK`S,”
    “Kiko Japan Express,”
    “Kim's Restaurant,”
    “King Chef,”
    “KING CHINESE BUFFET,”
    “KING WOK,”
    “KINGS BARCADE &amp; NEPTUNE`S PARLOR,”
    “KINGS BOWL,”
    “KINGS WOK,”
    “Kingswood Elem. Sch. Cafeteria,”
    “KIWI CAFE AND SMOOTHIES,”
    “Knightdale Elem. Sch. Cafeteria,”
    “Knightdale Headstart Kitchen,”
    “KNIGHTDALE HIGH SCHOOL BASEBALL CONCESSIONS,”
    “Knightdale High School Cafeteria,”
    “KNIGHTDALE HIGH SCHOOL INDOOR CONCESSIONS,”
    “KNIGHTDALE HIGH SCHOOL OUTDOOR CONCESSIONS,”
    “Knights Play Golf Center,”
    “KOBE HIBACHI &amp; SUSHI,”
    “Koi Asian Grill and Sushi ,”
    “KONO PIZZA (WCID #320),”
    “Korner Cafe Food Court,”
    “Korner Pocket,”
    “KRAFTY'S BURGERS &amp; BREWS,”
    “Krispy Krunchy Chicken,”
    “KUMBALA BAR &amp; GRILL,”
    “KUMO SUSHI &amp; HIBACHI,”
    “KUNG FU TEA,”
    “Kwench Juice Cafe,”
    “LA BONITA DELI,”
    “LA BONITA MEAT MARKET,”
    “LA BRAZA RESTAURANT,”
    “LA CARRETA,”
    “La Casina De Mama Greta,”
    “La Cocina,”
    “LA COCINA #6,”
    “La Cucina Italiana,”
    “La Farm Bakery,”
    “LA MEXICANITA #2,”
    “La Quinta Inn & Suites Foodservice,”
    “La Quinta Inns #944 Foodservice,”
    “La Rancherita,”
    “La Rancherita,”
    “La Rancherita Mexican Restaurant,”
    “LA ROMA PIZZA,”
    “LA SANTA,”
    “LA TAPATIA BUTCHER SHOP & SNACK BAR,”
    “La Tapatia Tienda Mexicana,”
    “LA TAQUERIA,”
    “La Vaquita (WCID # 545),”
    “LACY ELEMENTARY CAFETERIA,”
    “Lady Justice Cafe,”
    “Ladyfingers Caterers,”
    “LaFarm Bakery &amp; Cafe W.F. West Cary,”
    “LAKE MYRA ELEMENTARY CAFETERIA,”
    “Lam`s Garden Restaurant,”
    “LAMM'S HOT DOG CART (WCID#441),”
    “Larry`s Supermarket -Meat Market,”
    “Las Carolinas Grocery &amp; Grill,”
    “Las Margaritas,”
    “Las Palmas III,”
    “Las Rositas,”
    “LAS TRES FRONTERAS SUPER MERCADO,”
    “Laurel Park Lunch Room,”
    “Lawndale Manor Assisted Living Kitchen,”
    “Layered Croissanterie,”
    “Leadmine Elementary Cafeteria,”
    “LeCount`s Catering,”
    “LEE'S KITCHEN (WCID #478),”
    “LEE'S KITCHEN #2,”
    “Lee's Kitchen #2 (WCID #712),”
    “Lee`s Kitchen,”
    “Leesville High School Cafeteria,”
    “Leesville Middle-Elem. Sch. Cafeteria,”
    “LEESVILLE RD HS OUTDOOR CONCESSIONS,”
    “LEESVILLE TAP ROOM,”
    “Legislative Bldg Cafeteria,”
    “Legislative Bldg Snack Bar,”
    “Legislative Office Bldg. Snack Bar,”
    “LELI'S DINER,”
    “Lemon Shark Poke,”
    “Lemongrass Thai Restaurant,”
    “Lenovo Bldg #2 Cafeteria,”
    “LENOVO BUILDING 7 CAFE,”
    “LENOVO BUILDING 8 CAFETERIA,”
    “LEVEL UP/VIRGIL'S TAQUERIA,”
    “Levity Raleigh,”
    “Life Cafe,”
    “LIFE CAFE,”
    “LIFE CAFE POOLSIDE,”
    “Lifetime Fitness Bistro (Outside),”
    “Ligon Middle School Cafeteria,”
    “Liles Country Cupboard,”
    “Lili's Kitchen (WCID #636),”
    “Lilly's Pizza,”
    “LIN`S GARDEN,”
    “Lincoln Heights Elementary School Cafeteria,”
    “Links Grille At Lochmere,”
    “Linus &amp; Pepper's,”
    “Lip Service,”
    “LIQUID STATE,”
    “Litchford Falls Healthcare Kitchen,”
    “LITTLE CAESAR'S #85,”
    “Little Caesars,”
    “LITTLE CAESARS,”
    “Little Caesars #12,”
    “Little Caesars #13,”
    “Little Caesars #15,”
    “Little Caesars #18,”
    “LITTLE CAESARS #1908-0013,”
    “LITTLE CAESARS #2,”
    “Little Caesars Express,”
    “Little Caesars Pizza #1522-0001,”
    “LITTLE TOKYO,”
    “LITTLE TOKYO,”
    “LITTLE TOKYO RESTAURANT,”
    “Living Fit NC,”
    “LIVING KITCHEN,”
    “Local Oyster Bar,”
    “LOCKED &amp; LOADED GRILL,”
    “Lockhart Elementary Cafeteria,”
    “Logan`s Roadhouse,”
    “Lola's Beach Bar,”
    “London Bridge Pub,”
    “Lone Star Steakhouse and Saloon,”
    “LONGHORN 5556,”
    “LongHorn Steakhouse #251,”
    “Longhorn Steakhouse #277,”
    “LONGLEAF CAFE,”
    “Lorraine's Kitchen (WCID #652),”
    “Los Cuates Mexican Food,”
    “Los Cuates Mexican Restaurant,”
    “Los Magueyes Fajita House,”
    “LOS POS,”
    “Los Tres Magueyes,”
    “LOS TRES MAGUEYES,”
    “Los Tres Magueyes,”
    “LOS TRES MAGUEYES,”
    “LOS TRES MAGUEYES,”
    “LOS TRES MAGUEYES,”
    “Los Tres Magueyes,”
    “Los Tres Magueyes # 4,”
    “LOS TRES MEXICAN RESTAURANT,”
    “Los Tres Vaqueros,”
    “LOVE BAO TAIWANESE KITCHEN,”
    “LOWE'S FOOD #239 MEAT &amp; SEAFOOD,”
    “Lowes Foods # 162 Meat, Seafood, and Sausages,”
    “LOWES FOODS #162 DELI,”
    “LOWES FOODS #162 PRODUCE,”
    “Lowes Foods #184 (Deli),”
    “Lowes Foods #184 Meat/Seafood,”
    “Lowes Foods #184 Produce,”
    “LOWES FOODS #185 DELI,”
    “LOWES FOODS #185 MEAT, SEAFOOD, SAUSAGE,”
    “Lowes Foods #185 Produce,”
    “Lowes Foods #187 Deli,”
    “Lowes Foods #187 Meat/Seafood,”
    “Lowes Foods #187 Produce,”
    “Lowes Foods #189 Deli ,”
    “Lowes Foods #189 Meat Market ,”
    “Lowes Foods #189 Produce ,”
    “Lowes Foods #189 Seafood ,”
    “Lowes Foods #190 Deli,”
    “Lowes Foods #190 Produce,”
    “LOWES FOODS #190 SEAFOOD, MEAT, &amp; SAUSAGE,”
    “LOWES FOODS #191 BEEF SHOP,”
    “Lowes Foods #191 Deli,”
    “Lowes Foods #191 Produce,”
    “Lowes Foods #207 Deli,”
    “Lowes Foods #207 Produce,”
    “Lowes Foods #207 Seafood,”
    “Lowes Foods #218 Deli ,”
    “Lowes Foods #218 Meat ,”
    “Lowes Foods #218 Produce ,”
    “Lowes Foods #224 Beef Shop,”
    “Lowes Foods #224 Deli,”
    “Lowes Foods #224 Produce,”
    “LOWES FOODS #226 BEEF SHOP,”
    “Lowes Foods #226 Deli,”
    “Lowes Foods #226 Produce,”
    “LOWES FOODS #239 DELI,”
    “LOWES FOODS #239 PRODUCE,”
    “LUCETTEGRACE,”
    “Luciano,”
    “Lucky 32,”
    “LUCKY 7,”
    “Lucky Chicken II,”
    “Lufkin Middle School Cafeteria,”
    “LUGANO RISTORANTE,”
    “LUNCH Y TAQUERIA LA HUASTECA (WCID # 611),”
    “Lunchbox Deli,”
    “Lynn Road Elem. Cafeteria,”
    “LYNNWOOD BREWING CONCERN,”
    “LYNNWOOD GRILL,”
    “Mac`s Tavern,”
    “MacGregor Draft House,”
    “Mack`s Mart,”
    “Magnolia Glen Senior Living,”
    “MAGNOLIA KITCHEN,”
    “MAIN STREET GRILLE,”
    “MAIN STREET GRILLE PIZZERIA &amp; RESTAURANT,”
    “Makus Empanadas @ MSFH,”
    “Mama Crow's,”
    “MAMI NORA`S CHICKEN,”
    “MAMMA  MIA ITALIAN BISTRO,”
    “Manchesters Bar and Grill,”
    “MANDARIN EXPRESS,”
    “Mandolin,”
    “MANHATTAN CAFE,”
    “Manhattan Cafe @ TKA,”
    “Manhattan Pizza,”
    “Manhattan Pizza,”
    “MAR-Y-SOL,”
    “MAR-Y-SOL II,”
    “MARCO POLLO,”
    “Marco's Pizza,”
    “MARCO'S PIZZA #8072,”
    “MARCO'S PIZZA #8188,”
    “MARCO'S PIZZA #8285,”
    “MARCO'S PIZZA #8400,”
    “Marco's Pizza #8486,”
    “Margauxs,”
    “MARIO DELI &amp; GRILL,”
    “Market Grill,”
    “Market Hall,”
    “Marriott Courtyard Crabtree Restaurant,”
    “MARTIN MIDDLE SCHOOL CAFETERIA,”
    “MASALA WRAP,”
    “Mason's Famous Lobster Rolls,”
    “Matsu Hibachi &amp; Sushi,”
    “MAUDE'S GARDEN AND COFFEE,”
    “MAX ORIENT,”
    “Max`s Pizza &amp; Grill,”
    “Maximillian`s Grille And Wine Bar,”
    “Mayflower Seafood Restaurant,”
    “MCALISTER'S DELI #100958,”
    “MCALISTERS DELI #100956,”
    “MCDONALD'S # 16326,”
    “MCDONALD'S #11646,”
    “MCDONALD'S #12293,”
    “MCDONALD'S #14590,”
    “McDonald's #16917,”
    “MCDONALD'S #25393,”
    “McDonald's #27549,”
    “McDonald's #28245,”
    “MCDONALD'S #32956,”
    “McDonald's #34347,”
    “MCDONALD'S #35756,”
    “McDonald's #5105,”
    “McDonald's #5651,”
    “McDonald's #7618,”
    “McDonald`s,”
    “McDonald`s # 13334,”
    “McDonald`s #10148,”
    “McDonald`s #14342,”
    “McDonald`s #14961,”
    “Mcdonald`s #17721,”
    “Mcdonald`s #18969,”
    “McDonald`s #26522,”
    “McDonald`s #31681,”
    “MCDONALD`S #7811,”
    “MCDONALDS #10267,”
    “MCDONALDS #1044,”
    “MCDONALDS #11523,”
    “MCDONALDS #12332,”
    “MCDONALDS #13159,”
    “MCDONALDS #13362,”
    “MCDONALDS #13824,”
    “MCDONALDS #15546,”
    “MCDONALDS #15717,”
    “MCDONALDS #18373,”
    “MCDONALDS #2510,”
    “MCDONALDS #27548,”
    “MCDONALDS #28653,”
    “MCDONALDS #29233 BRIER CREEK WALMART,”
    “MCDONALDS #30839,”
    “MCDONALDS #32242,”
    “MCDONALDS #32336,”
    “MCDONALDS #3259,”
    “MCDONALDS #32822,”
    “MCDONALDS #33287,”
    “MCDONALDS #33850,”
    “MCDONALDS #34433,”
    “MCDONALDS #3452,”
    “MCDONALDS #35357,”
    “MCDONALDS #4997,”
    “MCDONALDS #5028,”
    “MCDONALDS #7501,”
    “MCDONALDS AT CROSSROADS #13363,”
    “McKimmon Corner Cafe,”
    “MCLEAN`S HILLBILLIES,”
    “McLean`s Ole Time Cafe,”
    “MECCA MARKET,”
    “Mecca Restaurant,”
    “MEDALLION DINING SERVICE,”
    “Medi-Greek Grill (WCID #702),”
    “Mediterra,”
    “Meez Market &amp; Catering,”
    “MEGA PIZZA,”
    “MEI WEI ASIAN DINER,”
    “Mel's Many Mini's (WCID #642),”
    “Mellow Mushroom,”
    “MELLOW MUSHROOM,”
    “Mellow Mushroom,”
    “MELLOW MUSHROOM,”
    “Meredith College Dining Hall,”
    “METLIFE 1 JUICE BAR,”
    “METLIFE CARY CAFE,”
    “METRO DINER #3002,”
    “Mezquital Valley Catering @ TKA,”
    “MI CANCUN,”
    “MI CANCUN,”
    “Mi Cancun,”
    “Mi Rancho Antojitos (WCID #476),”
    “MI RANCHO MEXICAN RESTAURANT,”
    “MIA FRANCESCA,”
    “Michael's English Muffins,”
    “Michelangelos,”
    “MICHELANGELOS PIZZA,”
    “Middle Creek Elem. Sch. Cafeteria,”
    “Middle Creek High School Cafeteria,”
    “Middle Creek Park,”
    “Middle Spoon Catering @TKA,”
    “Midtown Grille,”
    “MIKE'S ITALIAN KITCHEN,”
    “MIKE'S PIZZA &amp; ITALIAN RESTAURANT,”
    “MILANO PIZZA,”
    “Milano`s Pizza,”
    “Millbrook Elem. Sch. Cafeteria,”
    “Millbrook Sr. High Cafeteria,”
    “Mills Park Elementary Cafeteria,”
    “MILLS PARK MIDDLE SCHOOL CAFETERIA,”
    “Milton`s Pizza &amp; Pasta,”
    “Milton`s Pizza House,”
    “Mitch`s Tavern,”
    “Mitchells Catering,”
    “Mithai House of Indian Desserts,”
    “Mizu Sushi Steak Seafood,”
    “MKG Kitchen @ MSFH,”
    “Mo Fu Shoppe,”
    “MOD Pizza #576,”
    “MOD PIZZA #7006,”
    “MOD PIZZA MILLBROOK,”
    “Mod Pizza Waverly,”
    “MOE'S #100810,”
    “Moe's Southwest Grill,”
    “Moe's Southwest Grill,”
    “MOE'S SOUTHWEST GRILL #100789,”
    “Moe's Southwest Grill #150,”
    “Moe's Southwest Grill #205,”
    “MOE'S SOUTHWEST GRILL #838,”
    “Moe`s Southwest Grill,”
    “Moe`s Southwest Grill,”
    “Moe`s Southwest Grill,”
    “Moe`s Southwest Grill,”
    “Moe`s Southwest Grill ,”
    “MOE`S SOUTHWEST GRILL #283,”
    “Moe`s Southwest Grill #683,”
    “Moe`s Southwest Grill #837,”
    “MOJO'S GRILL,”
    “MOJO'S GRILL WAKE TECH,”
    “Mojoe's Burger Joint,”
    “Momma's Soul Food (WCID #693),”
    “MONA PITA MEDITERRANEAN CAFE &amp; GRILL,”
    “MONA PITA MEDITERRANEAN GRILL,”
    “MoonRunners Saloon,”
    “MOONRUNNERS SALOON (WCID #577),”
    “Moore Square Magnet Middle School,”
    “MORNINGSIDE ASSISTED LIVING KITCHEN,”
    “Morrisville Elementary Cafeteria,”
    “Morrisville Meals On Wheels,”
    “Motor Grilly (WCID #698),”
    “Mr Dumpling,”
    “MR. PUEBLA TACOS (WCID #603),”
    “MT. VERNON SCHOOL CAFETERIA,”
    “Mudcats Pantry,”
    “Mudcats Pushcart,”
    “Mudcats Stand #1 And Main Commissary,”
    “Mudcats Stand #2,”
    “Mudcats Stand #3,”
    “Mudcats Stand #4,”
    “Mudcats Stand #6,”
    “Mulino,”
    “MUM'S JAMAICAN RESTAURANT,”
    “Mura At North Hills,”
    “MURPHY DINING HALL,”
    “Murphy House Restaurant-Dorton Arena,”
    “Murphy House Restaurant-Kerr Scott Building,”
    “Murphy House-Graham Building,”
    “Muscle Maker Grill,”
    “MY PLACE,”
    “My Spice Bowls @TKA,”
    “MY WAY TAVERN,”
    “MY WAY TAVERN,”
    “Myrtle Underwood Elem.Sch.Cafeteria,”
    “N. C. BAGEL CAFE &amp; DELI,”
    “N.Y. Bagels & Deli,”
    “N.Y.Pizza,”
    “Nakato Express,”
    “Namolis NY Pizzeria,”
    “Nancy's Pizzeria,”
    “NANTUCKET GRILL,”
    “NATIONWIDE CAFETERIA/4401 BISTRO,”
    “NAZARA INDIAN BISTRO,”
    “NC Farm Bureau Cafeteria,”
    “NC JAPAN EXPRESS,”
    “NC Seafood Restaurant,”
    “NCSU PROCESSED MEAT LAB,”
    “NE MEZZANINE CONCESSIONS REYNOLDS,”
    “Neo-Asia,”
    “Neomonde Bakery & Deli,”
    “Neomonde Mediterranean,”
    “NET APP CAFE BLDG3,”
    “NEUSE CHRISTIAN ACADEMY,”
    “NEUSE RIVER BREWING COMPANY,”
    “New Asian Garden,”
    “NEW CHINA,”
    “NEW CHINA CHEF,”
    “NEW CHINA EXPRESS,”
    “NEW CHINA KING RESTAURANT,”
    “New Japan Express,”
    “New Panda Chinese Restaurant,”
    “NEW RAINBOW CHINESE RESTAURANT,”
    “NEW RAINBOW GARDEN,”
    “New Super Grocery &amp; Fresh Halal Meat,”
    “New Wangs Kitchen,”
    “NEW WHITE OAK GRILL &amp; LOUNGE,”
    “New World Cafe,”
    “NEW YORK DINER,”
    “New York Style Hot Dogs (WCID #621),”
    “New York Style Hot Dogs # 2 (WCID #173),”
    “NI ASIAN KITCHEN,”
    “NICE BOWLS ASIAN CUISINE,”
    “NICHE WINE LOUNGE,”
    “NIGHT KITCHEN BAKERY,”
    “Nil's Cafe,”
    “NILE CAFE,”
    “NINA'S RISTORANTE,”
    “No Fo At The Pig,”
    “NO. 1 CHINESE RESTAURANT,”
    “NO. 1 PHO,”
    “NOODLE BLVD.,”
    “NOODLES &amp; COMPANY,”
    “NOODLES &amp; COMPANY #858            ,”
    “NOODLES &amp; COMPANY #866,”
    “NOODLES 865,”
    “NOODLES AND COMPANY #857,”
    “North Forest Pines Elem. Caf.,”
    “North Garner Middle Sch. Caf.,”
    “North Raleigh Christian Academy School Lunchroom,”
    “North Raleigh Courtyard By Marriott,”
    “NORTH RIDGE PUB,”
    “NORTH WAKE COLLEGE &amp; CAREER ACADEMY-CAFETERIA,”
    “NORTHSIDE FISH MARKET,”
    “Northwoods Elementary Cafeteria,”
    “Notorious Dog (WCID #700),”
    “NUR DELI &amp; GROCERY,”
    “NW MEZZANINE CONCESSIONS REYNOLDS,”
    “NY Bagel,”
    “NY Bagel Deli &amp; Cafe,”
    “NY Pizza,”
    “NY Pizza,”
    “NYBD III,”
    “NYC Bagels,”
    “O-Ku,”
    “O`Charleys,”
    “O`Malley`s Tavern,”
    “OAK CITY BREWING COMPANY,”
    “Oak City Fish and Chips,”
    “Oak City Fish and Chips @ MSFH,”
    “Oak City Fish and Chips #1 (WCID #697),”
    “OAK CITY MARKET,”
    “OAK CITY PIZZA,”
    “Oak Grove Elem. Sch Cafeteria,”
    “Oak Steakhouse,”
    “OAK VIEW ELEMENTARY SCHOOL CAFETERIA,”
    “Oaklyn Springs Brewery,”
    “OAKWOOD PIZZA BOX,”
    “OFF THE HOOK SEAFOOD RESTAURANT,”
    “Oink N Moo (WCID #688),”
    “OISHI,”
    “OISO SUSHI &amp; KOREAN,”
    “Ole Time Barbecue,”
    “Ole Time Barbecue #1 (WCID #048),”
    “Olive Chapel Elementary Cafeteria,”
    “Olive Garden,”
    “Olive Garden,”
    “OLIVE GARDEN #1831,”
    “OLIVE GARDEN #4441,”
    “OLIVE TREE MARKET ,”
    “Oliver House Foodservice,”
    “Olivios Pizza,”
    “Olsen's Craft Wieners,”
    “ON THE BORDER,”
    “ONCE IN A BLUE MOON BAKERY AND CAFE,”
    “ONE EARTH,”
    “One Stop Market,”
    “One Stop Shop,”
    “ORACLE CAFE,”
    “ORCHID JAPANESE RESTAURANT,”
    “ORIENT GARDEN RESTAURANT,”
    “Oriental Pho,”
    “ORO RESTAURANT &amp; LOUNGE,”
    “Osha Thai Kitchen and Sushi,”
    “Osteria G,”
    “Outback #3443,”
    “OUTBACK STEAKHOUSE #3440,”
    “OUTBACK STEAKHOUSE #3459,”
    “OUTBACK STEAKHOUSE #3467,”
    “Outdoor Recreational Center,”
    “OVER THE FALLS,”
    “Overlook Cafe,”
    “Overtime Sports Pub,”
    “Paco's Tacos Catering &amp; Breakfast Wagon (WCID #703),”
    “Pam's Farmhouse Restaurant,”
    “Panchos Tacos Y Tortas (WCID #718),”
    “Panda Express #1352,”
    “Panda Express #2962,”
    “PANDA GARDEN,”
    “PANDA GARDEN,”
    “Panda House Chinese Restaurant,”
    “Panda King,”
    “PANDA WOK,”
    “PANERA #1806,”
    “PANERA #1813,”
    “PANERA BREAD #1641,”
    “Panera Bread #1642,”
    “Panera Bread #1643,”
    “PANERA BREAD #1644,”
    “PANERA BREAD #1648,”
    “PANERA BREAD #1649,”
    “PANERA BREAD #1650,”
    “PANERA BREAD #1656,”
    “PANERA BREAD #1869,”
    “PANERA BREAD #1938,”
    “Panera Bread #601879,”
    “Panera Bread #6039,”
    “Panera Bread #6073,”
    “PANOPOLIS,”
    “Panther Creek High Sch. Cafeteria ,”
    “Paolo's,”
    “PAPA JOHN'S,”
    “PAPA JOHN'S ,”
    “Papa John's #429,”
    “Papa John's #4838,”
    “Papa John's #4960,”
    “Papa John's Pizza #1406,”
    “Papa John`s,”
    “Papa John`s,”
    “Papa John`s,”
    “Papa John`s,”
    “Papa John`s #1576,”
    “Papa John`s #1579,”
    “PAPA JOHN`S #2838,”
    “Papa John`s #619,”
    “Papa John`s Pizza,”
    “Papa John`s Pizza,”
    “Papa John`s Pizza #1734,”
    “Papa Johns,”
    “Papa Murphy's (WCID #690),”
    “PAPA MURPHY'S #NC055,”
    “PAPA MURPHY'S NC #001,”
    “PAPA MURPHY'S NC#004,”
    “PAPA MURPHY'S NC002,”
    “PAPA MURPHY'S NC035,”
    “PAPA MURPHY'S NC046,”
    “PAPA MURPHY'S NC049,”
    “PAPA MURPHY'S NC050,”
    “PAPA MURPHY'S NCO33,”
    “PAPA SHOGUN,”
    “PAPA'S PIZZA &amp; WINGS,”
    “Papa`s Subs and Pizza,”
    “PAPAS PIZZA AND SUBS,”
    “PAPAYA CHICKEN &amp; GRILL,”
    “PARADISE INDIA CUISINE,”
    “PARK BAR &amp; GRILL (DoubleTree By Hilton),”
    “PARK WEST 14 CINEMAS,”
    “Parkside,”
    “Parkside Elementary School Cafeteria,”
    “Party in a Pita (WCID #641),”
    “PASTA DI PIZZA,”
    “Pastries N Chaat,”
    “Pat Murnane's Irish Pub,”
    “Patio Dogs (WCID #643),”
    “PATTI`S CAFE,”
    “Pauls Cash Grocery &amp;Services,”
    “Pauls Cash Grocery Meat Market,”
    “PAVE SE Raleigh Charter School Cafeteria,”
    “Pavillion Talley Student Union,”
    “PDQ #506,”
    “PDQ SEARSTONE ,”
    “PDQ WAKE FOREST,”
    “Peace China,”
    “PEACE CHINA,”
    “Peak of the Vine,”
    “PEARL CHINESE RESTAURANT,”
    “PEDALER WINE AND BEER,”
    “Pei Wei Asian Diner,”
    “Pei Wei Asian Diner #0116,”
    “Pei Wei Asian Diner #108,”
    “PEI WEI ASIAN DINER #282,”
    “Peking Duck and Dumplings,”
    “PENG'S ASIAN CUISINE,”
    “PENN STATION #251,”
    “PENN STATION #260,”
    “PENN STATION #320,”
    “Penn Station #345,”
    “Penn Station East Coast Subs,”
    “Penny Road Elementary Cafeteria,”
    “PEPPERS MARKET,”
    “PERI BROTHERS PIZZA,”
    “PERIMETER PARK CAFE,”
    “PERSIS INDIAN GRILL,”
    “PETRA  GRILL,”
    “PETRA SUPERMARKET,”
    “Pf Changs Restaurant,”
    “Pharaoh`s,”
    “PHARMACY BOTTLE &amp; BEVERAGE,”
    “Philly Steak And Subs,”
    “PHILLY'S CHEESESTEAKS (WCID #438),”
    “PHO 919 VIETNAMESE CUISINE,”
    “Pho Oxtail,”
    “PHO PHO PHO NOODLE KITCHEN &amp; BAR,”
    “Pho Super 9,”
    “Pho Sure,”
    “PHO VIETNAM,”
    “PHO XO,”
    “PHO XPRESS,”
    “Pho2 Far East,”
    “Phoenix Assisted Care LLC Kitchen,”
    “Piccola Italia,”
    “Pieology #8904,”
    “PIEZANO PIZZA,”
    “Pine Acres Meals On Wheels,”
    “Pine Hollow Golf Club Food Service,”
    “PINE HOLLOW MIDDLE SCHOOL CAFETERIA,”
    “Pinhead Investments #1 (WCID #125),”
    “Pinhead Investments #2  (WCID #127),”
    “Pinhead Investments #3 (WCID #213),”
    “PINOT'S PALETTE,”
    “PIOLA,”
    “PISCO MAR,”
    “Pista House,”
    “PIZZA AMORE,”
    “Pizza Amore,”
    “PIZZA EXPRESS ,”
    “PIZZA HUT,”
    “Pizza Hut,”
    “Pizza Hut,”
    “Pizza Hut,”
    “Pizza Hut # 1101,”
    “Pizza Hut #1303,”
    “PIZZA HUT #8663,”
    “PIZZA HUT #9106,”
    “Pizza Hut #9107,”
    “Pizza Hut #9203,”
    “PIZZA HUT #9206,”
    “PIZZA HUT #9207,”
    “PIZZA HUT #9210,”
    “PIZZA HUT #9212,”
    “Pizza Hut #9214,”
    “PIZZA HUT #9215,”
    “Pizza Hut Delivery #9208,”
    “Pizza Hut Of Wake Forest,”
    “Pizza La Stella,”
    “Pizza La Stella,”
    “PIZZA PIT,”
    “PIZZA SHACK,”
    “PIZZERIA FAULISI,”
    “PIZZERIA VERITAS,”
    “PLATES,”
    “Players Retreat,”
    “PLAZA CAFE,”
    “PLAZA DEL MARIACHI,”
    “PLEASANT GROVE CHURCH ROAD ELEMENTARY CAFETERIA,”
    “Pleasant Union Elem.School Cafet.,”
    “PNC 103-105,”
    “PNC 104 PUSHCART (WCID #119),”
    “PNC 109,”
    “PNC 112 (Mexican),”
    “PNC 114 &amp; MAKUS,”
    “PNC 118-120,”
    “PNC 120 PUSHCART (WCID #117),”
    “PNC 123,”
    “PNC 130,”
    “PNC 301,”
    “PNC 306 PUSHCART (WCID #165),”
    “PNC 310,”
    “PNC 318,”
    “PNC 329,”
    “PNC Arena Deck (Lunch Counter),”
    “PNC Arena Main Kitchen,”
    “PNC CLUB 204-A,”
    “PNC CLUB 204-B (PIZZA SIDE),”
    “PNC CLUB 220-A (GRILL SIDE),”
    “PNC CLUB 220-B,”
    “PNC CLUB KITCHEN,”
    “PNC SUITES KITCHEN,”
    “Poblano's Tacos &amp; More (WCID #660),”
    “POBLANOS TACOS (WCID #543),”
    “POD Cafe @ TKA,”
    “POE ELEMENTARY CAFETERIA,”
    “Points West Cafe at Wake Med Cary,”
    “POKE BAR,”
    “Poke Bros,”
    “Poke Burri Raleigh,”
    “Poke'Go,”
    “POLAR ICE HOUSE,”
    “Poole`s Diner,”
    “POOR BOY GENERAL STORE AND GRILL,”
    “POPEYE'S #12880,”
    “Popeye's RDU JV,”
    “POPEYES #11025,”
    “POPEYES #11378,”
    “POPEYES #12346,”
    “Popeyes #12729,”
    “Poppy Seed Market,”
    “PORT CITY JAVA EB2,”
    “PORT CITY JAVA PARK SHOPS,”
    “PORT CITY JAVA TALLEY,”
    “PORT CITY JAVA TEXTILES,”
    “PORT CITY JAVA VET SCHOOL,”
    “POSH NOSH CATERING,”
    “POTBELLY SANDWICH SHOP,”
    “Powell Center For Play &amp; Ingenuity Magnet Elementary,”
    “POWER UP CAFE,”
    “PREMIER CAKES COMMISSARY AND CATERING,”
    “Pressed Sandwich House,”
    “Pretzelmaker,”
    “PRIMO PIZZA NY STYLE,”
    “PRO'S EPICUREAN MARKET &amp; CAFE,”
    “Pruitt Health - Raleigh Dining,”
    “PTA Of Wake Forest,”
    “Pub 4100,”
    “Publilx 1551 Seafood,”
    “PUBLIX #1466 DELI,”
    “PUBLIX #1466 MEAT,”
    “PUBLIX #1466 PRODUCE,”
    “PUBLIX #1466 SEAFOOD,”
    “PUBLIX #1514 DELI,”
    “PUBLIX #1514 MEATS,”
    “PUBLIX #1514 PRODUCE,”
    “PUBLIX #1514 SEAFOOD,”
    “PUBLIX #1520 DELI,”
    “PUBLIX #1520 MEAT/SEAFOOD,”
    “PUBLIX #1520 PRODUCE,”
    “PUBLIX #1544 DELI,”
    “PUBLIX #1544 MEATS,”
    “PUBLIX #1544 PRODUCE,”
    “PUBLIX #1544 SEAFOOD,”
    “Publix 1551 Deli,”
    “Publix 1551 Meat,”
    “Publix 1551 Produce,”
    “Publix 1552 Deli,”
    “Publix 1552 Meat,”
    “Publix 1552 Produce,”
    “Publix 1552 Seafood,”
    “PULLEN PLACE CAFE &amp; CATERING,”
    “Pupusas Y Tacos Marina (WCID #172),”
    “Pupuseria El Salvador (WCID #403),”
    “Pure Juicery Bar,”
    “Q CAFE,”
    “QDOBA MEXICAN GRILL #203,”
    “QDOBA MEXICAN GRILL #215,”
    “QDOBA MEXICAN GRILL #60,”
    “QDOBA MEXICAN GRILL #612,”
    “Quality Inn #NC436 Breakfast Bar,”
    “QUALITY INN FOOD SERVICE,”
    “Quality Mart #31,”
    “QUE HUONG ORIENTAL MARKET,”
    “QUICKLY,”
    “Quiznos Sub # 91,”
    “R.J.`S PLACE,”
    “RAGAZZI'S,”
    “RAINBOW KING,”
    “RAJBHOG CAFE,”
    “RALEIGH BEER GARDEN,”
    “RALEIGH BREWING COMPANY,”
    “Raleigh Christian Academy Indoor Concessions,”
    “RALEIGH CONVENTION CENTER,”
    “Raleigh Crab House,”
    “RALEIGH CRABTREE MARRIOTT FOODSERVICE,”
    “Raleigh Meat Market,”
    “RALEIGH NURSERY SCHOOL,”
    “RALEIGH RAW,”
    “RALEIGH REHABILITATION CENTER KITCHEN,”
    “RALEIGH STEAK ESCAPE,”
    “Raleigh Times Bar,”
    “Raleighwood Cinema & Grill,”
    “RALLYPOINT SPORT GRILL,”
    “RALPH E. CAPPS TEEN CENTER GRILL,”
    “Rand Road Elem School Cafeteria,”
    “RANDY'S PIZZA,”
    “Randy`s Pizza,”
    “RARE EARTH FARMS (WCID #512),”
    “Ravenscroft School Dining,”
    “REAL FOOD CENTRAL,”
    “Real McCoy,”
    “RED BOWL ASIAN BISTRO,”
    “Red Bowl Asian Bistro,”
    “RED DRAGON CHINESE RESTAURANT,”
    “Red Hot &amp; Blue,”
    “RED HOT &amp; BLUE (WCID #474),”
    “Red Lobster,”
    “Red Lobster #0598,”
    “Red Monkey Latin Fusion,”
    “RED PEPPER ASIAN,”
    “Red Robin #306,”
    “Red Robin #567,”
    “Red Robin #571,”
    “Red Robin #573,”
    “RED ROBIN #688,”
    “Redplate Catering @TKA,”
    “Reedy Creek Elem. Cafeteria,”
    “Reedy Creek Middle Sch. Cafeteria,”
    “Relish Craft Kitchen/The Kitchen Table,”
    “Remington Grill,”
    “RESCO MINI MART,”
    “Residence Inn by Marriott Foodservice,”
    “RESIDENCE INN DOWNTOWN RALEIGH,”
    “Residence Inn Foodservice,”
    “Residence Inn Foodservice,”
    “Residence Inn-Crabtree Foodservice,”
    “RESIDENCE INN/MARRIOTT COURTYARD FOOD SERVICE,”
    “Revenue Bldg. Cafeteria,”
    “Rex Hospital Cafeteria,”
    “Rex Nursing Care Of Apex Food Service,”
    “Rex Rehabilitation And Nursing Care Center Cafe,”
    “Rey`s,”
    “RICCI'S TRATTORIA,”
    “Richland Creek Elementary School Cafeteria,”
    “Riddle Raleigh,”
    “RIDGEWOOD WINE &amp; BEER CO.,”
    “RISE BISCUITS &amp; DONUTS,”
    “RISE BISCUITS &amp; DONUTS,”
    “RISE BISCUITS &amp; DONUTS,”
    “RISE BISCUITS &amp; DONUTS,”
    “RISE CAMERON VILLAGE,”
    “RIVER BEND ELEMENTARY CAFETERIA,”
    “RIVER BEND MIDDLE SCHOOL CAFETERIA,”
    “RIVER PUB,”
    “River Ridge Golf Club,”
    “ROADRUNNERS PIZZA,”
    “Roast Grill,”
    “Rockin Roll Sushi Express,”
    “Rocky Top Catering,”
    “Rodeway Inn (Breakfast Area),”
    “ROGERS LANE ELEMENTARY SCHOOL,”
    “Rolesville Diner,”
    “ROLESVILLE ELEMENTARY SCHOOL CAFETERIA,”
    “ROLESVILLE HIGH SCHOOL CAFETERIA,”
    “ROLESVILLE MIDDLE SCHOOL CAFE,”
    “ROLL DOGS EXPRESS (WCID #393),”
    “ROLL DOGS EXPRESS #2 (WCID #552),”
    “ROLY POLY,”
    “Roma`s Italian,”
    “ROMANOS MACARONI GRILL,”
    “Romas Pizzeria,”
    “Romeo's Pizza,”
    “ROOT ELEMENTARY CAFETERIA,”
    “ROSALINI'S PIZZA &amp; SUBS,”
    “ROSATI'S PIZZA MORRISVILLE,”
    “Rosewood Bitters (WCID #678),”
    “Royal India Restaurant,”
    “ROYALE,”
    “RTP SABZI MANDI MEAT MARKET,”
    “RUBY TUESDAY,”
    “Ruby Tuesday`s,”
    “Ruby Tuesday`s #3182,”
    “Ruby Tuesday`s #5122,”
    “Ruckus Pizza,”
    “RUCKUS PIZZA PASTA &amp; SPIRITS #3,”
    “Ruckus Pizza, Pasta &amp; Spirits,”
    “RUCKUS PIZZA, PASTA &amp; SPIRITS APEX,”
    “RUDINO'S PIZZA &amp; GRINDERS HERITAGE,”
    “Rudino`s Parkside,”
    “Rudino`s Pizza & Grinders,”
    “Rudino`s Pizza &amp; Grinders,”
    “RUDINO`S PIZZA &amp; GRINDERS SPORTS CORNER,”
    “RUDY'S PUB &amp; GRILL,”
    “Rush Bowl Raleigh,”
    “Ruth's Chris Steakhouse,”
    “RUTH`S CHRIS,”
    “RYE BAR &amp; SOUTHERN KITCHEN,”
    “S &amp; E Catering,”
    “S &amp; S HALAL MEAT,”
    “S &amp; S Halal Pizza &amp; BBQ,”
    “Sadie's Fresh Cut Fries (WCID #708),”
    “Saffron,”
    “Sage Cafe,”
    “SAI KRISHNA BHAVAN,”
    “Saigon Pho Vietnamese Cuisine,”
    “SAINT JACQUES FRENCH CUISINE,”
    “Saint Mary`s School Dining ,”
    “SAINTS AND SCHOLARS IRISH PUB,”
    “Sake House Japanese Restaurant,”
    “SAKURA 8,”
    “Salem Elementary Sch. Cafeteria,”
    “Salem Middle School Cafeteria,”
    “SALEM STREET PUB,”
    “SALSA AZTECA,”
    “Salsa Fresh #3,”
    “Salsa Fresh Mexican Grill,”
    “Salsa Fresh Restaurant,”
    “SALT&amp; LIME CABO GRILL,”
    “SALTWATER SEAFOOD, LLC,”
    “SALVIO'S PIZZERIA,”
    “Salvio`s Pizzeria,”
    “SAM'S CLUB #6976 DELI,”
    “SAM'S CLUB #6976 MEAT MARKET,”
    “SAM'S CLUB #6976 ROTISSERIE,”
    “Sam's Club #8223 Deli/Rotiserrie,”
    “Sam`s Club #6570 Deli,”
    “Sam`s Club #6570 Meat Market,”
    “SAM`S CLUB #6570 SNACKBAR,”
    “Sam`s Club #8223 Cafe,”
    “Sam`s Club #8223 Meat Market,”
    “SAMI'S SUBS, PIZZA &amp; MORE,”
    “SAMMY'S TAP &amp; GRILL,”
    “SAMS' CLUB #6976 CAFE,”
    “SAN JOSE MEX &amp; TEQUILA BAR,”
    “SAN JOSE MEXICAN RESTAURANT,”
    “SAN JOSE MEXICAN RESTAURANT,”
    “SAN JOSE TACOS AND TEQUILA,”
    “SAN JUAN MEXICAN RESTAURANT ,”
    “San Marcos,”
    “SAN MARCOS,”
    “SANDELLA'S,”
    “Sanderson Athletic Indoor Concession,”
    “Sanderson Athletic Outdoor Concessions,”
    “Sanderson High Sch. Cafeteria,”
    “Sandy Plain Mini Mart Grill,”
    “Sanford Creek Elem. Cafeteria,”
    “SANGAM CAFE,”
    “SANGAM HALAL MARKET,”
    “SARKU JAPAN,”
    “SAS BUILDING C CAFE,”
    “SASSOOL,”
    “SASSOOL,”
    “Sassool Select @ MSFH,”
    “Sawmill Tap Room,”
    “Sbarro #1097,”
    “Sbarro Restaurant,”
    “Scaleboyx Fish &amp; Chips &amp; More (WCID #709),”
    “SCHIANO'S PIZZA PASTA WINGS,”
    “Schiano`s Pizza Pasta & Grill #2,”
    “SCHLOTZSKY'S,”
    “Scooters Grill And Bar,”
    “Scoozi Pizza &amp; Grill,”
    “SCOTTS RIDGE ELEMENTARY CAFETERIA,”
    “Scratch Kitchen and Taproom,”
    “SE Raleigh Elementary Cafeteria,”
    “Sea Depot Seafood Market,”
    “Seaboard Cafe,”
    “Seagate Seafood &amp; Sushi,”
    “SEASONS 52 #4547,”
    “Second Empire at Dodd-Hinsdale,”
    “Seoul 116,”
    “Seoul Garden Restaurant,”
    “SEQIRUS CAFE,”
    “Serendipity Gourmet Deli,”
    “SERGIO'S PIZZA,”
    “SERGIO'S PIZZA,”
    “Seven Oaks Swim Club Concession Stand,”
    “Shaba Shabu,”
    “SHAKEY RAY'S,”
    “SHANE`S RIB SHACK #55,”
    “SHANGHAI EXPRESS,”
    “Shaw University Cafeteria,”
    “Shearon Harris Cafe,”
    “Sheetz,”
    “Sheetz,”
    “Sheetz #361,”
    “Sheetz #371,”
    “Sheetz #399,”
    “SHEETZ #416,”
    “SHEETZ #480,”
    “SHEETZ #481,”
    “SHEETZ #505,”
    “SHEETZ #507,”
    “SHEETZ #513,”
    “SHEETZ #525,”
    “SHEETZ #536,”
    “SHEETZ #537,”
    “SHEETZ #540,”
    “SHEETZ #598,”
    “SHEETZ #600,”
    “SHEETZ #607,”
    “SHEETZ #620,”
    “SHEETZ #634,”
    “Sheetz #659,”
    “Sheetz #664,”
    “SHEETZ 555,”
    “SHERATON RALEIGH KITCHEN/JIMMY V'S OSTERIA &amp; BAR,”
    “Shiro Japanese Grill,”
    “SHISH KABOB,”
    “SHISH KABOB CITY PLAZA,”
    “SHISH KABOB SIX FORKS STATION,”
    “Shortys,”
    “Showmars - Wake Forest,”
    “SHUCKERS OYSTER BAR & GRILL,”
    “SHUCKIN SHACK CARY,”
    “Shuckin' Shack,”
    “Shuckin' Shack,”
    “SHUTTLE INN C-STORE,”
    “Side Street Restaurant,”
    “Siemens Cafeteria,”
    “Simple Greek,”
    “SIMPLY CREPES CAFE &amp; CATERING,”
    “Sinbad Pizza,”
    “Singas Famous Pizza,”
    “Sino Wok,”
    “SIR WALTER COFFEE,”
    “SITTI BY NEOMONDE,”
    “Skipper`s Fish Fry and Market,”
    “Skrimp Shack #21,”
    “SKY ZONE,”
    “SKYE TOWER,”
    “Skylight Cafe,”
    “SLEEP INN FOODSERVICE,”
    “SLICE OF N. Y. PIZZA,”
    “Slices and Ices,”
    “SMASHBURGER,”
    “Smashed Waffles,”
    “Smith Elementary Cafeteria,”
    “Smithfield Chicken &amp; Bar-B-Que,”
    “Smithfield Chicken &amp; Bar-B-Que,”
    “SMITHFIELD'S CHICKEN N BAR-B-Q,”
    “SMITHFIELD'S CHICKEN N BAR-B-QUE,”
    “SMITHFIELD'S CHICKEN N BAR-B-QUE,”
    “SMITHFIELD'S CHICKEN'N BAR-B-Q,”
    “SMITHFIELD'S CHICKEN'N BAR-B-Q,”
    “Smokey`s Shack,”
    “SMOOTHIE KING #1358,”
    “SMOOTHIE KING #1376,”
    “Smoothie King #1662,”
    “SMOOTHIE U,”
    “SNACK SHOP,”
    “Snoopy's # 1,”
    “Snoopy`s #3,”
    “SNOOPY`S HOT DOG AND MORE,”
    “Snoopy`s Hot Dogs & More # 4,”
    “SOCA COCINA LATINA,”
    “SoHot,”
    “SOLA COFFEE &amp; CAFE,”
    “SOMMELIER'S ROAST,”
    “SONIC #5864,”
    “SONIC DRIVE IN #4809,”
    “SONIC DRIVE IN #5639,”
    “SONIC DRIVE IN #5735,”
    “SONIC DRIVE IN #6020,”
    “Sonic Drive-In #3975,”
    “SONIC DRIVE-IN #4349,”
    “SONO SUSHI BAR,”
    “Sophie's Grill and Bar,”
    “SOPRANO'S GRILL,”
    “Sosta Cafe,”
    “SOUTH GARNER HIGH SCHOOL CAFETERIA,”
    “South Garner High School Indoor Concessions,”
    “SOUTH GARNER PARK CONCESSION,”
    “Southeast Raleigh H.S.Cafeteria,”
    “Southeastern Freewill Bapt.College Cafet,”
    “Southern Charred,”
    “SOUTHERN CRAFT BUTCHERS,”
    “SOUTHERN FOODSERVICE TIME WARNER,”
    “SOUTHERN HARVEST AT THE MATTHEWS HOUSE,”
    “Southern Pasta Company @ TKA,”
    “SOUTHERN PEAK BREWERY,”
    “Southland Steakhouse,”
    “Spanglish (WCID #644),”
    “Specialty South Commissary,”
    “Specialty South DBA Wicked Links (WCID #225),”
    “Speedway #6959,”
    “Speedway #6961,”
    “SPEEDWAY #6962,”
    “Speedway #6975,”
    “Speedway #6982,”
    “Speedway #6983,”
    “SPEEDWAY #6984,”
    “Speedway #6986,”
    “SPEEDWAY #6989,”
    “SPEEDWAY #8291,”
    “SPEEDY BURRITOS,”
    “SPINNERS BAR &amp; GRILL AT FOUR POINTS,”
    “SPIRITS PUB &amp; GRUB,”
    “Spring Arbor Of Apex Foodservice,”
    “SPRING ARBOR OF CARY FOOD SERVICE,”
    “Spring Arbor Of East Raleigh Kitchen,”
    “SPRING CAFE,”
    “Spring Hill Suites Kitchen,”
    “SPRING KITCHEN,”
    “SPRING ROLLS,”
    “Springmoor Dietary Dept.,”
    “SPROUTS #540 DELI,”
    “SPROUTS #540 MEAT MARKET,”
    “SPROUTS #540 PRODUCE,”
    “Square Burgers,”
    “St Mary Magdalene School Cafeteria,”
    “St. Augustine's University Cafeteria,”
    “ST. DAVID'S DINING HALL,”
    “St. Michael the Arch Angel Catholic Church,”
    “St. Raphael Hall Foodservice,”
    “ST. ROCH,”
    “Stagecoach Grill (WCID #649),”
    “STAMMTISCH CAFE,”
    “STANBURY,”
    “Starbuck's Target #961,”
    “Starbucks,”
    “Starbucks,”
    “Starbucks,”
    “Starbucks,”
    “STARBUCKS # 26652,”
    “Starbucks # 9465,”
    “Starbucks #10158,”
    “Starbucks #11189,”
    “STARBUCKS #16019,”
    “STARBUCKS #19453,”
    “STARBUCKS #21218,”
    “STARBUCKS #23309,”
    “STARBUCKS #25115,”
    “STARBUCKS #29148,”
    “STARBUCKS #29679,”
    “Starbucks #2970,”
    “Starbucks #49535,”
    “Starbucks #53826,”
    “STARBUCKS #75937,”
    “STARBUCKS #8214,”
    “Starbucks #8218,”
    “Starbucks #8270,”
    “Starbucks #8459,”
    “Starbucks #8495,”
    “STARBUCKS #8589,”
    “Starbucks #9840,”
    “STARBUCKS AT HARRIS TEETER #319,”
    “Starbucks Coffee,”
    “Starbucks Coffee,”
    “Starbucks Coffee # 10967,”
    “Starbucks Coffee #08373,”
    “Starbucks Coffee #9364,”
    “Starbucks Coffee #9657,”
    “Starbucks Coffee Co,”
    “Starbucks Coffee Co,”
    “Starbucks NCSU,”
    “STARBUCKS NORTH HILLS CENTER #9789,”
    “STARBUCKS PRE-SECURITY,”
    “Starbucks T2D,”
    “STARBUCKS TARGET #1104,”
    “Starbucks Target #1794,”
    “Starbucks Target 1824,”
    “STARBUCKS TERMINAL 1,”
    “Starbucks Terminal I Pre-Security,”
    “State Farmers Market Restaurant,”
    “State Hwy Buidling Lunchenette,”
    “STATE OF BEER,”
    “Stavi's Sandwiches (WCID #639),”
    “Staybridge Suites Sundowner Room,”
    “Steak 'N' Shake,”
    “STEAK N SHAKE,”
    “STEAK N SHAKE #6702,”
    “STELLINO'S,”
    “STEVE'S MINI MART,”
    “Steve's Place,”
    “STEWART'S BISTRO,”
    “Sticky Rice,”
    “Stir,”
    “STONERIDGE,”
    “Stop &amp; Quick,”
    “Strategic Behavioral Center-Garner (Kitchen),”
    “Stromboli`s,”
    “Stromboli`s ,”
    “STUFT (WCID #477),”
    “Sub Conscious,”
    “Sub Station II,”
    “Subway,”
    “Subway,”
    “Subway,”
    “Subway,”
    “SUBWAY,”
    “Subway,”
    “Subway,”
    “Subway,”
    “Subway,”
    “Subway,”
    “Subway,”
    “Subway,”
    “Subway # 1437,”
    “SUBWAY #1119,”
    “SUBWAY #1120,”
    “SUBWAY #11874,”
    “Subway #12044,”
    “Subway #12050,”
    “SUBWAY #12460,”
    “Subway #12598,”
    “SUBWAY #12786,”
    “Subway #1381,”
    “SUBWAY #14347,”
    “Subway #1479,”
    “SUBWAY #17385,”
    “Subway #1880,”
    “SUBWAY #2046,”
    “SUBWAY #22217,”
    “SUBWAY #25595,”
    “Subway #2615,”
    “SUBWAY #2692,”
    “Subway #28785,”
    “SUBWAY #29952,”
    “Subway #30443,”
    “Subway #30454,”
    “Subway #31243,”
    “SUBWAY #3151,”
    “SUBWAY #3152,”
    “Subway #3262,”
    “SUBWAY #33002,”
    “SUBWAY #35970,”
    “Subway #37092,”
    “Subway #37200,”
    “SUBWAY #3726,”
    “SUBWAY #37788,”
    “Subway #40338,”
    “SUBWAY #40395,”
    “SUBWAY #41211,”
    “Subway #41217,”
    “Subway #41914,”
    “SUBWAY #42484,”
    “Subway #42679,”
    “Subway #4331,”
    “SUBWAY #50592,”
    “SUBWAY #5168,”
    “SUBWAY #52361,”
    “SUBWAY #52435,”
    “SUBWAY #54848 @ WALMART,”
    “SUBWAY #55675,”
    “SUBWAY #57757,”
    “SUBWAY #57792,”
    “SUBWAY #59146,”
    “SUBWAY #881,”
    “SUBWAY #948,”
    “Subway 10949,”
    “Subway# 34670,”
    “SUGAR BUZZ BAKERY &amp; CAFE,”
    “SUGAR MAGNOLIA CAFE AND EMPORIUM,”
    “SUGARLAND,”
    “Sukhadia's Indian Cuisine,”
    “SULLIVANS STEAK HOUSE,”
    “SULTAN'S DELI,”
    “Sunflower`s,”
    “SUNNY`S DINER,”
    “Sunnybrook Rehabilitation Center Foodservice,”
    “Sunrise At North Hills Kitchen,”
    “SUNRISE OF CARY FOODSERVICE,”
    “Sunrise Of Raleigh Assisted Living Cafeteria,”
    “Super Target #1932 (Deli),”
    “Super Target #1932 Food Avenue,”
    “Super Target Deli,”
    “Super Target Food Avenue,”
    “Super Target Store T1826 (Deli),”
    “Super Target Store T1826 (Food Ave),”
    “Super Wok,”
    “Supremo's Pizza,”
    “SURABHI KITCHEN,”
    “Sushi &amp; Thai Restaurant,”
    “Sushi at the Park,”
    “Sushi Blues Cafe,”
    “SUSHI IWA APEX,”
    “Sushi Mon,”
    “Sushi Nine,”
    “SUSHI O,”
    “SUSHI ONE,”
    “SUSHI SIAM,”
    “SUSHI THAI CARY,”
    “Sushi Tsune Of Kyoto,”
    “SUVIDHA,”
    “Swagat Indian Cuisine,”
    “Swahili Grill;,”
    “Sweet Escapes by Poblanos (WCID #692),”
    “Sweet Tea and Cornbread Cafe,”
    “Sweetwaters Coffee &amp; Tea,”
    “Swift Creek Elem. Sch. Cafeteria,”
    “SWIFT CREEK MINI MART,”
    “Swing Space - North Ridge Elementary School Cafeteria,”
    “SYCAMORE CREEK CAFETERIA,”
    “Syneos Health Cafe,”
    “Szechuan Garden Morrisville,”
    “SZECHUAN HEAT,”
    “SZECHUAN TASTE,”
    “Taco Bell,”
    “Taco Bell,”
    “Taco Bell,”
    “Taco Bell,”
    “Taco Bell / KFC 3248,”
    “Taco Bell #020165,”
    “Taco Bell #1872,”
    “Taco Bell #22798,”
    “Taco Bell #2836,”
    “TACO BELL #29283,”
    “TACO BELL #30930,”
    “TACO BELL #320555,”
    “Taco Bell #3279,”
    “Taco Bell #3421,”
    “Taco Bell #34245,”
    “TACO BELL #34556,”
    “Taco Bell of Knightdale,”
    “Taco Boy Chipotle,”
    “Tacos &amp; Pupusas Del Toro (WCID #695),”
    “TACOS CAMPA (WCID #353),”
    “Tacos El Coco Loco (WCID #694),”
    “TACOS ESTILO HIDALGO,”
    “Tacos Estilo Hidalgo #3 y Pupuseria,”
    “Tacos Estilo Hildago (WCID #716),”
    “Tacos Estilo Hildalgo (Mario Resendiz-Trejo) (WCID # 068),”
    “TACOS LAS CAROLINAS (WCID #715),”
    “Tacos Mama Chava #1 (WCID #684),”
    “Tacos Mama Chava #2 (WCID #686),”
    “Tacos Mexico,”
    “Tacos Mexico Restaurant,”
    “Tacos Sanjuan (WCID #656),”
    “TACOS Y MARISCOS VALLARTA,”
    “TACOS Y PUPUSAS LAS MARIAS,”
    “TAIPEI AUTHENTIC CHINESE CUISINE,”
    “TAIPEI CAFE,”
    “TAJ MAHAL INDIAN CUISINE,”
    “TAKE 5 CAFE,”
    “TALLEY STUDENT UNION MAIN KITCHEN,”
    “Tama Tea,”
    “TAMARIND,”
    “Tangerine Cafe,”
    “TAPLINE GROWLER,”
    “Taqueria 3 Diamantes (WCID #705),”
    “Taqueria Acapulco,”
    “TAQUERIA EL CALENTANO (WCID #623),”
    “TAQUERIA EL TORO,”
    “Taqueria Esmeralda (WCID #031),”
    “TAQUERIA LA CABANA,”
    “TAQUERIA LA COSTENA (WCID #537),”
    “TAQUERIA LA ESQUINA,”
    “Taqueria La Esquina (WCID #662),”
    “Taqueria La Zacatecana,”
    “Taqueria Lo Mejor Acapulco #1 (WCID #448),”
    “Taqueria Rancho Grande,”
    “Target #1104 Cafe,”
    “Target #1892 Cafe &amp; Starbucks,”
    “TARGET CAFE,”
    “TARGET CAFE #2721,”
    “TARGET CAFE #2784,”
    “Target Food Avenue Express,”
    “TASTE,”
    “Taste Of China,”
    “TASTE OF CHINA,”
    “TASTE OF CHINA,”
    “TASTE OF JAMAICA,”
    “Taste of Jerusalem,”
    “TASTE VIETNAMESE CUISINE,”
    “Tastefully Served @ TKA,”
    “TASTY BEVERAGE CO,”
    “TASU,”
    “TASU ASIAN BISTRO,”
    “TAVERN ON THE GREEN,”
    “TAVERNA AGORA,”
    “Taylor`s Convenience Store,”
    "Taza Grill,"
    “Taza Grill #2,”
    “TAZIKI'S,”
    “Taziki's,”
    “TAZIKI'S RTP,”
    “TAZZA KITCHEN,”
    “TAZZA KITCHEN - SCV,”
    “TEAM BEVERAGE,”
    “Teddy's New Yorker Pizza,”
    “TELEFLEX CAFE,”
    “TENKO JAPAN,”
    “TENKO JAPAN,”
    “TENKO JAPAN,”
    “Teriyakin,”
    “Terra Bonum Salad Cafe,”
    “Terrace Cafe SAS Building A,”
    “TERRACE DINING ROOM/TERRACE SNACK BAR,”
    “Texas Roadhouse #294,”
    “Texas Roadhouse #594,”
    “TEXAS STEAKHOUSE AND SALOON,”
    “TGI Friday's #2175,”
    “TGI Friday`s,”
    “THAI BISTRO,”
    “THAI CAFE #2,”
    “Thai House Cuisine,”
    “THAI LOTUS,”
    “Thai Spices & Sushi,”
    “THAI THAI CUISINE,”
    “Thai Villa Restaurant,”
    “THAI`S NOODLE,”
    “THAIPHOON BISTRO,”
    “THE 13TH TACO (WCOD #568),”
    “THE 19TH HOLE,”
    “The Arbor @ Morgan Street Food Hall,”
    “THE BEERDED LADY,”
    “THE BERKELEY CAFE,”
    “THE BIG EASY,”
    “The Big Easy ,”
    “The Bistro at Courtyard by Marriott,”
    “The Blind Pelican,”
    “The Border Restaurant,”
    “The Bowls @ MSFH,”
    “THE BRICKHOUSE,”
    “THE BRUNCH BOX,”
    “THE BURGER SHOP,”
    “The Butchers Market,”
    “The Butchers Market,”
    “The Butchers Market,”
    “THE CAPITAL GRILLE,”
    “THE CARDINAL AT NORTH HILLS FOOD SERVICE,”
    “THE CARY PUB,”
    “The Caterhaus@TKA,”
    “THE CATERING WORKS,”
    “The Centerline Cafe,”
    “The Cheesecake Factory,”
    “THE CORNER TAVERN &amp; GRILL,”
    “THE CORNER VENEZUELAN FOOD (WCID #539),”
    “The Covington Foodservice,”
    “THE COW AND THE OAK (WCID # 535),”
    “THE COWFISH,”
    “THE CRESCENT,”
    “THE CYPRESS OF RALEIGH KITCHEN,”
    “THE DISTRICT RALEIGH,”
    “THE EGG&amp;I BREAKFAST &amp; LUNCH,”
    “THE EMPANADA FACTORY,”
    “The Exchange Cafe,”
    “The Factory,”
    “The Factory Ballfields Concession Stand,”
    “THE FACTORY ICE HOUSE SNACK BAR,”
    “THE FALCON'S NEST AT ST. AUGUSTINE,”
    “THE FICTION KITCHEN,”
    “THE FLYING BISCUIT CAFE,”
    “The Flying Saucer Restaurant,”
    “THE FORKS CAFETERIA AND CATERING,”
    “The Franciscan School Cafeteria,”
    “The Fresh Market Deli,”
    “The Fresh Market Meat/Seafood,”
    “The Fresh Market Produce,”
    “The Fueling Edge @ TKA,”
    “THE GARDEN GRILLE &amp; BAR,”
    “The Garden Grille &amp; Bar (at Hilton Garden Inn),”
    “THE GARDEN GRILLE &amp; BAR BY HILTON,”
    “THE GARDEN ON MILLBROOK,”
    “The Handy Kitchen,”
    “THE HAT RACK (RED HAT 9TH FLOOR),”
    “THE HAT RACK CATERING KITCHEN (1st Floor),”
    “THE HEIGHTS DOMINICAN KITCHEN (WCID # 609),”
    “THE HICKORY TAVERN #26,”
    “THE HOP YARD,”
    “The Hot Dog Hub (WCID #707),”
    “The Juicy Crabhouse,”
    “The Katsu @ MSFH,”
    “The Kitchen Archive,”
    “THE KOLA NUT,”
    “The Laurels of Forest Glenn Foodservice,”
    “THE LEMON TREE SHOPPING CAFE,”
    “THE LOCAL @ ALLSCRIPTS,”
    “THE LODGE AT WAKE FOREST #5647,”
    “The Lost Cajun Restaurant - Bent Tree Plaza,”
    “The Lost Cajun Wakefield,”
    “THE MAC HOUSE,”
    “THE MASON JAR LAGER COMPANY, LLC,”
    “THE MASON JAR TAVERN,”
    “THE MASON JAR TAVERN,”
    “The Melting Pot,”
    “THE MILL,”
    “The New Oakwood Cafe,”
    “The North Carolina Catering Company @ TKA,”
    “THE OAK,”
    “THE OAKS AT WHITAKER GLEN,”
    “THE OVAL,”
    “The Peddler Steak House,”
    “THE PHARMACY CAFE,”
    “THE PHO PLACE,”
    “THE PICKLED ONION,”
    “THE PICKLED ONION,”
    “The Piper`s Tavern,”
    “The Pit,”
    “THE PIZZA DUDE,”
    “The Point,”
    “THE POOLSIDE CAFE,”
    “The Postmaster,”
    “THE PROVINCIAL,”
    “The Pyramids (WCID #598),”
    “THE RALEIGH GRANDE CINEMA,”
    “THE REMEDY DINER,”
    “THE ROCKFORD,”
    “THE ROLLING GRILL (WCID #558),”
    “THE SHINY DINER,”
    “The Spiedie Turtle (WCID #677),”
    “The Sports Page Bar &amp; Grill,”
    “The Starbar,”
    “THE STATE CLUB,”
    “THE STATION AT PERSON ST,”
    “The Third Place,”
    “THE TOMATITO (WCID #375),”
    “THE URBAN TURBAN,”
    “The Village Deli,”
    “THE WAKE ZONE ESPRESSO,”
    “THE WANDERING MOOSE (WCID #533),”
    “The Wild Cook's Indian Grill,”
    “THE YARD HOUSE #41,”
    “Thomas Brooks Park,”
    “Thymely Meals @ TKA,”
    “TIJUANA FLATS #138,”
    “TIJUANA FLATS #155,”
    “TIJUANA FLATS #193,”
    “TIJUANA FLATS BURRITO CO. #182,”
    “Timber Drive Elementary Cafeteria,”
    “TLAQUEPAQUE MEXICAN CUISINE,”
    “TOBACCO ROAD,”
    “TODAY ASIA MARKET,”
    “Tokyo House,”
    “Tonbo Ramen,”
    “TONY`S PIZZA,”
    “Tonys Bourbon Street Oyster Bar,”
    “Tookie`s,”
    “Toot N Tell Restaurant,”
    “Top Dog Franks (WCID #657),”
    “TORCHLIGHT ACADEMY,”
    “TORERO'S MEXICAN RESTAURANT,”
    “Torero`s Mexican Restaurant V,”
    “Torero`s Restaurant,”
    “TORTAS Y TACOS EL JAROCHO (WCID #597),”
    “TOTOPOS,”
    “TOWER INDIA,”
    “Tower Nursing and Rehabilitation Center Kitchen,”
    “TOWNPLACE SUITES CARY/WESTON PKWY.,”
    “TRA'LI,”
    “Trali Irish Pub,”
    “Transfer Company Bar,”
    “TRANSITIONS LIFECARE,”
    “Trash Talk (WCID #315),”
    “Traveling Dogs (WCID #495),”
    “TRAVINIA ITALIAN KITCHEN,”
    “Treeo Senior Living Foodservice,”
    “Triangle Catering,”
    “TRIANGLE MINI MART,”
    “Triangle Springs Hospital Foodservice,”
    “Triangle Wine Company,”
    “TRIBECA TAVERN,”
    “Triple Barrel Tavern,”
    “TROPHY BREWING,”
    “TROPHY BREWING CO,”
    “TROPHY TAP &amp; TABLE,”
    “Tropical Picken Chicken,”
    “TROPICAL PICKEN CHICKEN,”
    “TROPICAL SMOOTHIE 020 NC,”
    “Tropical Smoothie Cafe,”
    “TROPICAL SMOOTHIE CAFE,”
    “Tropical Smoothie Cafe,”
    “TROPICAL SMOOTHIE CAFE,”
    “Tropical Smoothie Cafe,”
    “TROPICAL SMOOTHIE CAFE #NC22,”
    “TROPICAL SMOOTHIE CAFE NC-55,”
    “TROPICAL SMOOTHIE CAFE NC23,”
    “TROPICAL SMOOTHIE NC21,”
    “Tru by Hilton Foodservice,”
    “Truffles Deli,”
    “TSA CAFE,”
    “TUPELO HONEY CAFE,”
    “Turn House,”
    “Turner Creek Elementary Cafeteria,”
    “Tuscan Blu,”
    “TWO GUYS GRILLE,”
    “UDUPI Cafe,”
    “Umstead Hotel &amp; Spa Food Service,”
    “Umstead Hotel &amp; Spa Pool Bar,”
    “Uncle Julio's #48,”
    “Uninhibited Tapas Bar,”
    “UNITED SKATES CAFE,”
    “UNIVERSAL HEALTH CARE FUQUAY VARINA DINING,”
    “Universal Health Care Of N.Ral Foodservice,”
    “University Towers Dining Service,”
    “Unwined on White,”
    “Upper Deck,”
    “UpZcale Chefs (WCID #631),”
    “USA Baseball Concession Stand,”
    “Vaishno Bhog,”
    “Valentino`s (WCID 378),”
    “Vance Elem. School Cafeteria,”
    “Vandora Springs Elementary School Cafeteria,”
    “Variety Pickup Food Stand-Hwy 97,”
    “VAUGHN TOWERS,”
    “Vegan Community Kitchen,”
    “VERANDAH,”
    “Verizon Cary Marketplace,”
    “Vernon Malone College &amp; Career Academy Cafeteria,”
    “VIC'S ITALIAN RESTAURANT &amp; PIZZERIA,”
    “Vic`s Italian Cafe,”
    “Vicious Fishes Brewery Tap &amp; Kitchen,”
    “VIDRIO,”
    “VILLAGE DELI &amp; GRILL,”
    “VILLAGE DELI &amp; GRILL LAKE BOONE TRAIL,”
    “Village Deli #1,”
    “Village Draft House,”
    “VILLAGE GRILL,”
    “VINNIE'S STEAK HOUSE &amp; TAVERN,”
    “VINOS FINOS Y PICADAS,”
    “VIRGIL'S JAMAICA (WCID #443),”
    “Virgil's Taco Truck (WCID #576),”
    “VITA VITE,”
    “Vita Vite Midtown,”
    “Viva Chicken,”
    “VIVA MEXICAN KITCHEN,”
    “Viva Mexican Kitchen,”
    “Vivace,”
    “VIVO RISTORANTE,”
    “Wade Park Cafe,”
    “Waffle House,”
    “WAFFLE HOUSE #1090,”
    “WAFFLE HOUSE #1161,”
    “WAFFLE HOUSE #1279,”
    “WAFFLE HOUSE #1302,”
    “WAFFLE HOUSE #1901,”
    “WAFFLE HOUSE #2051,”
    “Waffle House #2052,”
    “WAFFLE HOUSE #2171,”
    “WAFFLE HOUSE #2220,”
    “WAFFLE HOUSE #351,”
    “WAFFLE HOUSE #378,”
    “WAFFLE HOUSE #725,”
    “Wake Assisted Living (Kitchen),”
    “Wake Christian Academy Cafeteria,”
    “WAKE COUNTY DETENTION CENTER KITCHEN &amp; STAFF KITCHEN,”
    “Wake Forest BP Restaurant,”
    “Wake Forest Elem. Sch. Cafeteria,”
    “Wake Forest Hideout,”
    “Wake Forest High School Cafeteria,”
    “Wake Forest Juice Bar,”
    “Wake Forest Middle Cafeteria,”
    “Wake Med Kitchen,”
    “WAKE MED NORTH FALLS CAFE,”
    “Wake Technical Community College Rest.,”
    “Wake The Truck Up (WCID #714),”
    “Wakefield Elementary Cafeteria,”
    “Wakefield High School Cafeteria,”
    “Wakefield Middle Cafeteria,”
    “WAKEFIELD TAVERN,”
    “WAKEFIELD WINE CELLAR,”
    “WAKELON ELEMENTARY SCH. LUNCHROOM,”
    “Walking Crab,”
    “WALMART #1372 DELI,”
    “WalMart #4458 Deli,”
    “WALMART #4484 DELI,”
    “WalMart #5254 Deli,”
    “WalMart #5292 Deli,”
    “WALMART 4157 NEIGHBORHOOD MARKET DELI,”
    “WalMart Deli,”
    “WALMART DELI #2247,”
    “WALMART DELI #3889,”
    “WALMART NEIGHBORHOOD DELI #4147,”
    “WALMART NEIGHBORHOOD MARKET #2414,”
    “WalMart Supercenter # 2058 Deli,”
    “WALMART SUPERCENTER #4250 DELI,”
    “WalMart Supercenter #4499-00 Deli/Bakery,”
    “WalMart Supercenter #5118 Deli,”
    “Walnut Creek East Main Concesion,”
    “WALNUT CREEK ELEMENTARY CAFETERIA,”
    “Walnut Creek VIP Grill,”
    “Walnut Creek West Main Concession,”
    “WALTONWOOD AT CARY DINING,”
    “Waltonwood Lake Boone,”
    “WANG`S BISTRO,”
    “WANG`S KITCHEN,”
    “Wang`s Kitchen,”
    “Wang`s Kitchen,”
    “Wang`s Kitchen,”
    “Wang`s Kitchen,”
    “Wang`s Kitchen,”
    “Waraji Japanese Restaurant,”
    “Wasabi,”
    “Washington Elem. School Cafeteria,”
    “Watkins Grill,”
    “Wayback Burgers,”
    “We Beef'n (WCID #687),”
    “We Cook For You Catering,”
    “Weatherstone Elem. Sch. Cafeteria,”
    “Weaver's Weiners  (WCID #449),”
    “WELCOME MART,”
    “Wellington Nursing Center Kitchen,”
    “WELLS FARGO  CAFE,”
    “Wendell Country Club Foodservice,”
    “Wendell Elem School Cafeteria,”
    “WENDELL FALLS GROUNDS CAFE,”
    “WENDELL MIDDLE SCHOOL CAFETERIA,”
    “WENDELL PARK CONCESSION STAND,”
    “Wendell Senior Nutrition Site,”
    “WENDY'S #6300,”
    “WENDY'S #6303,”
    “WENDY'S #6304,”
    “WENDY'S #6318,”
    “WENDY'S #6319,”
    “WENDY'S #6320,”
    “WENDY'S #6322,”
    “WENDY'S #6323,”
    “WENDY'S #6324,”
    “WENDY'S #6325,”
    “WENDY'S #6327,”
    “WENDY'S #6328,”
    “WENDY'S #6329,”
    “WENDY'S #6330,”
    “WENDY'S #6332,”
    “WENDY'S #6333,”
    “WENDY'S #6334,”
    “WENDY'S #6335,”
    “WENDY'S #6336,”
    “WENDY'S #6337,”
    “WENDY'S #6338,”
    “WENDY'S #6339,”
    “WENDY'S 6305,”
    “WENDYS,”
    “WENDYS #6306,”
    “WENDYS #6317,”
    “WENDYS 6301,”
    “West Cary Middle Sch.Cafeteria,”
    “West Lake Elem. Sch. Cafeteria,”
    “West Lake Middle Sch. Cafeteria,”
    “West Millbrook Middle Sch. Cafeteria,”
    “Whalen's in Knightdale,”
    “WHICH WICH #182,”
    “WHICH WICH #192,”
    “WHICH WICH #281,”
    “Which Wich #670,”
    “Which Wich #770,”
    “WHICH WICH PARK WEST #327,”
    “WHICH WICH? #280,”
    “Whichwich,”
    “WHISKEY KITCHEN,”
    “Whisky River,”
    “WHISPERING PINES DINING,”
    “WHITE OAK ELEMENTARY SCHOOL CAFETERIA,”
    “WHITE OAK STADIUM 14,”
    “WHITE STREET BREWING CO,”
    “Who Loves Hot Dogs (WCID #408),”
    “WHOLE FOODS #10338 MEAT,”
    “WHOLE FOODS #10338 PREPARED FOODS,”
    “WHOLE FOODS #10338 PRODUCE,”
    “WHOLE FOODS #10338 SEAFOOD,”
    “WHOLE FOODS #10338 SPECIALTY,”
    “Whole Foods Market #10611 Culinary,”
    “Whole Foods Market #10611 Meat/Seafood,”
    “Whole Foods Market #10611 Produce,”
    “Whole Foods Market #10611 Specialty,”
    “Whole Foods Market Cafe,”
    “Whole Foods Market Coffee Bar,”
    “Whole Foods Market Deli-Sushi-Cheese,”
    “Whole Foods Market Meat Market,”
    “Whole Foods Market Meat Market,”
    “Whole Foods Market Produce Department,”
    “Whole Foods Market Produce Shop,”
    “Whole Foods Market Seafood Market,”
    “Whole Foods Market Seafood Shop,”
    “WICKED LINKS #1 (WCID #493),”
    “WICKED LINKS #2 (WCID #494),”
    “WICKED LINKS #3 (wcid #516),”
    “WICKED LINKS #5 (WCID #567),”
    “Wicked Taco 4 @ MSFH,”
    “WILBURN ELEMENTARY CAFETERIA,”
    “WILD WING CAFE #119,”
    “Wildwood Forest Elem. Sch. Cafeteria,”
    “Wildwood Green Snack Bar,”
    “Wiley Elementary School Cafeteria,”
    “William Peace University Cafeteria,”
    “Willie Mae's Country Kitchen,”
    “Willie's Carolina Picnic (WCID #569),”
    “Willow Creek Exxon,”
    “Willow Spring Elem.Cafet.,”
    “Wilson's Eatery,”
    “Windsor Point Restaurant,”
    “WINE &amp; BEER 101,”
    “WINE AUTHORITIES,”
    “WING STOP,”
    “WING STOP # 527,”
    “WING STOP #1245,”
    “WING STOP #816,”
    “WINGATE BY WYNDHAM,”
    “WINGATE BY WYNDHAM BREAKFAST,”
    “WINGIN'IT BAR AND GRILLE,”
    “WINGS OVER RALEIGH,”
    “Wingz American Grill,”
    “WINSTON CLUBHOUSE,”
    “Winston`s Grille,”
    “WOLF VILLAGE C-STORE,”
    “WOLVES DEN,”
    “Woodland Terrace Assisted Living Foodservice,”
    “Woodland Terrace Independent Living Foodservices,”
    “Woodpile BBQ (WCID #646),”
    “Woody`s @ City Market,”
    “Woody`s Sports Tavern &amp; Grill,”
    “Word Of God Church School Cafeteria,”
    “WORLD OF BEER,”
    “WYE HILL KITCHEN &amp; BREWING,”
    “XL SIDELINE, LLC,”
    “XOCO MEXICAN GRILL,”
    “YAMATO,”
    “Yates Mill Elem. Sch. Cafet.,”
    “Yemen Kitchen,”
    “YIN DEE,”
    “Yoho @ MSFH,”
    “Yoho Asian Bistro,”
    “York Elementary School Cafeteria,”
    “Your Pie,”
    “Your Pie #47,”
    “YUM YUM THAI CUISINE,”
    “YUMMY DOGS (WCID # 554),”
    “Yummy Dogs #2 (WCID #587),”
    “YUMMY HIBACHI,”
    “Yussy's Kitchen (WCID #711),”
    “Yussy's Kitchen @ TKA,”
    “ZANYU ASIAN NOODLES,”
    “ZAXBY'S,”
    “ZAXBY'S #44901,”
    “ZAXBY'S #46101,”
    “ZAXBY'S #60701,”
    “ZAXBY'S #66201,”
    “Zaxby's #66301,”
    “Zaxby's #69201,”
    “ZAXBY`S,”
    “Zaxby`s of Knightdale,”
    “Zaxby`s Restaurant,”
    “ZAYKA INDIAN CUISINE,”
    “Zebulon BP Grill,”
    “Zebulon Community Park Food Stand,”
    “Zebulon Country Club,”
    “Zebulon Elem. School Cafeteria,”
    “ZEBULON HOUSE (KITCHEN),”
    “Zebulon Middle School Cafeteria,”
    “ZEBULON REHABILITATION CENTER FOOD SERVICE,”
    “ZEERA INDIAN RESTAURANT,”
    “Zenfish Morrisville,”
    “Zest, Inc,”
    “ZOE'S KITCHEN,”
    “Zoe's Kitchen #325,”
    “ZOE`S KITCHEN AT NORTH HILLS,”
    “Zoes Kitchen,”
    “Zoes Kitchen #346,”
    “Zoes Kitchen #346,”
    
    

    ];
  
  /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
  autocomplete(document.getElementById("search-input"), restaurants);
