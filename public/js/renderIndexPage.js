/** *************************** pagination *************************/
const container = document.getElementById('pagination-container');

container.innerHTML = '';

const addPageItems = (el, start, end) => {
  for (let idx = start; idx <= end; idx ++) {
    el.innerHTML += `
    <li class="page-item ${ currentPage == idx ? 'active' : '' }">
    <a class="page-link" href="/campgrounds/?page=${ idx }&sort=${ currentSort }" >${ idx }</a>
    </li>`;
  }
};

const addHintItem = (el, title, status) => {
  el.innerHTML += `
  <li class="page-item ${ status == 'disabled' ? 'disabled' : '' }">
  <a class="page-link" href="${
    status == 'disabled' ? '#' : '/campgrounds/?page=' + (currentPage + (title == 'Next'? 1 : -1)) +
    '&sort=' + currentSort }
  ">
  ${ title }
  </a>
  </li>`;
};

if (pages <= maxWindow) {
  addPageItems(container, 1, pages);
} else {
  const offset = Math.floor(maxWindow / 2);
  let maxLeftIndex = currentPage - offset;
  let maxRightIndex = currentPage + offset;

  if (maxLeftIndex < 1) {
    maxLeftIndex = 1;
    maxRightIndex = maxWindow;
  }

  if (maxRightIndex > pages) {
    maxRightIndex = pages;
    maxLeftIndex = pages - maxWindow + 1;
    maxLeftIndex = maxLeftIndex < 1 ? 1 : maxLeftIndex;
  }

  addHintItem(container, 'Previous', currentPage != 1 ? 'enabled' : 'disabled');
  addPageItems(container, maxLeftIndex, maxRightIndex);
  addHintItem(container, 'Next', currentPage != pages ? 'enabled' : 'disabled');
}

/** *************************** Text Truncation *************************/
document.addEventListener( 'DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.truncate-text');
  const options = {height: 16 * 6};
  for (const wrapper of wrappers) new Dotdotdot( wrapper, options );
});

/** *************************** Button Listener *************************/
const goDetailBtns = document.querySelectorAll('.view-detail');

for (const btn of goDetailBtns) {
  btn.addEventListener('click', () => {
    // Set new one
    document.cookie = `urlReferrer=${ window.location.href }; path=/`;
  });
}

/** *************************** Pluralize *************************/
const starTextDivs = document.querySelectorAll('.starability-text');

campgrounds.map((campground, i) => {
  const ratings = pluralize('rating', campground.rating, true);
  const reviews = pluralize('review', campground.reviews.length, true);
  starTextDivs[i].innerText = `(${ratings}, ${reviews})`;
});

/** *************************** Map *************************/
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-103.59179687498357, 40.66995747013945],
  zoom: 3,
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource('mapData', {
    type: 'geojson',
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    data: mapData,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'mapData',
    filter: ['has', 'point_count'],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#00BCD4',
        10,
        '#2196F3',
        30,
        '#3F51B5',
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        15,
        10,
        20,
        30,
        25,
      ],
    },
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'mapData',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'mapData',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
    },
  });

  // inspect a cluster on click
  map.on('click', 'clusters', function(e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters'],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('mapData').getClusterExpansionZoom(
        clusterId,
        function(err, zoom) {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        },
    );
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on('click', 'unclustered-point', function(e) {
    const {popUpMarkup} = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popUpMarkup)
        .addTo(map);
  });

  map.on('mouseenter', 'clusters', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', function() {
    map.getCanvas().style.cursor = '';
  });
});
