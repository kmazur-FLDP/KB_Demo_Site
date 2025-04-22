// Initialize map
// const map = L.map('map').setView([28.1, -82.4], 10);
const map = L.map('map'); // Adjust center if needed

// Basemaps
const aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Imagery &copy; Esri',
  maxZoom: 17
}).addTo(map); // Default layer

const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 17
});

// Base layer switcher
const baseMaps = {
  'Aerial (Esri)': aerial,
  'Standard (OSM)': standard
};


function loadLayer(url, options = {}, callback) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const layer = L.geoJSON(data, options);
      if (callback) callback(layer);
      // layer.addTo(map);
    })
    .catch(err => console.error(`Error loading ${url}:`, err));
}

// Load Potential Site GeoJSON
fetch('data/Potential_Site.json')
  .then(response => response.json())
  .then(data => {
    const siteLayer = L.geoJSON(data, {
      style: {
        color: 'red',
        weight: 2,
        fillOpacity: 0
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          showSidebar('Potential Site', feature.properties);
        });
      }
    });
    siteLayer.addTo(map);
    map.fitBounds(siteLayer.getBounds(), {
      padding: [30, 30],
      maxZoom: 16
    });
  })
  .catch(err => console.error('Error loading Potential_Site.json:', err));

const publixIcon = L.icon({
  iconUrl: 'assets/marker-publix.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const walmartIcon = L.icon({
  iconUrl: 'assets/marker-walmart.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

let publixLayer;
let walmartLayer;

loadLayer('data/FL_Publix.json', {
  pointToLayer: (feature, latlng) => L.marker(latlng, { icon: publixIcon }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>Publix</strong><br>${feature.properties?.Name || ''}`);
  }
}, layer => publixLayer = layer);

loadLayer('data/FL_Walmart.json', {
  pointToLayer: (feature, latlng) => L.marker(latlng, { icon: walmartIcon }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>Walmart</strong><br>${feature.properties?.Name || ''}`);
  }
}, layer => walmartLayer = layer);

let schoolLayer;

loadLayer('data/FL_Schools.json', {
  pointToLayer: (feature, latlng) =>
    L.circleMarker(latlng, {
      radius: 8,
      color: 'yellow',
      fillColor: 'yellow',
      fillOpacity: 0.8
    }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>School</strong><br>${feature.properties?.Name || ''}`);
  }
}, layer => schoolLayer = layer);

// Additional layers for overlay control
let femaLayer, fluLayer, soilsLayer, zoningLayer, wetlandsLayer, floodplainLayer;

loadLayer('data/FEMA.json', {
  style: feature => {
    const zone = feature.properties?.FLD_ZONE || 'default';
    let hash = 0;
    for (let i = 0; i < zone.length; i++) {
      hash = zone.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const color = `hsl(${hue}, 50%, 60%)`;
    return {
      color: color,
      weight: 1,
      fillOpacity: 0.3
    };
  },
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>FEMA Zone</strong><br>${feature.properties?.FLD_ZONE || 'N/A'}`);
  }
}, layer => femaLayer = layer);

loadLayer('data/Project_FLU.json', {
  style: feature => {
    const flu = feature.properties?.FLU_DESC || 'default';
    let hash = 0;
    for (let i = 0; i < flu.length; i++) {
      hash = flu.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const color = `hsl(${hue}, 50%, 60%)`;
    return {
      color: color,
      weight: 1,
      fillOpacity: 0.3
    };
  },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => {
      showSidebar('Future Land Use', feature.properties);
    });
  }
}, layer => fluLayer = layer);

loadLayer('data/Project_Soils.geojson', {
  style: feature => {
    const name = feature.properties?.MUNAME || 'default';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const color = `hsl(${hue}, 50%, 60%)`;
    return {
      color: color,
      weight: 1,
      fillOpacity: 0.3
    };
  },
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>Soil Type</strong><br>${feature.properties?.MUNAME || 'N/A'}`);
  }
}, layer => soilsLayer = layer);

loadLayer('data/Project_Zoning.json', {
  style: feature => {
    const zone = feature.properties?.NZONE_DESC || 'default';
    // Generate a consistent HSL color based on the zoning text
    let hash = 0;
    for (let i = 0; i < zone.length; i++) {
      hash = zone.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    const color = `hsl(${hue}, 60%, 60%)`;
    return {
      color: color,
      weight: 1,
      fillOpacity: 0.3
    };
  },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => {
      showSidebar('Zoning', feature.properties);
    });
  }
}, layer => zoningLayer = layer);

loadLayer('data/SWFWMD_Wetlands.json', {
  style: { color: '#27ae60', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>Wetlands</strong><br>${feature.properties?.Type || ''}`);
  }
}, layer => wetlandsLayer = layer);

loadLayer('data/SWFWMD_Floodplain.json', {
  style: { color: 'yellow', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>Floodplain</strong><br>${feature.properties?.Type || ''}`);
  }
}, layer => floodplainLayer = layer);


// Overlay control with all layers
setTimeout(() => {
  L.control.layers(baseMaps, {
    'Publix': publixLayer,
    'Walmart': walmartLayer,
    'Schools': schoolLayer,
    'FEMA Zones': femaLayer,
    'Future Land Use': fluLayer,
    'Soils': soilsLayer,
    'Zoning': zoningLayer,
    'Wetlands': wetlandsLayer,
    'Floodplain': floodplainLayer
  }, { collapsed: false }).addTo(map);
}, 1000); // Delay to ensure all layers load

// Sidebar control setup
const sidebar = document.createElement('div');
sidebar.id = 'map-sidebar';
sidebar.style.position = 'absolute';
sidebar.style.top = '70px';
sidebar.style.left = '10px';
sidebar.style.width = '280px';
sidebar.style.maxHeight = '60vh';
sidebar.style.overflowY = 'auto';
sidebar.style.background = 'white';
sidebar.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
sidebar.style.borderRadius = '6px';
sidebar.style.padding = '12px';
sidebar.style.zIndex = '1000';
sidebar.style.display = 'none';
document.body.appendChild(sidebar);

function showSidebar(title, attributes) {
  let content = `<div style="display: flex; justify-content: space-between; align-items: center;">
                   <h4 style="margin: 0;">${title}</h4>
                   <button id="close-sidebar" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
                 </div><ul>`;
  for (const [key, value] of Object.entries(attributes)) {
    content += `<li><strong>${key}:</strong> ${value}</li>`;
  }
  content += '</ul>';
  sidebar.innerHTML = content;
  sidebar.style.display = 'block';
  document.getElementById('close-sidebar').addEventListener('click', () => {
    sidebar.style.display = 'none';
  });
}