// const locations = JSON.parse(document.getElementById('map').dataset.locations);

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoicml0aWthLTEyMyIsImEiOiJja21nZWRqM2wzZWI2MnVud2Rxd3JkMzJvIn0.fFATZsWgva1xInByO8m9WA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ritika-123/ckmgew0zj7qst17qls80jw8a2',
    scrollZoom: false,
    //   center: [-118.30756079319706, 34.1443230085797],
    //   zoom:10
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc, ind) => {
    const ele = document.createElement('div');
    ele.className = 'marker';

    new mapboxgl.Marker({
      element: ele,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day : ${ind + 1} : ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
