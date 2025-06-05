import { createElement } from './createElement.js';
import { login, register, isLoggedIn } from './auth.js';
import { initNavigationBar } from './navigation-bar.js';

export function showLoginModal() {
    // Remove any existing modal
    const existing = document.getElementById('loginModal');
    if (existing) existing.remove();

    // Modal structure
    const modal = createElement('div', { className: 'modal fade', id: 'loginModal', tabIndex: -1 });
    const dialog = createElement('div', { className: 'modal-dialog' });
    const content = createElement('div', { className: 'modal-content' });

    // Header
    const header = createElement('div', { className: 'modal-header' },
        createElement('h5', { className: 'modal-title' }, 'Login / Register'),
        createElement('button', { type: 'button', className: 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );

    // Feedback message area
    const messageDiv = createElement('div', { id: 'loginModalMessage', className: 'alert', style: 'display:none;' });

    // Tabs
    const navTabs = createElement('ul', { className: 'nav nav-tabs', role: 'tablist' },
        createElement('li', { className: 'nav-item', role: 'presentation' },
            createElement('button', {
                className: 'nav-link active',
                id: 'login-tab',
                'data-bs-toggle': 'tab',
                'data-bs-target': '#loginTabPane',
                type: 'button',
                role: 'tab',
                'aria-selected': 'true'
            }, 'Login')
        ),
        createElement('li', { className: 'nav-item', role: 'presentation' },
            createElement('button', {
                className: 'nav-link',
                id: 'register-tab',
                'data-bs-toggle': 'tab',
                'data-bs-target': '#registerTabPane',
                type: 'button',
                role: 'tab',
                'aria-selected': 'false'
            }, 'Register')
        )
    );

    // Login Form
    const loginForm = createElement('form', { id: 'loginForm' },
        createFormGroup('Username', createElement('input', { type: 'text', className: 'form-control', id: 'loginUsername', required: true })),
        createFormGroup('Password', createElement('input', { type: 'password', className: 'form-control', id: 'loginPassword', required: true })),
        createElement('button', { type: 'submit', className: 'btn btn-primary w-100' }, 'Login')
    );

    // Register Form
    const registerForm = createElement('form', { id: 'registerForm' },
        createFormGroup('Username', createElement('input', { type: 'text', className: 'form-control', id: 'registerUsername', required: true })),
        createFormGroup('Email', createElement('input', { type: 'email', className: 'form-control', id: 'registerEmail', required: true })),
        createFormGroup('Password', createElement('input', { type: 'password', className: 'form-control', id: 'registerPassword', required: true })),
        createElement('button', { type: 'submit', className: 'btn btn-success w-100' }, 'Register')
    );

    // Tab Panes
    const tabContent = createElement('div', { className: 'tab-content mt-3' },
        createElement('div', { className: 'tab-pane fade show active', id: 'loginTabPane', role: 'tabpanel' }, loginForm),
        createElement('div', { className: 'tab-pane fade', id: 'registerTabPane', role: 'tabpanel' }, registerForm)
    );

    // Modal body
    const body = createElement('div', { className: 'modal-body' }, messageDiv, navTabs, tabContent);

    // Assemble modal
    content.append(header, body);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Bootstrap modal instance
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Helper to show feedback messages
    function showMessage(msg, type = 'success') {
        messageDiv.textContent = msg;
        messageDiv.className = 'alert alert-' + type;
        messageDiv.style.display = 'block';
    }
    function hideMessage() {
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
    }

    // Event handlers
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        hideMessage();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        try {
            await login(username, password);
            initNavigationBar();
            bsModal.hide();
        } catch (err) {
            showMessage(err.message || 'Login failed', 'danger');
        }
    };
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        hideMessage();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        try {
            const result = await register(username, email, password);
            if (result) {
                initNavigationBar();
                showMessage('New user created and logged in!', 'success');
                setTimeout(() => bsModal.hide(), 1200);
            } else {
                showMessage('Registration failed. Please try again.', 'danger');
            }
        } catch (err) {
            showMessage(err.message || 'Registration failed', 'danger');
        }
    };
}

function createFormGroup(labelText, inputElement) {
    return createElement('div', { className: 'mb-3' },
        createElement('label', { className: 'form-label' }, labelText),
        inputElement
    );
} 