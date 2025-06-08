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
    const form = createElement("form", { 
        id: "editTripForm", 
        className: "d-flex flex-column gap-3",
        onsubmit: "return false;" // Prevent default form submission
    });

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
        
        // Create Bootstrap modal for buddy selection
        const buddyModal = createElement("div", { 
            className: "modal fade", 
            id: "buddySelectModal",
            tabIndex: -1
        });
        const buddyDialog = createElement("div", { className: "modal-dialog" });
        const buddyContent = createElement("div", { className: "modal-content" });
        
        const buddyHeader = createElement("div", { className: "modal-header" },
            createElement("h5", { className: "modal-title" }, "Select Buddies"),
            createElement("button", { 
                type: "button", 
                className: "btn-close", 
                "data-bs-dismiss": "modal",
                "aria-label": "Close" 
            })
        );
        
        const buddyBody = createElement("div", { className: "modal-body" });
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
        
        const buddyFooter = createElement("div", { className: "modal-footer" },
            createElement("button", { 
                type: "button", 
                className: "btn btn-secondary", 
                "data-bs-dismiss": "modal"
            }, "Cancel"),
            createElement("button", { 
                type: "button", 
                className: "btn btn-success", 
                id: "confirmBuddySelectBtn"
            }, "Confirm")
        );
        
        buddyContent.append(buddyHeader, buddyBody, buddyFooter);
        buddyDialog.appendChild(buddyContent);
        buddyModal.appendChild(buddyDialog);
        document.body.appendChild(buddyModal);
        
        // Initialize Bootstrap modal
        const bsBuddyModal = new bootstrap.Modal(buddyModal);
        bsBuddyModal.show();
        
        // Event handlers
        document.getElementById("confirmBuddySelectBtn").onclick = () => {
            // Collect selected buddies
            selectedBuddies = Array.from(buddyForm.querySelectorAll("input[type=checkbox]:checked")).map(cb => cb.value);
            renderSelectedBuddies();
            bsBuddyModal.hide();
            buddyModal.remove();
        };
        
        // Clean up when modal is hidden
        buddyModal.addEventListener('hidden.bs.modal', () => {
            buddyModal.remove();
        });
    };

    // Footer
    const footer = createElement("div", { className: "modal-footer" },
        createElement("button", { 
            type: "button", 
            className: "btn btn-secondary", 
            "data-bs-dismiss": "modal"
        }, "Cancel"),
        createElement("button", { 
            type: "submit", 
            className: "btn btn-success",
            id: "saveTripBtn"
        }, "Save")
    );

    form.append(
        createFormGroup("Trip Title", title),
        createFormGroup("Destination", destination),
        createFormGroup("Start Date", startDate),
        createFormGroup("End Date", endDate),
        createFormGroup("Status", status),
        buddiesSection,
        errorDiv,
        footer
    );

    body.appendChild(form);
    content.append(header, body);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Bootstrap modal instance
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Form submission handler
    form.onsubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");

        const saveBtn = document.getElementById("saveTripBtn");
        const originalBtnText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        const updatedTrip = {
            ...trip,
            title: title.value.trim(),
            destination: destination.value.trim(),
            startDate: startDate.value,
            endDate: endDate.value,
            status: status.value,
            participantUsernames: [...(trip.participantUsernames || []), ...selectedBuddies],
            locations: (trip.locations || []).map(loc => ({ ...loc, tripId: trip.id }))
        };

        if (!updatedTrip.title || !updatedTrip.destination || !updatedTrip.startDate || !updatedTrip.endDate || !updatedTrip.status) {
            errorDiv.textContent = "All fields are required.";
            errorDiv.style.display = "block";
            saveBtn.disabled = false;
            saveBtn.textContent = originalBtnText;
            return;
        }

        try {
            // Only geocode if destination has changed
            if (updatedTrip.destination !== trip.destination) {
                const geoResults = await searchLocation(updatedTrip.destination);
                if (!geoResults.length) {
                    errorDiv.textContent = "Unable to find coordinates for the destination.";
                    errorDiv.style.display = "block";
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalBtnText;
                    return;
                }
                const { latitude, longitude } = geoResults[0];
                updatedTrip.latitude = latitude;
                updatedTrip.longitude = longitude;
            }

            // Send updated trip to BE
            console.log("Sending updated trip:", updatedTrip);
            await updateTrip(updatedTrip.id, updatedTrip);

            // Hide the modal using Bootstrap's modal instance
            bsModal.hide();
            
            // Clean up after modal is hidden
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
                document.body.style.overflow = "";
                if (typeof onSubmitCallback === "function") {
                    onSubmitCallback();
                }
            }, { once: true });
        } catch (err) {
            console.error("Error updating trip:", err);
            alert("Failed to update trip: " + err.message);
            saveBtn.disabled = false;
            saveBtn.textContent = originalBtnText;
        }
    };

    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
        document.body.style.overflow = "";
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
