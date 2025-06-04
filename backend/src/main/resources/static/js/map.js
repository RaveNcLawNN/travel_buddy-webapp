//=============================================
// ICON DEFINTIIONS BY POI TYPE
//=============================================

const typeToAwesomeIcon = {
  restaurant: { icon: 'cutlery', color: 'red' },
  cafe: { icon: 'coffee', color: 'orange' },
  bar: { icon: 'martini-glass', color: 'darkred' },
  pub: { icon: 'beer', color: 'darkgreen' },
  theatre: { icon: 'music', color: 'purple' },
  parking: { icon: 'car', color: 'cadetblue' },
  hotel: { icon: 'bed', color: 'blue' },
  hostel: { icon: 'home', color: 'blue' },
  museum: { icon: 'university', color: 'darkblue' },
  attraction: { icon: 'star', color: 'green' },
  viewpoint: { icon: 'binoculars', color: 'green' },
  information: { icon: 'info-circle', color: 'darkpurple' },
  park: { icon: 'tree', color: 'green' },
  playground: { icon: 'child', color: 'green' },
  monument: { icon: 'landmark', color: 'darkred' },
  castle: { icon: 'chess-rook', color: 'darkblue' },
  memorial: { icon: 'cross', color: 'purple' },
  ruins: { icon: 'archway', color: 'darkred' },
  default: { icon: 'map-marker', color: 'blue' }
};

//=============================================
// BASIC MAP INITIALIZATION
//=============================================

export function createMap(containerId, center = [20, 0], zoom = 2) {
  const map = L.map(containerId).setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  return map;
}

//=============================================
// MARKER MANAGEMENMT
//=============================================

// Adds or updates a map marker
export function setMapMarker(map, lat, lon, popupContent = '', existingMarker = null, type = 'default') {
  const iconDef = typeToAwesomeIcon[type] || typeToAwesomeIcon.default;
  const icon = L.AwesomeMarkers.icon({
    icon: iconDef.icon,
    prefix: 'fa',
    markerColor: iconDef.color
  });

  if (existingMarker) {
    existingMarker.setLatLng([lat, lon]).setPopupContent(popupContent).setIcon(icon);
    return existingMarker;
  }

  return L.marker([lat, lon], { icon })
    .addTo(map)
    .bindPopup(popupContent);
}

// Removes all markers from the map
export function clearMapMarkers(map, markersArray = []) {
  markersArray.forEach(marker => map.removeLayer(marker));
  return [];
}

// Adjusts map bounds to fit all given markers - I don't like it tho, so it's commented out in home.js 139 (try out yourselves)
export function fitMapToMarkers(map, markers) {
  if (!markers.length) return;
  const bounds = markers.map(marker => marker.getLatLng());
  map.fitBounds(bounds, { padding: [50, 50] });
}

//=============================================
// POI FILTER PANEL (CHECKBOXES)
//=============================================

// Adds a collapsable POI filter panel
export function addPoiFilterPanel(map, onFiltersChanged) {
  const categories = {
    Amenity: ['restaurant', 'cafe', 'theatre', 'bar', 'pub', 'parking'],
    Tourism: ['hotel', 'museum', 'attraction', 'viewpoint', 'hostel', 'information'],
    Leisure: ['park', 'playground'],
    Historic: ['monument', 'castle', 'memorial', 'ruins']
  };

  const container = L.control({ position: 'topright' });

  container.onAdd = () => {
    const wrapper = L.DomUtil.create('div', 'leaflet-control-layers leaflet-bar');
    wrapper.style.background = 'white';
    wrapper.style.border = 'none';

    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn btn-outline-dark btn-sm w-100';
    toggleButton.setAttribute('data-bs-toggle', 'collapse');
    toggleButton.setAttribute('data-bs-target', '#poiFilterPanel');
    toggleButton.textContent = 'Filter';

    // Collapsable panel
    const panel = document.createElement('div');
    panel.className = 'collapse mt-2 card shadow-sm bg-light p-2';
    panel.id = 'poiFilterPanel';
    panel.style.width = '230px';

    // Radius slider
    const radiusLabel = document.createElement('label');
    radiusLabel.textContent = 'Search Radius (km)';
    radiusLabel.className = 'form-label';

    const radiusValue = document.createElement('div');
    radiusValue.className = 'mb-2 text-end fw-bold';
    radiusValue.textContent = '1';

    const radiusSlider = document.createElement('input');
    radiusSlider.type = 'range';
    radiusSlider.className = 'form-range';
    radiusSlider.min = '1';
    radiusSlider.max = '5';
    radiusSlider.step = '0.1';
    radiusSlider.value = '1.0';

    radiusSlider.addEventListener('input', () => {
      radiusValue.textContent = radiusSlider.value;
    });

    radiusSlider.addEventListener('change', () => {
      fireChange();
    })

    panel.appendChild(radiusLabel);
    panel.appendChild(radiusSlider);
    panel.appendChild(radiusValue);

    // Add checkboxes by category
    Object.entries(categories).forEach(([cat, types]) => {
      const collapseId = `collapse-${cat}`;

      const group = document.createElement('div');
      group.classList.add('mb-2');

      const button = document.createElement('button');
      button.className = 'btn btn-sm btn-outline-secondary w-100 text-start';
      button.type = 'button';
      button.setAttribute('data-bs-toggle', 'collapse');
      button.setAttribute('data-bs-target', `#${collapseId}`);
      button.textContent = cat;

      const collapseDiv = document.createElement('div');
      collapseDiv.className = 'collapse mt-1';
      collapseDiv.id = collapseId;

      types.forEach(type => {
        const checkWrapper = document.createElement('div');
        checkWrapper.className = 'form-check';

        const checkbox = document.createElement('input');
        checkbox.className = 'form-check-input poi-filter';
        checkbox.type = 'checkbox';
        checkbox.value = type;
        checkbox.id = `filter-${type}`;
        checkbox.checked = false;

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `filter-${type}`;
        label.textContent = type.charAt(0).toUpperCase() + type.slice(1);

        checkWrapper.appendChild(checkbox);
        checkWrapper.appendChild(label);
        collapseDiv.appendChild(checkWrapper);
      });

      group.appendChild(button);
      group.appendChild(collapseDiv);
      panel.appendChild(group);
    });

    // collects filters and radius
    function fireChange() {
      const selected = Array.from(panel.querySelectorAll('.poi-filter:checked')).map(cb => cb.value);
      const radiusInMeters = parseFloat(radiusSlider.value) * 1000;
      onFiltersChanged(selected, radiusInMeters);
    }

    // Handle changes
    panel.addEventListener('change', () => {
      fireChange();
    });

    L.DomEvent.disableClickPropagation(wrapper);

    wrapper.appendChild(toggleButton);
    wrapper.appendChild(panel);
    return wrapper;
  };

  container.addTo(map);
}