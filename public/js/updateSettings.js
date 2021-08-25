import axios from 'axios';
import { showAlert } from './alerts';

//type = string either data or password
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'data'
          ? 'http://localhost:3000/api/users/updateMe'
          : 'http://localhost:3000/api/users/updatepassword',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated successfully`);
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
