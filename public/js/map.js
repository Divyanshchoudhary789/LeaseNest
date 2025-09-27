let map = L.map('my-map').setView([28.6139, 77.209], 10);

mapKey = mapKey;


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


//console.log(coordinates);

let marker;
if (marker) {
    marker.remove();
}



if (Array.isArray(coordinates) && coordinates.length == 2) {
    const latlng = new L.LatLng(coordinates[1], coordinates[0]); // [lat, lng]
    const marker = L.marker(latlng).addTo(map);
    map.panTo(latlng);
    marker.bindPopup(`<b>${listing.title}</b><br>Price:&nbsp;<b>${listing.price}&#8377;</b><br>${listing.location}`);
} 



