//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { openAddLocationForm, openEditLocationForm } from "./locationModal.js";
import { openEditTripForm, openBuddiesModal } from "./tripModal.js";
import { getCurrentUser } from "./auth.js";
import { addPoiFilterPanel, setMapMarker, clearMapMarkers } from "./map.js";
import {
  getTripById,
  deleteTrip,
  getLocationsByTrip,
  createLocation,
  deleteLocation,
  searchPointsOfInterest,
  getUserByUsername,
  removeParticipantFromTrip,
  updateTrip
} from "./api.js";


app.replaceChildren();
app.className = 'trip-detail-view';

//=============================================
// MAIN EXPORT FUNCTION
//=============================================

export async function loadTripDetail(id) {

  //=============================================
  // INIT & CLEAR APP VIEW
  //=============================================

  const app = document.getElementById("app");
  if (!app) return;
  app.replaceChildren();
  document.body.className = "trip-detail-view";

  //=============================================
  // FETCH TRIP DATA
  //=============================================

  let trip;
  try {
    trip = await getTripById(id);
  } catch {
    app.appendChild(createElement("div", {}, "Trip not found."));
    return;
  }

  //=============================================
  // CHECK USER PERMISSION
  //=============================================
  const currentUser = getCurrentUser();
  const isOrganizer = trip.organizerId && currentUser && trip.organizerId === currentUser.id;
  const isParticipant = (trip.participantUsernames || []).includes(currentUser?.username);

  if (!isOrganizer && !isParticipant) {
    app.appendChild(createElement("div", { className: "alert alert-warning" }, "You do not have access to this trip."));
    return;
  }

  //=============================================
  // MAIN CONTAINER
  //=============================================

  const container = createElement("div", { className: "container" });
  const layout = createElement("div", { className: "trip-detail-layout" });
  container.appendChild(layout);

  //=============================================
  // INFO PANEL
  //=============================================

  const infoPanel = createElement("div", { className: "trip-detail-info" },
    createElement("h1", { id: "tripTitleDisplay" }, trip.title),
    createElement("p", { id: "tripInfoDisplay" }, `Destination: ${trip.destination}`,
      createElement("br"), `From: ${trip.startDate} - To: ${trip.endDate}`,
      createElement("br"), `Status: ${trip.status}`
    )
  );
  layout.appendChild(infoPanel);

  // Ensure Add Buddies button has click event
  const addBuddiesBtn = createElement("button", { className: "btn-add-buddies", id: "addBuddiesBtn" }, "+ Add Buddies...");
  addBuddiesBtn.onclick = () => openBuddiesModal(trip, () => loadTripDetail(trip.id));

  // Wrap buttons in trip-detail-actions for alignment
  const tripActions = createElement("div", { className: "trip-detail-actions" },
    createElement("button", { className: "btn-edit", id: "editTripBtn" }, "Edit"),
    createElement("button", { className: "btn-delete", id: "deleteTripBtn" }, "Delete"),
    addBuddiesBtn
  );
  infoPanel.appendChild(tripActions);

  //=============================================
  // BUDDIES SECTION
  //=============================================

  const buddiesSection = renderBuddiesSection(trip, currentUser, () => loadTripDetail(trip.id));
  infoPanel.appendChild(buddiesSection);

  //=============================================
  // MAP
  //=============================================

  const mapContainer = createElement("div", { id: "trip-map", className: "trip-detail-map" });
  layout.appendChild(mapContainer);

  //=============================================
  // LOCATION PANEL
  //=============================================

  const locationPanel = createElement("div", { className: "trip-detail-locations" },
    createElement("div", { className: "form-check mb-2" },
      createElement("input", { className: "form-check-input", type: "checkbox", id: "showLocationsCheckbox", checked: true }),
      createElement("label", { className: "form-check-label ms-1", htmlFor: "showLocationsCheckbox" }, "Show all visited locations on map")
    ),
    createElement("button", { className: "btn-add mb-2", id: "addLocationBtn" }, "Add Location"),
    createElement("div", { id: "locationsList" })
  );
  layout.appendChild(locationPanel);
  const locationsListDiv = locationPanel.querySelector("#locationsList");

  //=============================================
  // DESCRIPTION
  //=============================================

  const descriptionPanel = createElement("div", { className: "trip-detail-description" },
    createElement("div", { className: "d-flex justify-content-between align-items-center mb-2" },
      createElement("label", { htmlFor: "tripDescription", className: "form-label mb-0" }, "Trip Description:"),
      createElement("div", { className: "description-actions" },
        createElement("button", { 
          className: "btn btn-outline-primary btn-sm", 
          id: "editDescriptionBtn",
          style: "display: none;"
        }, "Edit"),
        createElement("button", { 
          className: "btn btn-primary btn-sm ms-2", 
          id: "saveDescriptionBtn",
          style: "display: none;"
        }, "Save")
      )
    ),
    createElement("div", { 
      id: "descriptionDisplay", 
      className: "trip-description-display"
    }, trip.description || ""),
    createElement("textarea", { 
      id: "tripDescription", 
      className: "trip-description-textarea", 
      placeholder: "Write something about your trip...",
      style: "display: none;"
    }, trip.description || "")
  );
  layout.appendChild(descriptionPanel);

  //=============================================
  // BACK BUTTON
  //=============================================

  container.appendChild(createElement("button", { className: "btn-back", onclick: () => (window.location.hash = "#trips") }, "← Back to Trips"));
  app.appendChild(container);

  //=============================================
  // EVENT LISTENERS
  //=============================================

  document.getElementById("editTripBtn").onclick = () => {
    openEditTripForm(trip, async () => loadTripDetail(trip.id));
  };

  document.getElementById("deleteTripBtn").onclick = async () => {
    if (!confirm("Do you really want to delete this trip?")) return;
    try {
      await deleteTrip(trip.id);
      window.location.hash = "#trips";
    } catch (e) {
      alert("Error deleting trip: " + e.message);
    }
  };

  document.getElementById("addLocationBtn").onclick = () => {
    openAddLocationForm(trip.id, loadAndRenderLocations);
  };

  // Description edit/save functionality
  const descriptionDisplay = document.getElementById("descriptionDisplay");
  const descriptionTextarea = document.getElementById("tripDescription");
  const editDescriptionBtn = document.getElementById("editDescriptionBtn");
  const saveDescriptionBtn = document.getElementById("saveDescriptionBtn");

  editDescriptionBtn.onclick = () => {
    descriptionDisplay.style.display = "none";
    descriptionTextarea.style.display = "block";
    descriptionTextarea.value = trip.description || "";
    editDescriptionBtn.style.display = "none";
    saveDescriptionBtn.style.display = "inline-block";
    descriptionTextarea.focus();
  };

  saveDescriptionBtn.onclick = async () => {
    const newText = descriptionTextarea.value.trim();
    try {
      // Include all required trip data in the update
      const updatedTrip = {
        ...trip,
        description: newText
      };
      await updateTrip(trip.id, updatedTrip);
      trip.description = newText;
      descriptionDisplay.textContent = newText || "No description available.";
      descriptionDisplay.style.display = "block";
      descriptionTextarea.style.display = "none";
      editDescriptionBtn.style.display = "inline-block";
      saveDescriptionBtn.style.display = "none";
    } catch (err) {
      alert("Failed to save description: " + err.message);
    }
  };

  // Show edit button if user is organizer or participant
  if (isOrganizer || isParticipant) {
    editDescriptionBtn.style.display = "inline-block";
  }

  //=============================================
  // LOAD LOCATIONS & RENDER
  //=============================================

  async function loadAndRenderLocations() {
    let locations = [];
    try {
      locations = await getLocationsByTrip(trip.id);
    } catch {
      locationsListDiv.replaceChildren(createElement("p", { style: "color:red" }, "Error loading locations."));
      return;
    }
    renderLocationsList(locations);
    initMapWithLocations(locations);
  }

  function renderLocationsList(locations) {
    locationsListDiv.replaceChildren();
    if (!locations.length) {
      locationsListDiv.appendChild(createElement("p", {}, "No locations available."));
      return;
    }
    locations.forEach((loc) => {
      const card = createElement(
        "div",
        { className: "card" },
        createElement("strong", {}, loc.name),
        createElement("br"),
        `${loc.type} | ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
        createElement("br"),
        loc.address || "",
        createElement("div", { style: "margin-top:.5rem" },
          createElement(
            "button",
            {
              className: "btn-edit-location",
              onclick: () => openEditLocationForm(loc, trip.id, loadAndRenderLocations)
            },
            "Edit"
          ),
          createElement(
            "button",
            {
              className: "btn-delete-location",
              style: "margin-left:.5rem",
              onclick: () => onDeleteLocation(loc.id)
            },
            "Delete"
          )
        )
      );
      locationsListDiv.appendChild(card);
    });
  }

  async function onDeleteLocation(locationId) {
    if (!confirm("Do you really want to delete this location?")) return;
    try {
      await deleteLocation(locationId);
      await loadAndRenderLocations();
    } catch (e) {
      alert("Error deleting location: " + e.message);
    }
  }

  //=============================================
  // MAP
  //=============================================

  async function initMapWithLocations(locations) {
    if (window.tripDetailMap) window.tripDetailMap.remove();

    let center = [trip.latitude || 0, trip.longitude || 0];
    if (locations.length) center = [locations[0].latitude, locations[0].longitude];

    const map = L.map("trip-map").setView(center, center[0] ? 13 : 2);
    window.tripDetailMap = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // Main destination marker
    if (trip.latitude && trip.longitude) {
      L.marker([trip.latitude, trip.longitude])
        .addTo(map)
        .bindPopup(`<strong>${trip.destination}</strong> (Destination)`);
    }

    // Location markers toggle
    let locationMarkers = [];
    function showLocationMarkers(show) {
      locationMarkers = clearMapMarkers(map, locationMarkers);
      if (!show) return;
      locations.forEach((loc) => {
        const marker = setMapMarker(
          map,
          loc.latitude,
          loc.longitude,
          `<strong>${loc.name}</strong><br>${loc.address || ""}`,
          null,
          (loc.type || "default").toLowerCase()
        );
        locationMarkers.push(marker);
      });
    }
    showLocationMarkers(true);
    document.getElementById("showLocationsCheckbox").onchange = (e) => showLocationMarkers(e.target.checked);

    // POIs
    let poiMarkers = [];
    let currentTypes = [];
    let currentRadius = 1000;

    addPoiFilterPanel(map, (types, radius) => {
      currentTypes = types;
      currentRadius = radius;
      loadPois();
    });

    async function loadPois() {
      poiMarkers = clearMapMarkers(map, poiMarkers);
      if (!trip.latitude || !trip.longitude || !currentTypes.length) return;

      const pois = await searchPointsOfInterest({
        latitude: trip.latitude,
        longitude: trip.longitude,
        radius: currentRadius,
        types: currentTypes
      });

      pois.forEach((p) => {
        const popupContent = `
          <strong>${p.name}</strong><br>
          Type: ${p.type}<br>
          ${p.address || ""}<br>
          <button
            class="btn-add-poi"
            data-name="${encodeURIComponent(p.name)}"
            data-lat="${p.latitude}"
            data-lon="${p.longitude}"
            data-type="${encodeURIComponent(p.type)}"
            data-address="${encodeURIComponent(p.address || "")}"
          >Add to Trip</button>
        `;

        const m = setMapMarker(
          map,
          p.latitude,
          p.longitude,
          popupContent,
          null,
          (p.type || "default").toLowerCase()
        );
        poiMarkers.push(m);
      });
    }

    // Handle Add to Trip clicks inside POI popups
    map.on("popupopen", (e) => {
      const btn = e.popup._contentNode.querySelector(".btn-add-poi");
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

    // Initial POI load
    loadPois();
  }

  // ---------- START ----------
  await loadAndRenderLocations();
}

//=============================================
// RENDER BUDDIES SECTION
//=============================================

function renderBuddiesSection(trip, currentUser, onReload) {
  const section = createElement(
    "div",
    { className: "buddy-section"},
    createElement("label", {}, "Your Buddies for this trip:  ")
  );

  const list = createElement("div");
  const organizerUsername = trip.organizerUsername;

  (trip.participantUsernames || []).forEach((u) => {
    const isSelf = u === currentUser?.username;
    const isOrganizer = u === organizerUsername;

    const badge = createElement(
      "span",
      {
        className: `badge position-relative ${isSelf ? "buddy-badge-self" : "buddy-badge"}`
      },
      isSelf ? `${u} (You)` : u
    );

    // Show remove button for non-organizer/non-self participants
    if (!isOrganizer && !isSelf) {
      const removeBtn = createElement(
        "button",
        {
          type: "button",
          className: "btn-remove-buddies",
          title: "Remove from trip",
          onclick: async (e) => {
            e.stopPropagation();
            if (!confirm(`Remove ${u} from this trip?`)) return;
            try {
              const user = await getUserByUsername(u);
              const updatedTrip = {
                ...trip,
                participantUsernames: trip.participantUsernames.filter(username => username !== u)
              };
              await updateTrip(trip.id, updatedTrip);
              onReload();
            } catch (err) {
              alert("Failed to remove buddy: " + err.message);
            }
          }
        },
        "×"
      );
      badge.appendChild(removeBtn);
    }

    list.appendChild(badge);
  });

  section.appendChild(list);
  return section;
}