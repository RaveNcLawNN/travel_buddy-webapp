import { getCurrentUser } from './auth.js';
import { showProfileModal } from './profileModal.js';
import { createElement } from './createElement.js';

export async function loadBuddies() {
    const app = document.getElementById('app');
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        app.replaceChildren(createElement('div', { className: 'alert alert-warning' }, 'Please log in to view your buddies.'));
        return;
    }

    try {
        const [buddies, pendingRequests, sentRequests] = await Promise.all([
            fetch(`/api/users/${currentUser.username}/buddies`).then(r => r.json()),
            fetch(`/api/users/${currentUser.username}/buddy-requests/pending`).then(r => r.json()),
            fetch(`/api/users/${currentUser.username}/buddy-requests/sent`).then(r => r.json()),
        ]);

        // Main container
        const container = createElement('div', { className: 'container pt-5 pb-5' });
        container.appendChild(createElement('h2', { className: 'mb-4 fs-1 fw-bold' }, 'Buddies'));

        // Add Buddy Button
        const addBuddyBtn = createElement('button', {
            className: 'btn btn-primary mb-4',
            'data-bs-toggle': 'modal',
            'data-bs-target': '#addBuddyModal'
        }, createElement('i', { className: 'fas fa-user-plus' }), ' Add Buddy');
        container.appendChild(addBuddyBtn);

        // Pending Requests Section
        if (pendingRequests.length > 0) {
            const pendingCard = createElement('div', { className: 'card mb-4' },
                createElement('div', { className: 'card-header' },
                    createElement('h5', { className: 'mb-0' }, 'Pending Requests')
                ),
                createElement('div', { className: 'card-body' },
                    createElement('div', { className: 'list-group' },
                        ...pendingRequests.map(request => createPendingRequestItem(request))
                    )
                )
            );
            container.appendChild(pendingCard);
        }

        // Sent Requests Section
        if (sentRequests.length > 0) {
            const sentCard = createElement('div', { className: 'card mb-4' },
                createElement('div', { className: 'card-header' },
                    createElement('h5', { className: 'mb-0' }, 'Sent Requests')
                ),
                createElement('div', { className: 'card-body' },
                    createElement('div', { className: 'list-group' },
                        ...sentRequests.map(request => createSentRequestItem(request))
                    )
                )
            );
            container.appendChild(sentCard);
        }

        // Buddies List
        const buddiesCard = createElement('div', { className: 'card' },
            createElement('div', { className: 'card-header' },
                createElement('h5', { className: 'mb-0' }, 'My Buddies')
            ),
            createElement('div', { className: 'card-body' },
                buddies.length > 0 ?
                    createElement('div', { className: 'list-group' },
                        ...buddies.map(buddy => createBuddyItem(buddy))
                    ) :
                    createElement('p', { className: 'text-muted' }, "You haven't added any buddies yet.")
            )
        );
        container.appendChild(buddiesCard);

        // Add Buddy Modal (unchanged, still uses innerHTML for modal for now)
        const addBuddyModal = document.createElement('div');
        addBuddyModal.innerHTML = `
            <div class="modal fade" id="addBuddyModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add Buddy</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addBuddyForm">
                                <div class="mb-3">
                                    <label for="buddyUsername" class="form-label">Buddy's Username</label>
                                    <input type="text" class="form-control" id="buddyUsername" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="sendBuddyRequestBtn">Send Request</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Only append the modal if not already present
        if (!document.getElementById('addBuddyModal')) {
            document.body.appendChild(addBuddyModal.firstElementChild);
        }

        app.replaceChildren(container);

        // Event handlers for buddy actions
        window.acceptBuddyRequest = async (buddyId) => {
            try {
                await fetch(`/api/users/${currentUser.username}/buddy-request/${buddyId}/accept`, {
                    method: 'POST'
                });
                loadBuddies();
            } catch (error) {
                alert('Failed to accept buddy request');
            }
        };
        window.rejectBuddyRequest = async (buddyId) => {
            try {
                await fetch(`/api/users/${currentUser.username}/buddy-request/${buddyId}/reject`, {
                    method: 'POST'
                });
                loadBuddies();
            } catch (error) {
                alert('Failed to reject buddy request');
            }
        };
        window.cancelBuddyRequest = async (buddyId) => {
            try {
                await fetch(`/api/users/${currentUser.username}/buddies/${buddyId}`, {
                    method: 'DELETE'
                });
                loadBuddies();
            } catch (error) {
                alert('Failed to cancel buddy request');
            }
        };
        window.removeBuddy = async (buddyId) => {
            if (confirm('Are you sure you want to remove this buddy?')) {
                try {
                    await fetch(`/api/users/${currentUser.username}/buddies/${buddyId}`, {
                        method: 'DELETE'
                    });
                    loadBuddies();
                } catch (error) {
                    alert('Failed to remove buddy');
                }
            }
        };
        // Add Buddy Request
        const sendBtn = document.getElementById('sendBuddyRequestBtn');
        if (sendBtn) {
            sendBtn.onclick = async () => {
                const buddyUsername = document.getElementById('buddyUsername').value;
                if (!buddyUsername) {
                    alert('Please enter a username');
                    return;
                }
                try {
                    await fetch(`/api/users/${currentUser.username}/buddy-request/${buddyUsername}`, {
                        method: 'POST'
                    });
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addBuddyModal'));
                    modal.hide();
                    loadBuddies();
                } catch (error) {
                    alert('Failed to send buddy request');
                }
            };
        }
    } catch (error) {
        app.replaceChildren(createElement('div', { className: 'alert alert-danger' }, 'Failed to load buddies. Please try again later.'));
    }
}

function createPendingRequestItem(request) {
    const usernameLink = createElement('a', {
        href: '#',
        className: 'buddy-profile-link',
        'data-username': request.username,
        onclick: (e) => {
            e.preventDefault();
            showProfileModal(request.username);
        }
    }, request.username);
    const message = createElement('span', {}, usernameLink, ' wants to be your buddy!');
    const email = createElement('small', { className: 'text-muted' }, request.email);
    const acceptBtn = createElement('button', {
        className: 'btn btn-success btn-sm me-2',
        onclick: () => window.acceptBuddyRequest(request.id)
    }, createElement('i', { className: 'fas fa-check' }), ' Accept');
    const rejectBtn = createElement('button', {
        className: 'btn btn-danger btn-sm',
        onclick: () => window.rejectBuddyRequest(request.id)
    }, createElement('i', { className: 'fas fa-times' }), ' Reject');
    return createElement('div', { className: 'list-group-item d-flex justify-content-between align-items-center' },
        createElement('div', {}, message, createElement('br'), email),
        createElement('div', {}, acceptBtn, rejectBtn)
    );
}

function createSentRequestItem(request) {
    const username = createElement('h6', { className: 'mb-0' }, request.username);
    const email = createElement('small', { className: 'text-muted' }, request.email);
    const cancelBtn = createElement('button', {
        className: 'btn btn-danger btn-sm',
        onclick: () => window.cancelBuddyRequest(request.id)
    }, createElement('i', { className: 'fas fa-times' }), ' Cancel');
    return createElement('div', { className: 'list-group-item d-flex justify-content-between align-items-center' },
        createElement('div', {}, username, email),
        createElement('div', {}, cancelBtn)
    );
}

function createBuddyItem(buddy) {
    const username = createElement('h6', { className: 'mb-0' }, buddy.username);
    const email = createElement('small', { className: 'text-muted' }, buddy.email);
    const removeBtn = createElement('button', {
        className: 'btn btn-danger btn-sm',
        onclick: () => window.removeBuddy(buddy.id)
    }, createElement('i', { className: 'fas fa-user-minus' }), ' Remove');
    return createElement('div', { className: 'list-group-item d-flex justify-content-between align-items-center' },
        createElement('div', {}, username, email),
        removeBtn
    );
} 