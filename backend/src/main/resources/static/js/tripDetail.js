//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { getTripById, deleteTrip, updateTrip, getBuddiesForUser } from "./api.js";
import { getLocationsByTrip, createLocation, updateLocation, deleteLocation } from "./api.js";
import { openAddLocationForm, openEditLocationForm } from "./locationModal.js";
import { openEditTripForm } from "./tripModal.js";
import { getCurrentUser } from "./auth.js";

//=============================================
// MAIN EXPORT
//=============================================

export async function loadTripDetail(id) {
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

  // Buddies for this trip (only actual buddies)
  let buddies = [];
  if (currentUser) {
    const allBuddies = await getBuddiesForUser(currentUser.username);
    const buddyUsernames = allBuddies.map(b => b.username);
    buddies = (trip.participantUsernames || []).filter(u => buddyUsernames.includes(u));
  }
  const buddiesSection = createElement("div", { className: "mb-3" },
    createElement("label", { className: "form-label" }, "Buddies for this trip:"),
    buddies.length
      ? createElement("div", {}, ...buddies.map(u => createElement("span", { className: "badge bg-info text-dark me-1" }, u)))
      : createElement("span", { className: "text-muted" }, "No buddies added yet.")
  );
  container.appendChild(buddiesSection);

  // Header: Title, Date, Status, Delete-Btn, Edit-Btn
  const header = createElement("div", { className: "d-flex justify-content-between align-items-center mb-4" },
    createElement("div", { id: "tripDetailsContainer" },
      createElement("h2", { className: "mb-1", id: "tripTitleDisplay" }, trip.title),
      createElement("p", { id: "tripInfoDisplay" }, `Destination: ${trip.destination}`,
        createElement("br"), `From: ${trip.startDate} - To: ${trip.endDate}`,
        createElement("br"), `Status: ${trip.status}`)
    ),
    createElement("div", { id: "editDeleteBtn" },
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
    openEditTripForm(trip, async () => {
      await loadTripDetail(trip.id);
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
  function initMapWithLocations(locations) {
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
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);

    // Always add the trip's city marker if coordinates exist
    if (trip.latitude && trip.longitude) {
      L.marker([trip.latitude, trip.longitude])
        .addTo(map)
        .bindPopup(`<strong>${trip.destination}</strong><br>(Destination)`);
    }

    if (locations.length > 0) {
      const bounds = [];
      locations.forEach((loc) => {
        L.marker([loc.latitude, loc.longitude])
          .addTo(map)
          .bindPopup(`<strong>${loc.name}</strong><br>${loc.address || ""}`);
        bounds.push([loc.latitude, loc.longitude]);
      });
      bounds.push([trip.latitude, trip.longitude]); // include city marker in bounds
      map.fitBounds(bounds, { padding: [50, 50] });
    }
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
          createElement("button", { className: "btn btn-sm btn-warning me-2", onclick: () => openEditLocationForm(loc) }, "Edit"),
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