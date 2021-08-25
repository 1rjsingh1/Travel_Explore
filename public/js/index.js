// to make js work on old versions
import '@babel/polyfill';
import { updateSettings } from './updateSettings';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userSettingsForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('bookTour');

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    //console.log('hello');
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const pass = document.querySelector('#password').value;

    login(email, pass);
    console.log(email, pass);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateSettings(form, 'data');
  });
}

if (userSettingsForm) {
  userSettingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const currpassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const btnSavePassword = document.querySelector('.btn--savePassword');
    btnSavePassword.textContent = 'Updating Password...';
    await updateSettings(
      { currpassword, password, passwordConfirm },
      'password'
    );

    btnSavePassword.textContent = 'Save password';
    //cleairng fields
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    bookBtn.textContent = 'Processing...';
    //console.log(bookBtn.dataset);
    const tourId = bookBtn.dataset.tourid;
    console.log(tourId);
    bookTour(tourId);
  });
}
