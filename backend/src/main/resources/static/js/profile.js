//=============================================
// IMPORTS
//=============================================

import { getCurrentUser } from './auth.js';
import { createElement } from './createElement.js';

//=============================================
// MAIN: LOAD & RENDER PROFILE
//=============================================

export function loadProfile() {
  const app = document.getElementById('app');
  const currentUser = getCurrentUser();

  if (!currentUser) {
    app.replaceChildren(
      createElement(
        'div',
        { className: 'alert alert-warning text-center' },
        'Please log in to view your profile.'
      )
    );
    return;
  }

  //=============================================
  // STRUCTURE
  //=============================================

  const container = createElement('div', { className: 'container py-4 pt-5 pb-5' });
  const row = createElement('div', { className: 'row g-4' });

  // Sidebar: Profile Picture Upload & Display
  const sidebarCol = createElement('div', { className: 'col-12 col-md-4' });
  const sidebarCard = createElement('div', { className: 'card' });
  const sidebarBody = createElement('div', { className: 'card-body' });
  sidebarBody.appendChild(createElement('h4', { className: 'card-title text-h2 mb-3' }, 'Profile Picture'));

  // File input (hidden) and upload button
  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    style: 'display: none;'
  });
  const uploadBtn = createElement('button', { className: 'btn btn-primary w-100 mb-3' }, 'Upload Picture');
  uploadBtn.onclick = () => fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem(
          `profilePicture_${currentUser.username}`,
          e.target.result
        );
        displayProfilePicture();
      };
      reader.readAsDataURL(file);
    }
  };
  sidebarBody.appendChild(fileInput);
  sidebarBody.appendChild(uploadBtn);

  // Display Profile Picture
  const pictureDisplay = createElement('div', { className: 'text-center' });

  // Helper: Render or update pic
  function displayProfilePicture() {
    const pictureUrl =
      localStorage.getItem(`profilePicture_${currentUser.username}`) ||
      '/images/portrait-placeholder.png';
    const img = createElement('img', {
      src: pictureUrl,
      className: 'img-fluid rounded-circle',
      style: 'max-width: 150px;'
    });
    pictureDisplay.replaceChildren(img);
  }
  displayProfilePicture();
  sidebarBody.appendChild(pictureDisplay);
  sidebarCard.appendChild(sidebarBody);
  sidebarCol.appendChild(sidebarCard);

  // Main Content: Profile Info
  const mainCol = createElement('div', { className: 'col-12 col-md-8' });
  const mainCard = createElement('div', { className: 'card bg-grad-medium' });
  const mainBody = createElement('div', { className: 'card-body' });
  mainBody.appendChild(createElement('h1', { className: 'card-title text-h1 mb-3' }, 'My Profile'));

  // Description Section
  mainBody.appendChild(createElement('h4', { className: 'text-highlight mb-4' }, 'About Me:'));
  const textarea = createElement('textarea', {
    className: 'form-control mb-3',
    rows: 5,
    placeholder: 'Write a short description about yourself...'
  });
  textarea.value =
    localStorage.getItem(`profileDescription_${currentUser.username}`) ||
    '';
  textarea.onchange = () => {
    localStorage.setItem(
      `profileDescription_${currentUser.username}`,
      textarea.value
    );
  };
  mainBody.appendChild(textarea);

  mainCard.appendChild(mainBody);
  mainCol.appendChild(mainCard);

  // Assemble profile
  row.appendChild(sidebarCol);
  row.appendChild(mainCol);
  container.appendChild(row);
  app.replaceChildren(container);
}
