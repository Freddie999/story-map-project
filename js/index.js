import { SlideDeck } from './slidedeck.js';

const map = L.map('map', {
  scrollWheelZoom: false,
  zoomSnap: 0, // Allow the camera to fit between whole-number zoom levels.
}).setView([0, 0], 0);

// ## The Base Tile Layer
const mapboxKey = 'pk.eyJ1IjoiZnJlZGRpZTk5OSIsImEiOiJjbXR1azRmOTYwbDFvMnlwcm9oZHBmZXY1In0.i_7eFJnOrM9qen4-_t_fFQ';
// const mapboxStyle = 'freddie999/cmubib89c000901s6d2hk0cvq';
const mapboxStyle = 'mapbox/dark-v11';

const baseTileLayer = L.tileLayer(
  `https://api.mapbox.com/styles/v1/${mapboxStyle}/tiles/512/{z}/{x}/{y}?access_token=${mapboxKey}`,
  {
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> '
      + '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
      + '<a href="https://apps.mapbox.com/feedback/">Improve this map</a>',
  },
);

baseTileLayer.addTo(map);

// ## Interface Elements
const container = document.querySelector('.slide-section');
const slides = document.querySelectorAll('.slide');

const journeyOptions = {
  pointToLayer: (feature, latlng) => {
    return L.marker(latlng, {
      alt: feature.properties.label,
      title: feature.properties.label,
    });
  },

  style: (feature) => {
    if (feature.properties.kind === 'boundary') {
      return {
        color: '#eaf5fafb',
        weight: 3,
        fillOpacity: 0.5,
      };
    }

    if (feature.properties.kind === 'air') {
      return {
        color: '#64E2DA',
        weight: 4,
        opacity: 1,
        dashArray: '10 8',
      };
    }

    return {
      color: '#FFB36B',
      weight: 5,
      opacity: 1,
    };
  },

  onEachFeature: (feature, layer) => {
    if (feature.geometry.type === 'Point') {
      layer.bindTooltip(feature.properties.label, {
        permanent: true,
        direction: feature.properties.labelDirection || 'right',
      });
    }
  },
};

// The two overview slides use the same time bands.
function getTimeColor(minutes) {
  if (minutes <= 30) return '#eff3ff';
  if (minutes <= 60) return '#bdd7e7';
  if (minutes <= 120) return '#6baed6';
  return '#2171b5';
}

const accessibilityOptions = {
  pointToLayer: (feature, latlng) => {
    const properties = feature.properties;

    if (properties.kind === 'origin') {
      return L.marker(latlng, {
        alt: properties.label,
        title: properties.label,
      }).bindTooltip(properties.label, { permanent: true });
    }

    // Size changes as well as color, so color is not the only clue.
    let radius = 4;
    if (properties.travelMin > 30) radius = 5;
    if (properties.travelMin > 60) radius = 6;
    if (properties.travelMin > 120) radius = 7;

    return L.circleMarker(latlng, {
      radius,
      color: '#fff',
      weight: 1,
      fillColor: getTimeColor(properties.travelMin),
      fillOpacity: 1,
    });
  },

  onEachFeature: (feature, layer) => {
    if (feature.properties.kind === 'facility') {
      const popup = document.createElement('p');
      popup.textContent = feature.properties.label;
      layer.bindPopup(popup);
    }
  },
};

const slideOptions = {
  'title-slide': journeyOptions,
  'rwanda-context': journeyOptions,
  'road-access': {
    ...accessibilityOptions,
    filter: (feature) => {
      return feature.properties.kind !== 'origin';
    },
  },
  'ruli-road': journeyOptions,
  'ruli-flight': journeyOptions,
  'drone-access': accessibilityOptions,
  'six-comparison': journeyOptions,
  'conclusion': journeyOptions,
};
// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

async function startStory() {
  await deck.preloadFeatureCollections();

  deck.syncMapToCurrentSlide();

  document.addEventListener('scroll', () => {
    deck.calcCurrentSlideIndex();
  });

  // Account for a page opened partway down.
  deck.calcCurrentSlideIndex();
}

startStory().catch((error) => {
  console.error('Could not load the story map:', error);
});
