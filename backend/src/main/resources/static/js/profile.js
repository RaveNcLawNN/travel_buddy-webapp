import { getCurrentUser } from './auth.js';
import { createElement } from './createElement.js';

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

  const container = createElement('div', { className: 'container py-4 pt-5 pb-5' });
  const row = createElement('div', { className: 'row g-4' });

  // Sidebar: Profile Picture Upload & Display
  const sidebarCol = createElement('div', { className: 'col-12 col-md-4' });
  const sidebarCard = createElement('div', { className: 'card' });
  const sidebarBody = createElement('div', { className: 'card-body' });
  sidebarBody.appendChild(createElement('h4', { className: 'card-title mb-3' }, 'Profile Picture'));

  // File input and upload button
  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    className: 'form-control mb-3'
  });
  const uploadBtn = createElement('button', { className: 'btn btn-primary w-100 mb-3' }, 'Upload Picture');
  uploadBtn.onclick = () => {
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
  function displayProfilePicture() {
    const pictureUrl =
      localStorage.getItem(`profilePicture_${currentUser.username}`) ||
      'placeholder.jpg';
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
  const mainCard = createElement('div', { className: 'card' });
  const mainBody = createElement('div', { className: 'card-body' });
  mainBody.appendChild(createElement('h2', { className: 'card-title mb-4' }, 'My Profile'));

  // Description Section
  mainBody.appendChild(createElement('h4', { className: 'mb-3' }, 'About Me'));
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

  // Assemble layout
  row.appendChild(sidebarCol);
  row.appendChild(mainCol);
  container.appendChild(row);
  app.replaceChildren(container);
}
