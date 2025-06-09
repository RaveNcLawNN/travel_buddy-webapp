//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { openAddLocationForm, openEditLocationForm } from "./locationModal.js";
import { openEditTripForm, openBuddiesModal } from "./tripModal.js";
import { getCurrentUser } from "./auth.js";
import { addPoiFilterPanel, setMapMarker, clearMapMarkers } from "./map.js";
import {getTripById, deleteTrip, updateTrip, getBuddiesForUser, getLocationsByTrip, createLocation, updateLocation, deleteLocation, searchPointsOfInterest } from "./api.js";

//=============================================
// MAIN EXPORT
//=============================================

export async function loadTripDetail(id) {
  let poiMarkers = [];
  let currentTypes = [];
  let currentRadius = 1000;

  const app = document.getElementById("app");
  if (!app) return;
  app.replaceChildren();
  document.body.className = "trip-detail-view";

  //=============================================
  // 1) LOAD TRIP FROM BE
  //=============================================

  let trip;
  try {
    trip = await getTripById(id);
  } catch {
    app.appendChild(createElement("div", {}, "Trip not found."));
    return;
  }

  let tripCoords = {
    lat: trip.latitude,
    lon: trip.longitude
  };

  //=============================================
  // 1.5) CHECK USER PERMISSION
  //=============================================
  const currentUser = getCurrentUser();
  const isOrganizer = trip.organizerId && currentUser && trip.organizerId === currentUser.id;
  const isParticipant = (trip.participantUsernames || []).includes(currentUser?.username);
  if (!isOrganizer && !isParticipant) {
    app.appendChild(createElement("div", { className: "alert alert-warning" }, "You do not have access to this trip."));
    return;
  }

  //=============================================
  // 2) CONTAINER BUILD
  //=============================================

  const container = createElement("div", { className: "container py-5" });

  // Buddies for this trip (all participants)
  const buddies = trip.participantUsernames || [];
  const organizerUsername = trip.organizerUsername;
  const buddiesSection = createElement("div", { className: "mb-3" },
    createElement("label", { className: "form-label" }, "Your Buddies for this trip:"),
    buddies.length
      ? createElement("div", {}, ...buddies.map(u => {
          const isOrganizer = u === organizerUsername;
          const isCurrentUser = u === currentUser?.username;
          const badge = createElement("span", {
            className: `badge ${isCurrentUser ? 'bg-danger' : 'bg-info'} text-white me-1 position-relative`,
            title: isOrganizer ? "Trip Organizer" : ""
          }, isCurrentUser ? `${u} (You)` : u);
          // Add remove 'x' button if not organizer or current user
          if (!isOrganizer && !isCurrentUser) {
            const removeBtn = createElement("button", {
              type: "button",
              className: "buddy-remove-btn position-absolute",
              style: `
                top: -10px;
                right: -4px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background:rgba(196, 39, 39, 0.86);
                color: #fff;
                border: none;
                font-size: 1.1em;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                cursor: pointer;
                z-index: 2;`,
              title: "Remove from trip",
              onclick: async (e) => {
                e.stopPropagation();
                if (!confirm(`Remove ${u} from this trip?`)) return;
                try {
                  // Find userId for username (fetch from backend)
                  const res = await fetch(`/api/users/${u}`);
                  if (!res.ok) throw new Error('User not found');
                  const user = await res.json();
                  await fetch(`/api/trips/${trip.id}/participants/${user.id}`, { method: 'DELETE' });
                  await loadTripDetail(trip.id);
                } catch (err) {
                  alert('Failed to remove buddy: ' + err.message);
                }
              }
            }, '×');
            badge.appendChild(removeBtn);
          }
          return badge;
        }))
      : createElement("span", { className: "text-muted" }, "No buddies added yet.")
  );
  container.appendChild(buddiesSection);

  // Header: Title, Date, Status, Delete-Btn, Edit-Btn
  const addBuddiesBtn = createElement("button", {
    className: "btn btn-success me-2 d-flex align-items-center justify-content-center",
    id: "addBuddiesBtn",
    style: "height: 38px; min-width: 140px;"
  }, createElement('span', {className: 'me-1'}, '+'), 'Add Buddies...');

  addBuddiesBtn.onclick = () => {
    openBuddiesModal(trip, () => loadTripDetail(trip.id));
  };

  const header = createElement("div", { className: "d-flex justify-content-between align-items-center mb-4" },
    createElement("div", { id: "tripDetailsContainer" },
      createElement("h2", { className: "mb-1", id: "tripTitleDisplay" }, trip.title),
      createElement("p", { id: "tripInfoDisplay" }, `Destination: ${trip.destination}`,
        createElement("br"), `From: ${trip.startDate} - To: ${trip.endDate}`,
        createElement("br"), `Status: ${trip.status}`)
    ),
    createElement("div", { id: "editDeleteBtn", className: "d-flex align-items-center" },
      addBuddiesBtn,
      createElement("button", { className: "btn btn-warning me-2", id: "editTripBtn" }, "Edit Trip"),
      createElement("button", { className: "btn btn-danger", id: "deleteTripBtn" }, "Delete Trip")
    )
  );
  container.appendChild(header);

  // Map Container
  const mapContainer = createElement("div", { id: "trip-map", style: "height: 400px; margin-bottom: 1rem; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" });
  container.appendChild(mapContainer);

  // Add Location-Btn
  const addLocBtn = createElement("button", { className: "btn btn-primary mb-3", id: "addLocationBtn" }, "Add Location");
  container.appendChild(addLocBtn);

  // Location List
  const locationsListDiv = createElement("div", { id: "locationsList" });
  container.appendChild(locationsListDiv);

  // Back-Btn
  const backBtn = createElement("button", { className: "btn btn-secondary mt-4", onclick: () => { window.location.hash = "#trips"; } }, "← Back to Trips");
  container.appendChild(backBtn);
  app.appendChild(container);

  // Edit-Btn
  document.getElementById("editTripBtn").addEventListener("click", () => {
    getTripById(trip.id).then(freshTrip => {
      openEditTripForm(freshTrip, async () => {
        await loadTripDetail(trip.id);
      });
    });
  });

  //=============================================
  // 3) LOAD LOCATIONS & RENDER
  //=============================================

  async function loadAndRenderLocations() {
    let locations = [];
    try {
      locations = await getLocationsByTrip(trip.id);
    } catch {
      locationsListDiv.appendChild(
        createElement("p", { className: "text-danger" }, "Error loading locations.")
      );
      return;
    }
    renderLocationsList(locations);
    initMapWithLocations(locations);
  }

  // Initialize Map
  async function initMapWithLocations(locations) {
  if (window.tripDetailMap) {
    window.tripDetailMap.remove();
  }

  let mapCenter = [0, 0];
  let zoom = 2;
  if (locations.length > 0) {
    mapCenter = [locations[0].latitude, locations[0].longitude];
    zoom = 13;
  } else if (trip.latitude && trip.longitude) {
    mapCenter = [trip.latitude, trip.longitude];
    zoom = 13;
  }

  const map = L.map("trip-map").setView(mapCenter, zoom);
  window.tripDetailMap = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const tripCoords = { lat: trip.latitude, lon: trip.longitude };
  if (trip.latitude && trip.longitude) {
    L.marker([trip.latitude, trip.longitude])
      .addTo(map)
      .bindPopup(`<strong>${trip.destination}</strong><br>(Destination)`);
  }

  let poiMarkers = [];
  let currentTypes = [];
  let currentRadius = 1000;

  addPoiFilterPanel(map, (selectedTypes, radius) => {
    currentTypes = selectedTypes;
    currentRadius = radius;
    loadPois(tripCoords.lat, tripCoords.lon);
  });

  // Hilfsfunk­tion zum Laden und Darstellen der POIs
  async function loadPois(lat, lon) {
    poiMarkers = clearMapMarkers(map, poiMarkers);
    if (!currentTypes.length) return;

    try {
      const pois = await searchPointsOfInterest({
        latitude: lat,
        longitude: lon,
        radius: currentRadius,
        types: currentTypes
      });

      pois.forEach(poi => {
        const popupContent = `
          <strong>${poi.name}</strong><br>
          Type: ${poi.type}<br>
          Address: ${poi.address || '–'}<br>
          <button
            class="btn btn-sm btn-primary add-poi-btn"
            data-name="${encodeURIComponent(poi.name)}"
            data-lat="${poi.latitude}"
            data-lon="${poi.longitude}"
            data-type="${encodeURIComponent(poi.type)}"
            data-address="${encodeURIComponent(poi.address || '')}"
          >Add to Trip</button>
        `;
        const marker = setMapMarker(
          map,
          poi.latitude,
          poi.longitude,
          popupContent,
          null,
          (poi.type || "default").toLowerCase()
        );
        poiMarkers.push(marker);
      });
    } catch (err) {
      console.error("Failed to load POIs:", err);
    }
  }

  // Event-Listener für „Add to Trip“-Buttons in Popups
  map.on("popupopen", e => {
    const btn = e.popup._contentNode.querySelector(".add-poi-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const payload = {
        name: decodeURIComponent(btn.dataset.name),
        latitude: parseFloat(btn.dataset.lat),
        longitude: parseFloat(btn.dataset.lon),
        type: decodeURIComponent(btn.dataset.type),
        address: decodeURIComponent(btn.dataset.address)
      };

      try {
        await createLocation(trip.id, payload);
        await loadAndRenderLocations();
        map.closePopup();
      } catch (err) {
        alert("Error adding location: " + err.message);
      }
    });
  });

  // Initialer POI-Load (wird erst nach Filter-Auswahl wirklich aktive Marker setzen)
  loadPois(tripCoords.lat, tripCoords.lon);
}

  // Render Location-List
  function renderLocationsList(locations) {
    locationsListDiv.replaceChildren();
    if (locations.length === 0) {
      locationsListDiv.appendChild(createElement("p", {}, "No locations available."));
      return;
    }
    locations.forEach((loc) => {
      const card = createElement("div", { className: "card mb-3" },
        createElement("div", { className: "card-body" },
          createElement("h5", { className: "card-title" }, loc.name),
          createElement("p", { className: "card-text" }, `Type: ${loc.type}`,
            createElement("br"), `Lat: ${loc.latitude}, Lon: ${loc.longitude}`,
            createElement("br"), `Address: ${loc.address || ""}`),
          createElement("p", { className: "card-text" }, loc.description || ""),
          createElement("button", { className: "btn btn-sm btn-warning me-2", 
            onclick: () => openEditLocationForm(loc, trip.id, async () => { await loadAndRenderLocations(); }) }, "Edit"),
          createElement("button", { className: "btn btn-sm btn-danger", onclick: () => onDeleteLocation(loc.id) }, "Delete"))
      );
      locationsListDiv.appendChild(card);
    });
  }

  // Delete Location
  async function onDeleteLocation(locationId) {
    if (!confirm("Do you really want to delete this location?")) return;
    try {
      await deleteLocation(locationId);
      await loadAndRenderLocations();
    } catch (e) {
      alert("Error deleting location: " + e.message);
    }
  }

  // Delete Trip
  document.getElementById("deleteTripBtn").addEventListener("click", async () => {
    if (!confirm("Do you really want to delete this trip?")) return;
    try {
      await deleteTrip(trip.id);
      window.location.hash = "#trips";
    } catch (e) {
      alert("Error deleting trip: " + e.message);
    }
  });

  // Add Location
  document.getElementById("addLocationBtn").addEventListener("click", () => {
    openAddLocationForm(trip.id, async () => {
      await loadAndRenderLocations();
    });
  });

  // Initial Location Load
  await loadAndRenderLocations();
}