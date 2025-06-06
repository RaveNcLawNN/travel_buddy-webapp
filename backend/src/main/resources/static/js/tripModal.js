//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { updateTrip, searchLocation, getBuddiesForUser } from "./api.js";
import { getCurrentUser } from "./auth.js";

//=============================================
// MODAL ENTRY POINT: EDIT TRIP
//=============================================

export function openEditTripForm(trip, onSubmitCallback) {
    document.body.style.overflow = "hidden";

    // Overlay & Modal
    const modal = createElement("div", { 
        className: "modal fade", 
        id: "editTripModal",
        tabIndex: -1
    });
    const dialog = createElement("div", { className: "modal-dialog" });
    const content = createElement("div", { className: "modal-content" });

    // Header
    const header = createElement("div", { className: "modal-header" },
        createElement("h5", { className: "modal-title" }, "Edit Trip"),
        createElement("button", { 
            type: "button", 
            className: "btn-close", 
            "data-bs-dismiss": "modal",
            "aria-label": "Close" 
        })
    );

    // Body & Form
    const body = createElement("div", { className: "modal-body" });
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

    // Buddies Multi-Select Section
    const buddiesSection = createElement("div", { className: "mb-3" });
    const buddiesLabel = createElement("label", { className: "form-label" }, "Your Buddies for this trip: ");
    const buddiesList = createElement("div", { className: "mb-2", id: "tripBuddiesList" });
    const addBuddiesBtn = createElement("button", { type: "button", className: "btn btn-outline-primary btn-sm mb-2" }, "Add Buddies...");
    buddiesSection.append(buddiesLabel, buddiesList, addBuddiesBtn);

    // State for selected buddies
    let selectedBuddies = Array.isArray(trip.participantUsernames) ? [...trip.participantUsernames] : [];

    // Helper to render selected buddies
    function renderSelectedBuddies() {
        const currentUser = getCurrentUser();
        const filteredBuddies = selectedBuddies.filter(u => !currentUser || u !== currentUser.username);
        buddiesList.innerHTML = filteredBuddies.length
            ? filteredBuddies.map(u => `<span class='badge bg-info text-dark me-1'>${u}</span>`).join(' ')
            : '<span class="text-muted">No buddies added yet.</span>';
    }
    renderSelectedBuddies();

    // Add Buddies Multi-Select Modal
    addBuddiesBtn.onclick = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        const buddies = await getBuddiesForUser(currentUser.username);
        // Modal overlay
        const buddyOverlay = createElement("div", { className: "custom-modal" });
        const buddyDialog = createElement("div", { className: "custom-modal-dialog" });
        const buddyHeader = createElement("div", { className: "custom-modal-header d-flex justify-content-between align-items-center" },
            createElement("h5", { className: "modal-title" }, "Select Buddies"),
            createElement("button", { type: "button", className: "btn-close", id: "closeBuddySelectBtn", "aria-label": "Close" })
        );
        const buddyBody = createElement("div", { className: "custom-modal-body" });
        const buddyForm = createElement("form", { className: "d-flex flex-column gap-2" });
        // List of checkboxes
        buddies.forEach(buddy => {
            const checkbox = createElement("input", {
                type: "checkbox",
                className: "form-check-input",
                id: `buddy_${buddy.username}`,
                value: buddy.username,
                checked: selectedBuddies.includes(buddy.username)
            });
            const label = createElement("label", { className: "form-check-label ms-2", for: `buddy_${buddy.username}` }, buddy.username);
            const group = createElement("div", { className: "form-check" }, checkbox, label);
            buddyForm.appendChild(group);
        });
        buddyBody.appendChild(buddyForm);
        const buddyFooter = createElement("div", { className: "custom-modal-footer d-flex justify-content-end gap-2" },
            createElement("button", { type: "button", className: "btn btn-secondary", id: "cancelBuddySelectBtn" }, "Cancel"),
            createElement("button", { type: "button", className: "btn btn-success", id: "confirmBuddySelectBtn" }, "Confirm")
        );
        buddyDialog.append(buddyHeader, buddyBody, buddyFooter);
        buddyOverlay.appendChild(buddyDialog);
        document.body.appendChild(buddyOverlay);
        // Event handlers
        document.getElementById("closeBuddySelectBtn").onclick = () => buddyOverlay.remove();
        document.getElementById("cancelBuddySelectBtn").onclick = () => buddyOverlay.remove();
        document.getElementById("confirmBuddySelectBtn").onclick = () => {
            // Collect selected buddies
            selectedBuddies = Array.from(buddyForm.querySelectorAll("input[type=checkbox]:checked")).map(cb => cb.value);
            renderSelectedBuddies();
            buddyOverlay.remove();
        };
    };

    // Footer
    const footer = createElement("div", { className: "modal-footer" },
        createElement("button", { 
            type: "button", 
            className: "btn btn-secondary", 
            "data-bs-dismiss": "modal"
        }, "Cancel"),
        createElement("button", { type: "submit", className: "btn btn-success" }, "Save")
    );

    form.append(
        createFormGroup("Trip Title", title),
        createFormGroup("Destination", destination),
        createFormGroup("Start Date", startDate),
        createFormGroup("End Date", endDate),
        createFormGroup("Status", status),
        buddiesSection,
        errorDiv
    );

    body.appendChild(form);
    content.append(header, body, footer);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Bootstrap modal instance
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

//=============================================
// MODAL EVENT HANDLERS
//=============================================

    function closeModal() {
        bsModal.hide();
        modal.remove();
        document.body.style.overflow = "";
    }

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
        document.body.style.overflow = "";
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedTrip = {
            ...trip,
            title: title.value.trim(),
            destination: destination.value.trim(),
            startDate: startDate.value,
            endDate: endDate.value,
            status: status.value,
            participantUsernames: selectedBuddies
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
