import { configureStore } from '@reduxjs/toolkit';
import { addressReducer } from '../slices/adressSlice';
import { officeReducer } from '../slices/officeSlice';
import { userReducer } from '../slices/userSlice';
import { paymentMethodReducer } from '../slices/paymentMethodSlice';
import { voucherReducer } from '../slices/voucherSlice';
import { vehicleReducer } from '../slices/vehicleSlice';
import { employeeReducer } from '../slices/employeeSlice';
import { reviewReducer } from '../slices/reviewSlice';
import { customerReducer } from '../slices/customerSlice';
import { wayReducer } from '../slices/waySlice';
import { routeReducer } from '../slices/routeSlice';
import { tripReducer } from '../slices/tripSlice';
import { articleReducer } from '../slices/articleSlice';
import { refundReducer } from '../slices/refundSlice';

export const store = configureStore({
   reducer: {
      user: userReducer,
      office: officeReducer,
      address: addressReducer,
      paymentMethod: paymentMethodReducer,
      voucher: voucherReducer,
      vehicle: vehicleReducer,
      employee: employeeReducer,
      review: reviewReducer,
      customer: customerReducer,
      way: wayReducer,
      route: routeReducer,
      trip: tripReducer,
      article: articleReducer,
      refund: refundReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
