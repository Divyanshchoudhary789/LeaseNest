let map = L.map('search-map').setView([28.6139, 77.209], 10);

const mapKey = "46f9d92ada9441149bf11e3a66f071a1";


// Retina displays require different mat tiles quality
let isRetina = L.Browser.retina;

let baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${mapKey}`;
let retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${mapKey}`;


// Add map tiles layer. Set 20 as the maximal zoom and provide map data attribution.
L.tileLayer(isRetina ? retinaUrl : baseUrl, {
    apiKey: mapKey,
    maxZoom: 20,
    id: 'osm-bright',
}).addTo(map);

// move zoom controls to bottom right
map.zoomControl.remove();
L.control.zoom({
    position: 'bottomright'
}).addTo(map);


let markers = [];
let bounds = [];


for (let listing of allListings) {
    let coords = listing.geometry.coordinates;
    let latlng = new L.LatLng(coords[1], coords[0]);
    let marker = L.marker(latlng).addTo(map);
    marker.bindPopup(`<b>${listing.title}</b><br>Price:&nbsp;<b>${listing.price}&#8377;</b><br>${listing.location}`);
    markers.push(marker);
    bounds.push(latlng);
}

if (bounds.length > 0) {
    let group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
}