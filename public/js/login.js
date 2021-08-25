import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    console.log(email, password);
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged In successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/users/logout',
    });
    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error in logging out!');
  }
};
