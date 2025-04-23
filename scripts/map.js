// Initialize map
const map = L.map('map', {
  preferCanvas: false
});

// Basemaps
const aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Imagery &copy; Esri',
  maxZoom: 17
}).addTo(map);

const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 17
});

const baseMaps = {
  'Aerial (Esri)': aerial,
  'Standard (OSM)': standard
};

// Layers
let overlays = {};
let site1Parcel, site2Parcel;

// Utility
function loadLayer(url, options = {}, callback) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, options);
      if (callback) callback(layer);
    })
    .catch(err => console.error(`Failed to load ${url}`, err));
}

// Site 1
loadLayer('data/Site_1/Potential_Site.json', {
  style: { color: 'red', weight: 2, fillOpacity: 0 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 1: Parcel', feature.properties));
  }
}, layer => {
  site1Parcel = layer;
  site1Parcel.addTo(map);
  overlays['Site 1 - Parcel'] = site1Parcel;
  maybeFitBounds();
});

loadLayer('data/Site_1/Project_Zoning.json', {
  style: feature => {
    const zone = feature.properties?.NZONE_DESC || 'default';
    const hue = zone.length * 45 % 360;
    return { color: `hsl(${hue}, 70%, 60%)`, weight: 1, fillOpacity: 0.3 };
  },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 1: Zoning', feature.properties));
  }
}, layer => {
  overlays['Site 1 - Zoning'] = layer;
  maybeFitBounds();
});

loadLayer('data/Site_1/FEMA.json', {
  style: { color: '#4169e1', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 1: FEMA', feature.properties));
  }
}, layer => {
  overlays['Site 1 - FEMA'] = layer;
  maybeFitBounds();
});

loadLayer('data/Site_1/SWFWMD_Wetlands.json', {
  style: { color: '#2ecc71', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 1: Wetlands', feature.properties));
  }
}, layer => {
  overlays['Site 1 - Wetlands'] = layer;
  maybeFitBounds();
});

loadLayer('data/Site_1/SWFWMD_Floodplain.json', {
  style: { color: 'yellow', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 1: Floodplain', feature.properties));
  }
}, layer => {
  overlays['Site 1 - Floodplain'] = layer;
  maybeFitBounds();
});

// Site 2
loadLayer('data/Site_2/Site2.json', {
  style: { color: 'blue', weight: 2, fillOpacity: 0 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 2: Parcel', feature.properties));
  }
}, layer => {
  site2Parcel = layer;
  site2Parcel.addTo(map);
  overlays['Site 2 - Parcel'] = site2Parcel;
  maybeFitBounds();
});

loadLayer('data/Site_2/Site2_Zoning.geojson', {
  style: feature => {
    const zone = feature.properties?.NZONE_DESC || 'default';
    const hue = zone.length * 67 % 360;
    return { color: `hsl(${hue}, 70%, 60%)`, weight: 1, fillOpacity: 0.3 };
  },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 2: Zoning', feature.properties));
  }
}, layer => {
  overlays['Site 2 - Zoning'] = layer;
  maybeFitBounds();
});

loadLayer('data/Site_2/Site2_FEMA.geojson', {
  style: { color: '#2980b9', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 2: FEMA', feature.properties));
  }
}, layer => {
  overlays['Site 2 - FEMA'] = layer;
  maybeFitBounds();
});

loadLayer('data/Site_2/Site2_Wetlands.json', {
  style: { color: '#1abc9c', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 2: Wetlands', feature.properties));
  }
}, layer => {
  overlays['Site 2 - Wetlands'] = layer;
  maybeFitBounds();
});

loadLayer('data/Site_2/Site2_Floodplain.geojson', {
  style: { color: '#f1c40f', weight: 1, fillOpacity: 0.3 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('Site 2: Floodplain', feature.properties));
  }
}, layer => {
  overlays['Site 2 - Floodplain'] = layer;
  maybeFitBounds();
});

