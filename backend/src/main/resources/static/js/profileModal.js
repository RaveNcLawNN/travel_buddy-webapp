//=============================================
// IMPORTS
//=============================================

import { createElement } from './createElement.js';

//=============================================
// SHOW PROFILE MODAL
//=============================================

export function showProfileModal(username) {
    const existing = document.getElementById('profileModal');
    if (existing) existing.remove();

    //=============================================
    // STRUCTURE
    //=============================================

    // Base elements
    const modal = createElement('div', { className: 'modal fade', id: 'profileModal', tabIndex: -1 });
    const dialog = createElement('div', { className: 'modal-dialog' });
    const content = createElement('div', { className: 'modal-content' });

    // Header
    const header = createElement('div', { className: 'modal-header' },
        createElement('h5', { className: 'modal-title' }, `${username}'s Profile`),
        createElement('button', { type: 'button', className: 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );

    // Body (placeholder for now)
    const body = createElement('div', { className: 'modal-body' },
        createElement('p', {}, `This is a placeholder for ${username}'s profile.`)
    );

    // Assemble modal
    content.append(header, body);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
} 