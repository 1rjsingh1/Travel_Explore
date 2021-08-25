const stripe = Stripe(
  'pk_test_51IZsVGSH8n6QF39M4Um37eeC0hl88n5HFDTHJ4rW0UiFYaWTy4hIxAqOtQu3E6tskIIWYaKrlWEGbduRSGvICqxB009NFvqxq7'
);

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    //1.) get session from api
    const session = await axios(
      `http://localhost:3000/api/booking/checkout-session/${tourId}`
    );

    console.log(session);
    //2.)create checkout and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