// Global layers
loadLayer('data/USA_FLU.json', {
  style: feature => {
    const flu = feature.properties?.FLU_DESC || 'default';
    const hue = flu.length * 23 % 360;
    return { color: `hsl(${hue}, 60%, 60%)`, weight: 1, fillOpacity: 0.3 };
  },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('USA Future Land Use', feature.properties));
  }
}, layer => {
  overlays['USA Future Land Use'] = layer;
  maybeFitBounds();
});

loadLayer('data/USA_Expansion.json', {
  style: { color: '#ff66cc', weight: 2, dashArray: '5,5', fillOpacity: 0.1 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => showSidebar('USA Expansion Area', feature.properties));
  }
}, layer => {
  overlays['USA Expansion Area'] = layer;
  maybeFitBounds();
});


// Points

loadLayer('data/FL_Walmarts.geojson', {
  pointToLayer: (feature, latlng) =>
    L.circleMarker(latlng, {
      radius: 8,
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 1
    }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>Walmart</strong><br>${feature.properties?.Name || ''}`);
  }
}, layer => {
  overlays['Walmart'] = layer;
  maybeFitBounds();
  console.log('✅ Walmart layer loaded:', layer.getLayers().length, 'features');
});

loadLayer('data/FL_Schools.json', {
  pointToLayer: (feature, latlng) =>
    L.circleMarker(latlng, {
      radius: 10,
      color: 'deeppink',
      fillColor: 'deeppink',
      fillOpacity: 0.9
    }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>School</strong><br>${feature.properties?.Name || ''}`);
  }
}, layer => {
  overlays['Schools'] = layer;
  maybeFitBounds();
});

// Fit bounds when both parcels are loaded and add control when both parcels visible
function maybeFitBounds() {
  if (site1Parcel && site2Parcel && !map._zoomInitialized) {
    const bounds = L.featureGroup([site1Parcel, site2Parcel]).getBounds();
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    map._zoomInitialized = true;
  }
}

setTimeout(() => {
  const groupedOverlays = {
    '<strong style="pointer-events:none">Site 1</strong>': L.layerGroup([]),
    'Site 1 - Parcel': overlays['Site 1 - Parcel'],
    'Site 1 - Zoning': overlays['Site 1 - Zoning'],
    'Site 1 - FEMA': overlays['Site 1 - FEMA'],
    'Site 1 - Wetlands': overlays['Site 1 - Wetlands'],
    'Site 1 - Floodplain': overlays['Site 1 - Floodplain'],

    '<strong style="pointer-events:none">Site 2</strong>': L.layerGroup([]),
    'Site 2 - Parcel': overlays['Site 2 - Parcel'],
    'Site 2 - Zoning': overlays['Site 2 - Zoning'],
    'Site 2 - FEMA': overlays['Site 2 - FEMA'],
    'Site 2 - Wetlands': overlays['Site 2 - Wetlands'],
    'Site 2 - Floodplain': overlays['Site 2 - Floodplain'],

    '<strong style="pointer-events:none">Global</strong>': L.layerGroup([]),
    'USA Future Land Use': overlays['USA Future Land Use'],
    'USA Expansion Area': overlays['USA Expansion Area'],
    
    'Walmart': overlays['Walmart'],
    'Schools': overlays['Schools']
  };

  L.control.layers(baseMaps, groupedOverlays, { collapsed: false }).addTo(map);

  setTimeout(() => {
    document.querySelectorAll('.leaflet-control-layers-overlays label').forEach(label => {
      if (label.innerHTML.includes('<strong')) {
        const checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.style.display = 'none';
      }
    });
  }, 50);
}, 2000);

// Sidebar control
function showSidebar(title, attributes) {
  const sidebar = document.getElementById('map-sidebar') || createSidebar();
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

function createSidebar() {
  const div = document.createElement('div');
  div.id = 'map-sidebar';
  div.style.position = 'absolute';
  div.style.top = '70px';
  div.style.left = '10px';
  div.style.width = '280px';
  div.style.maxHeight = '60vh';
  div.style.overflowY = 'auto';
  div.style.background = 'white';
  div.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
  div.style.borderRadius = '6px';
  div.style.padding = '12px';
  div.style.zIndex = '1000';
  div.style.display = 'none';
  document.body.appendChild(div);
  return div;
}