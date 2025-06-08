//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { getAllTrips, createTrip, getTripsByOrganizer, getTripsByParticipant } from "./api.js";
import { isLoggedIn, getCurrentUser } from "./auth.js";

//=============================================
// MAIN ENTRY POINT: VIEW RENDERER
//=============================================

export async function loadTrips(page = 1) {
  const app = document.getElementById('app');
  if (!app) return;

  if (!isLoggedIn()) {
    app.innerHTML = '<div class="alert alert-warning">Please log in to view your trips.</div>';
    return;
  }

  app.replaceChildren();
  app.className = 'trip-view';

  // Layout: Header + Button
  const container = createElement("div", { className: "container-fluid py-5 d-flex flex-column align-items-center" });
  const heading = createElement("h2", { className: "my-trips-heading" }, "🌍 My Trips");
  const newTripBtn = createElement("button", { className: "trip-add-btn" }, "+");
  container.append(heading, newTripBtn);

  // Trip List
  const list = createElement("div", { className: "trip-list d-flex flex-column align-items-center w-100 gap-3" });
  container.appendChild(list);
  app.appendChild(container);

  // Modal Handler: Trip Creation
  newTripBtn.addEventListener("click", () => {
    openTripModal(async (newTrip) => {
      const currentUser = getCurrentUser();
      const payload = {
        title: newTrip.title,
        description: newTrip.description || "",
        startDate: newTrip.from,
        endDate: newTrip.to,
        destination: newTrip.destination,
        organizerId: currentUser ? currentUser.id : 1, // Use real user ID
        status: "PLANNING",
        latitude: newTrip.latitude,
        longitude: newTrip.longitude
      };
      try {
        await createTrip(payload);
        await refreshTripList();
      } catch (err) {
        alert("Error creating trip: " + err.message);
      }
    });
  });

  //=============================================
  // TRIP-CARD LIST RENDERER
  //=============================================

  async function refreshTripList() {
    list.replaceChildren();
    let userTrips = [];
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('No user');
      // Fetch trips where user is organizer or participant
      const [organized, participating] = await Promise.all([
        getTripsByOrganizer(currentUser.id),
        getTripsByParticipant(currentUser.id)
      ]);
      // Merge and deduplicate by trip id
      const allTrips = [...organized, ...participating];
      const seen = new Set();
      userTrips = allTrips.filter(trip => {
        if (seen.has(trip.id)) return false;
        seen.add(trip.id);
        return true;
      });
    } catch (e) {
      list.appendChild(createElement("p", { className: "text-danger" }, "Fehler beim Laden der Trips."));
      return;
    }

    const tripsPerPage = 4;
    const totalPages = Math.ceil(userTrips.length / tripsPerPage);
    page = Math.min(Math.max(page, 1), totalPages);

    const startIndex = (page - 1) * tripsPerPage;
    const pageTrips = userTrips.slice(startIndex, startIndex + tripsPerPage);

    pageTrips.forEach((trip) => {
      const card = createElement("button", { type: "button", className: "trip-card btn btn-outline-dark w-100 py-5" },
        createElement("h1", { className: "mb-1" }, trip.title),
        createElement("small", {}, `${trip.startDate} - ${trip.endDate}`)
      );
      card.addEventListener("click", () => {
        window.location.hash = `trip/${trip.id}`;
      });
      list.appendChild(card);
    });

    // Pagination Controls
    if (totalPages > 1) {
      const pagination = createElement("div", { className: "d-flex justify-content-center gap-2 mt-3 flex-wrap" });
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = createElement("button", { className: `btn ${i === page ? "btn-dark" : "btn-outline-dark"} px-3` }, i.toString());
        pageBtn.addEventListener("click", () => {
          window.location.hash = `#trips?page=${i}`;
        });
        pagination.appendChild(pageBtn);
      }
      container.appendChild(pagination);
    }
  }

  //=============================================
  // MODAL RENDERER: CREATE TRIP
  //=============================================

  function openTripModal(onCreate) {
    // Remove any existing modal
    const existing = document.getElementById('tripModal');
    if (existing) existing.remove();

    // Modal structure
    const modal = createElement("div", { className: "modal fade", id: "tripModal", tabIndex: -1 });
    const dialog = createElement("div", { className: "modal-dialog" });
    const content = createElement("div", { className: "modal-content" });

    // Modal Header
    const header = createElement("div", { className: "modal-header" },
      createElement("h5", { className: "modal-title" }, "Create New Trip"),
      createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" })
    );

    // Modal Form
    const body = createElement("div", { className: "modal-body" });
    const form = createElement("form", { id: "tripForm", className: "d-flex flex-column gap-3" });

    const titleGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripTitle", className: "form-label" }, "Title:"),
      createElement("input", { type: "text", className: "form-control", id: "tripTitle", required: true })
    );

    const descGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripDescription", className: "form-label" }, "Description:"),
      createElement("textarea", { className: "form-control", id: "tripDescription" })
    );

    const destGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripDestination", className: "form-label" }, "Destination:"),
      createElement("input", { type: "text", className: "form-control", id: "tripDestination", required: true })
    );

    // Add small map for destination
    const mapDiv = createElement('div', { id: 'createTripMap', style: 'height: 200px; width: 100%; margin-bottom: 1rem; display: none;' });
    body.appendChild(mapDiv);
    let createTripMap, createTripMarker, selectedLat, selectedLon;

    // Listen for destination input changes
    setTimeout(() => {
      const destinationInput = document.getElementById('tripDestination');
      let debounceTimeout;
      destinationInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const query = e.target.value.trim();
        if (!query) {
          mapDiv.style.display = 'none';
          return;
        }
        debounceTimeout = setTimeout(async () => {
          try {
            const locations = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`).then(res => res.json());
            if (locations.length) {
              const loc = locations[0];
              selectedLat = loc.latitude;
              selectedLon = loc.longitude;
              mapDiv.style.display = 'block';
              if (!createTripMap) {
                createTripMap = L.map('createTripMap').setView([loc.latitude, loc.longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(createTripMap);
                createTripMarker = L.marker([loc.latitude, loc.longitude]).addTo(createTripMap);
              } else {
                createTripMap.setView([loc.latitude, loc.longitude], 13);
                createTripMarker.setLatLng([loc.latitude, loc.longitude]);
              }
            } else {
              mapDiv.style.display = 'none';
            }
          } catch {
            mapDiv.style.display = 'none';
          }
        }, 500); // 500ms debounce
      });
    }, 0);

    const fromGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripFrom", className: "form-label" }, "From:"),
      createElement("input", { type: "date", className: "form-control", id: "tripFrom", required: true })
    );

    const toGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripTo", className: "form-label" }, "To:"),
      createElement("input", { type: "date", className: "form-control", id: "tripTo", required: true })
    );

    const errorDiv = createElement("div", { id: "tripError", className: "text-danger mb-2", style: "display:none;" });

    const submitButton = createElement("button", { type: "submit", className: "btn btn-success" }, "Create");
    form.append(titleGroup, descGroup, destGroup, fromGroup, toGroup, errorDiv, submitButton);

    const footer = createElement("div", { className: "modal-footer" },
      createElement("button", { type: "button", className: "btn btn-secondary", "data-bs-dismiss": "modal" }, "Cancel")
    );

    body.appendChild(form);
    content.append(header, body, footer);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Bootstrap modal instance
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("tripTitle").value.trim();
      const description = document.getElementById("tripDescription").value.trim();
      const destination = document.getElementById("tripDestination").value.trim();
      const from = document.getElementById("tripFrom").value;
      const to = document.getElementById("tripTo").value;

      if (!title || !destination || !from || !to) {
        errorDiv.style.display = "block";
        errorDiv.textContent = "Please fill out all required fields.";
        return;
      }

      if (new Date(from) > new Date(to)) {
        errorDiv.style.display = "block";
        errorDiv.textContent = "The end date must be after the start date.";
        return;
      }

      errorDiv.style.display = "none";
      onCreate({ title, description, destination, from, to, latitude: selectedLat, longitude: selectedLon });
      bsModal.hide();
    });
  }

  await refreshTripList();
}