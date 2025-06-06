import { getCurrentUser } from './auth.js';
import { createElement } from './createElement.js';

export function loadProfile() {
    const app = document.getElementById('app');
    const currentUser = getCurrentUser();

    if (!currentUser) {
        app.replaceChildren(createElement('div', { className: 'alert alert-warning' }, 'Please log in to view your profile.'));
        return;
    }

    const container = createElement('div', { className: 'container' });
    container.appendChild(createElement('h2', { className: 'mb-4' }, 'My Profile'));

    // Profile Picture Upload
    const uploadSection = createElement('div', { className: 'mb-4' });
    uploadSection.appendChild(createElement('h4', {}, 'Profile Picture'));
    const fileInput = createElement('input', { type: 'file', accept: 'image/*', className: 'form-control mb-2' });
    const uploadBtn = createElement('button', { className: 'btn btn-primary' }, 'Upload Picture');
    uploadBtn.onclick = () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                localStorage.setItem(`profilePicture_${currentUser.username}`, e.target.result);
                displayProfilePicture();
            };
            reader.readAsDataURL(file);
        }
    };
    uploadSection.appendChild(fileInput);
    uploadSection.appendChild(uploadBtn);
    container.appendChild(uploadSection);

    // Display Profile Picture
    const pictureDisplay = createElement('div', { className: 'mb-4' });
    function displayProfilePicture() {
        const pictureUrl = localStorage.getItem(`profilePicture_${currentUser.username}`) || 'placeholder.jpg';
        const img = createElement('img', { src: pictureUrl, className: 'img-thumbnail', style: 'max-width: 200px;' });
        pictureDisplay.replaceChildren(img);
    }
    displayProfilePicture();
    container.appendChild(pictureDisplay);

    // Description
    const descriptionSection = createElement('div', { className: 'mb-4' });
    descriptionSection.appendChild(createElement('h4', {}, 'About Me'));
    const textarea = createElement('textarea', { className: 'form-control', rows: 4, placeholder: 'Write a short description about yourself...' });
    textarea.value = localStorage.getItem(`profileDescription_${currentUser.username}`) || '';
    textarea.onchange = () => {
        localStorage.setItem(`profileDescription_${currentUser.username}`, textarea.value);
    };
    descriptionSection.appendChild(textarea);
    container.appendChild(descriptionSection);

    app.replaceChildren(container);
} 