//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { getAllTrips, createTrip } from "./api.js";

//=============================================
// MAIN ENTRY POINT: VIEW RENDERER
//=============================================

export async function loadTrips(page = 1) {
    const app = document.getElementById('app');
    if (!app) return;

    app.replaceChildren();
    app.className = 'trip-view';
    
    // Layout: Header + Button
    const container = createElement("div", { className: "container-fluid py-5 d-flex flex-column align-items-center" });
    const heading = createElement("h2", { className: "display-5 fw-bold text-center mb-spacing" }, "My Trips");
    const newTripBtn = createElement("button", { className: "btn btn-success mb-4" }, "+");
    container.append(heading, newTripBtn);

    // Trip List
    const list = createElement("div", { className: "trip-list d-flex flex-column align-items-center w-100 gap-3" });
    container.appendChild(list);
    app.appendChild(container);

    // Modal Handler: Trip Creation
    newTripBtn.addEventListener("click", () => {
    openTripModal(async (newTrip) => {
      const payload = {
        title: newTrip.title,
        description: newTrip.description || "",
        startDate: newTrip.from,
        endDate: newTrip.to,
        destination: newTrip.destination,
        organizerId: 1, // TODO: mit echten ID's ersetzen sobald Session Handling da ist
        status: "PLANNING",
      };
      try {
        await createTrip(payload);
        await refreshTripList();
      } catch (err) {
        alert("Fehler beim Erstellen des Trips: " + err.message);
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
      userTrips = await getAllTrips();
    } catch (e) {
      list.appendChild(createElement("p", { className: "text-danger" }, "Fehler beim Laden der Trips."));
      return;
    }

    const tripsPerPage = 5;
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
    document.body.style.overflow = "hidden";
    const overlay = createElement("div", { id: "tripModal", className: "custom-modal" });
    const dialog = createElement("div", { className: "custom-modal-dialog" });

    // Modal Header
    const header = createElement("div", { className: "custom-modal-header d-flex justify-content-between align-items-center" },
      createElement("h5", { className: "modal-title" }, "Create New Trip"),
      createElement("button", { type: "button", className: "btn-close", id: "closeModalBtn", "aria-label": "Close" })
    );

    // Modal Form
    const body = createElement("div", { className: "custom-modal-body" });
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

    const fromGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripFrom", className: "form-label" }, "From:"),
      createElement("input", { type: "date", className: "form-control", id: "tripFrom", required: true })
    );

    const toGroup = createElement("div", { className: "mb-3" },
      createElement("label", { for: "tripTo", className: "form-label" }, "To:"),
      createElement("input", { type: "date", className: "form-control", id: "tripTo", required: true })
    );

    const errorDiv = createElement("div", { id: "tripError", className: "text-danger mb-2", style: "display:none;" });

    const footer = createElement("div", { className: "custom-modal-footer d-flex justify-content-end gap-2" },
      createElement("button", { type: "button", className: "btn btn-danger", id: "cancelTripBtn" }, "Cancel"),
      createElement("button", { type: "submit", className: "btn btn-success" }, "Create")
    );

    form.append(titleGroup, descGroup, destGroup, fromGroup, toGroup, errorDiv, footer);
    body.appendChild(form);
    dialog.append(header, body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function closeModal() {
      overlay.remove();
      document.body.style.overflow = "";
    }

    document.getElementById("closeModalBtn").addEventListener("click", closeModal);
    document.getElementById("cancelTripBtn").addEventListener("click", closeModal);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("tripTitle").value.trim();
      const description = document.getElementById("tripDescription").value.trim();
      const destination = document.getElementById("tripDestination").value.trim();
      const from = document.getElementById("tripFrom").value;
      const to = document.getElementById("tripTo").value;

      if (!title || !destination || !from || !to) {
        errorDiv.style.display = "block";
        errorDiv.textContent = "Bitte fülle alle Pflichtfelder aus.";
        return;
      }

      if (new Date(from) > new Date(to)) {
        errorDiv.style.display = "block";
        errorDiv.textContent = "Das Enddatum muss nach dem Startdatum liegen.";
        return;
      }

      errorDiv.style.display = "none";
      onCreate({ title, description, destination, from, to });
      closeModal();
    });
  }

  await refreshTripList();
}