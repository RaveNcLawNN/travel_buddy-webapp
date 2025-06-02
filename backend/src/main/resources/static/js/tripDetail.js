//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { getTripById, deleteTrip } from "./api.js";
import { getLocationsByTrip, createLocation, updateLocation, deleteLocation } from "./api.js";
import { openAddLocationForm, openEditLocationForm } from "./locationModal.js";

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
  // 2) CONTAINER BUILD
  //=============================================

  const container = createElement("div", { className: "container py-5" });

  // Header: Title, Date, Status, Delete-Btn
  const header = createElement("div", { className: "d-flex justify-content-between align-items-center mb-4" },
    createElement("div", {},
      createElement("h2", { className: "mb-1" }, trip.title),
      createElement("p", {}, `Destination: ${trip.destination}`,
        createElement("br"), `From: ${trip.startDate} - To: ${trip.endDate}`,
        createElement("br"), `Status: ${trip.status}`)
    ),
    createElement("button", { className: "btn btn-danger", id: "deleteTripBtn" }, "Delete Trip")
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
  const backBtn = createElement("button", { className: "btn btn-secondary mt-4", onclick: () => { window.location.hash = "#trips"; }}, "← Back to Trips");
  container.appendChild(backBtn);
  app.appendChild(container);

  //=============================================
  // 3) LOAD LOCATIONS & RENDER
  //=============================================

  async function loadAndRenderLocations() {
    let locations = [];
    try {
      locations = await getLocationsByTrip(trip.id);
    } catch {
      locationsListDiv.appendChild(
        createElement("p", { className: "text-danger" }, "Fehler beim Laden der Locations.")
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
    const map = L.map("trip-map").setView([0, 0], 2);
    window.tripDetailMap = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);

    if (locations.length > 0) {
      const bounds = [];
      locations.forEach((loc) => {
        L.marker([loc.latitude, loc.longitude])
          .addTo(map)
          .bindPopup(`<strong>${loc.name}</strong><br>${loc.address || ""}`);
        bounds.push([loc.latitude, loc.longitude]);
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([0, 0], 2);
    }
  }

  // Render Location-List
  function renderLocationsList(locations) {
    locationsListDiv.replaceChildren();
    if (locations.length === 0) {
      locationsListDiv.appendChild(createElement("p", {}, "Keine Locations vorhanden."));
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
    if (!confirm("Möchtest du diese Location wirklich löschen?")) return;
    try {
      await deleteLocation(locationId);
      await loadAndRenderLocations();
    } catch (e) {
      alert("Fehler beim Löschen der Location: " + e.message);
    }
  }

  // Delete Trip
  document.getElementById("deleteTripBtn").addEventListener("click", async () => {
    if (!confirm("Möchtest du diesen Trip wirklich löschen?")) return;
    try {
      await deleteTrip(trip.id);
      window.location.hash = "#trips";
    } catch (e) {
      alert("Fehler beim Löschen des Trips: " + e.message);
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