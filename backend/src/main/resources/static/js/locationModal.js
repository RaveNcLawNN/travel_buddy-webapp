//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";
import { createLocation, updateLocation } from "./api.js";

//=============================================
// ADD LOCATION MODAL
//=============================================

export function openAddLocationForm(tripId, onSubmitCallback) {
    document.body.style.overflow = "hidden";

    const overlay = createElement("div", { className: "custom-modal" });
    const dialog = createElement("div", { className: "custom-modal-dialog" });

    // Header
    const header = createElement("div", { className: "custom-modal-header d-flex justify-content-between align-items-center" },
      createElement("h5", { className: "modal-title" }, "Add New Location"),
      createElement("button", { type: "button", className: "btn-close", id: "closeAddLocBtn", "aria-label": "Close" })
    );

    // Body/Form
    const body = createElement("div", { className: "custom-modal-body" });
    const form = createElement("form", { id: "addLocationForm", className: "d-flex flex-column gap-3" });

    const fields = generateLocationFields();
    const errorDiv = createElement("div", { id: "locError", className: "text-danger mb-2", style: "display:none;" });

    const footer = createElement("div", { className: "custom-modal-footer d-flex justify-content-end gap-2" },
      createElement("button", { type: "button", className: "btn btn-secondary", id: "cancelAddLocBtn" }, "Cancel"),
      createElement("button", { type: "submit", className: "btn btn-success" }, "Add")
    );

    form.append(...fields.elements, errorDiv, footer);
    body.appendChild(form);
    dialog.append(header, body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function closeModal() {
      overlay.remove();
      document.body.style.overflow = "";
    }

    document.getElementById("closeAddLocBtn").addEventListener("click", closeModal);
    document.getElementById("cancelAddLocBtn").addEventListener("click", closeModal);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = fields.getData();
        if (!data) {
            errorDiv.style.display = "block";
            errorDiv.textContent = "Bitte fülle alle Pflichtfelder korrekt aus.";
            return;
        }
        try {
            await createLocation(tripId, { ...data, tripId });
            onSubmitCallback();
            closeModal();
        } catch (e) {
            alert("Fehler beim Erstellen der Location: " + e.message);
        }
    });
}

//=============================================
// EDIT LOCATION MODAL
//=============================================

export function openEditLocationForm(location, tripId, onSubmitCallback) {
    document.body.style.overflow = "hidden";
    const overlay = createElement("div", { className: "custom-modal" });
    const dialog = createElement("div", { className: "custom-modal-dialog" });

    // Header
    const header = createElement("div", { className: "custom-modal-header d-flex justify-content-between align-items-center" },
      createElement("h5", { className: "modal-title" }, "Edit Location"),
      createElement("button", { type: "button", className: "btn-close", id: "closeEditLocBtn", "aria-label": "Close" })
    );

    // Body & Form
    const body = createElement("div", { className: "custom-modal-body" });
    const form = createElement("form", { id: "editLocationForm", className: "d-flex flex-column gap-3" });

    const fields = generateLocationFields(location);
    const errorDiv = createElement("div", { className: "d-flex flex-column gap-3" });

    const footer = createElement("div", { className: "custom-modal-footer d-flex justify-content-end gap-2" },
        createElement("button", { type: "button", className: "btn btn-secondary", id: "cancelEditLocBtn" }, "Cancel"),
        createElement("button", { type: "submit", className: "btn btn-warning" }, "Save")
    );

    form.append(...fields.elements, errorDiv, footer);
    body.appendChild(form);
    dialog.append(header, body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function closeModal() {
        overlay.remove();
        document.body.style.overflow = "";
    }

    document.getElementById("closeEditLocBtn").addEventListener("click", closeModal);
    document.getElementById("cancelEditLocBtn").addEventListener("click", closeModal);

    form.addEventListener("submit", async (e) => { e.preventDefault();
        const data = fields.getData();
        if (!data) {
            errorDiv.style.display = "block";
            errorDiv.textContent = "Bitte fülle alle Pflichtfelder korrekt aus.";
            return;
        }
        try {
            await updateLocation(location.id, { ...data, id: location.id, tripId });
            onSubmitCallback();
            closeModal();
        } catch (e) {
            alert("Fehler beim Aktualisieren der Location: " + e.message);
        }
    });
}

//=============================================
// HELPER FUNCTIONS
//=============================================

function generateLocationFields(initial = {}) {
    const name = createElement("input", {
        type: "text",
        className: "form-control",
        id: "locName",
        value: initial.name || "",
        required: true
    });
    const latitude = createElement("input", {
        type: "number",
        step: "any",
        className: "form-control",
        id: "locLatitude",
        value: initial.latitude || "",
        required: true
    });
    const longitude = createElement("input", {
        type: "number",
        step: "any",
        className: "form-control",
        id: "locLongitude",
        value: initial.longitude || "",
        required: true
    });
    const address = createElement("input", {
        type: "text",
        className: "form-control",
        id: "locAddress",
        value: initial.address || ""
    });
    const type = createElement("select", {
        className: "form-select",
        id: "locType",
        required: true
    },
    ...["museum", "city", "landmark", "restaurant", "cafe", "park", "other"].map((t) =>
      createElement("option", { value: t, selected: initial.type === t }, t.charAt(0).toUpperCase() + t.slice(1))
    )
  );
  const description = createElement("textarea", { className: "form-control", id: "locDescription"}, initial.description || "");

  const elements = [
    createFormGroup("Name", name),
    createFormGroup("Latitude", latitude),
    createFormGroup("Longitude", longitude),
    createFormGroup("Address", address),
    createFormGroup("Type", type),
    createFormGroup("Description", description)
  ];

  function getData() {
    const lat = parseFloat(latitude.value);
    const lon = parseFloat(longitude.value);
    if (!name.value.trim() || isNaN(lat) || isNaN(lon) || !type.value) return null;
    return {
        name: name.value.trim(),
        latitude: lat,
        longitude: lon,
        address: address.value.trim(),
        type: type.value,
        description: description.value.trim()
    };
  }

  return { elements, getData };
}

function createFormGroup(labelText, inputElement) {
  return createElement("div", { className: "mb-3" },
    createElement("label", { className: "form-label" }, labelText),
    inputElement
  );
}