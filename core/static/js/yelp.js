let button = document.querySelector("#submit")
let input = document.querySelector("#search")
let output = document.querySelector("#output")

button.addEventListener('click', (e) => {
        getData()
})

url = "https://api.yelp.com/v3/businesses/search?term=restaurants&location=27529"
const cors ="https://cors-anywhere.herokuapp.com/"
const token = "Bearer LXc_1CXYWbpCcRrhXYCQ8UVdROphcKPdlDoR-EC9GGadzfBh-iTLBpqmhNPCI3_on1IroKPRcFNWffn3Y3orgE50ho4k0j-VABxhBrJgPrsfn7RssZavS4-S47k9XXYx"



function getData() {
    fetch(cors + url, {        
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        headers: {
            'Authorization': token,
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }
    })

    .then(data => data.json())
    .then(json => {
    console.log(json)
        
    })

}