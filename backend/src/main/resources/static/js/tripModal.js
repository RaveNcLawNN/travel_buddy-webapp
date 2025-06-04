//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { updateTrip, searchLocation } from "./api.js";

//=============================================
// MODAL ENTRY POINT: EDIT TRIP
//=============================================

export function openEditTripForm(trip, onSubmitCallback) {
    document.body.style.overflow = "hidden";

    // Overlay & Modal
    const overlay = createElement("div", { className: "custom-modal" });
    const dialog = createElement("div", { className: "custom-modal-dialog" });

    // Header
    const header = createElement("div", { className: "custom-modal-header d-flex justify-content-between align-items-center" },
        createElement("h5", { className: "modal-title" }, "Edit Trip"),
        createElement("button", { type: "button", className: "btn-close", id: "closeEditTripBtn", "aria-label": "Close" })
    );

    // Body & Form
    const body = createElement("div", { className: "custom-modal-body" });
    const form = createElement("form", { id: "editTripForm", className: "d-flex flex-column gap-3" });

    const title = createElement("input", { type: "text", className: "form-control", id: "tripTitle", value: trip.title || "", required: true });
    const destination = createElement("input", { type: "text", className: "form-control", id: "tripDestination", value: trip.destination || "", required: true });
    const startDate = createElement("input", { type: "date", className: "form-control", id: "tripStartDate", value: trip.startDate || "", required: true });
    const endDate = createElement("input", { type: "date", className: "form-control", id: "tripEndDate", value: trip.endDate || "", required: true });

    const status = createElement("select", { className: "form-select", id: "tripStatus", required: true },
        ...["PLANNING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"].map(s =>
            createElement("option", { value: s, selected: trip.status === s }, s)
        )
    );

    const errorDiv = createElement("div", { className: "text-danger", style: "display:none;" });

    // Footer
    const footer = createElement("div", { className: "custom-modal-footer d-flex justify-content-end gap-2" },
        createElement("button", { type: "button", className: "btn btn-secondary", id: "cancelEditTripBtn" }, "Cancel"),
        createElement("button", { type: "submit", className: "btn btn-success" }, "Save")
    );

    form.append(
        createFormGroup("Trip Title", title),
        createFormGroup("Destination", destination),
        createFormGroup("Start Date", startDate),
        createFormGroup("End Date", endDate),
        createFormGroup("Status", status),
        errorDiv,
        footer
    );

    body.appendChild(form);
    dialog.append(header, body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

//=============================================
// MODAL EVENT HANDLERS
//=============================================

    function closeModal() {
        overlay.remove();
        document.body.style.overflow = "";
    }

    document.getElementById("closeEditTripBtn").addEventListener("click", closeModal);
    document.getElementById("cancelEditTripBtn").addEventListener("click", closeModal);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedTrip = {
            ...trip,
            title: title.value.trim(),
            destination: destination.value.trim(),
            startDate: startDate.value,
            endDate: endDate.value,
            status: status.value
        };

        if (!updatedTrip.title || !updatedTrip.destination || !updatedTrip.startDate || !updatedTrip.endDate || !updatedTrip.status) {
            errorDiv.textContent = "All fields are required.";
            errorDiv.style.display = "block";
            return;
        }

        try {

            // Geolookup: Fetch coordinates using the new destination
            const geoResults = await searchLocation(updatedTrip.destination);

            if (!geoResults.length) {
                errorDiv.textContent = "Unable to find coordinates for the destination.";
                errorDiv.style.display = "block";
                return;
            }

            const { latitude, longitude } = geoResults[0];
            updatedTrip.latitude = latitude;
            updatedTrip.longitude = longitude;

            // Send updated trip to BE
            console.log("Sending updated trip:", updatedTrip);
            await updateTrip(updatedTrip.id, updatedTrip);

            closeModal();
            onSubmitCallback();
        } catch (err) {
            alert("Failed to update trip: " + err.message);
        }
    });
}

//=============================================
// HELPER FUNCTIONS
//=============================================

function createFormGroup(labelText, inputElement) {
    return createElement("div", { className: "mb-3" },
        createElement("label", { className: "form-label" }, labelText),
        inputElement
    );
}
