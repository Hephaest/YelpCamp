/******************** Cookies *********************/
const goBackBtn = document.querySelector('.previous');
const preUrl = document.cookie
        .split('; ')
        .find(row => row.startsWith('urlReferrer='))
        .replace('urlReferrer=', '');
goBackBtn.href = preUrl;

/******************** Moment *********************/
const divs = document.querySelectorAll('.starability-text');

const reviews = campground.reviews;

reviews.map((review, i) => {
    divs[i].innerText = moment(review.date).calendar();
});

/******************** Map *********************/
mapboxgl.accessToken = mapToken;

const coordinates = campground.geometry.coordinates;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: coordinates,
    zoom: 10
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl
    .Marker({ 
        color: '#ce2c69', 
        draggable: true 
    })
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl
        .Popup({ offset: 25 })
        .setHTML(
            `<h6>${ campground.title }</h6><p>${ campground.location }</p>`
        )
    )
    .addTo(map)

/***** Submit Listener *****/
const deleteButton = document.querySelector('#delete-btn');
deleteButton.addEventListener('click', () => {
    deleteButton.classList.add('disabled');
    deleteButton.disabled = true;
})