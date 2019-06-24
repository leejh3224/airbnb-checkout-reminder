import {
  CHECK_IN,
  CHECK_OUT,
  GUEST_STAYING,
  OUT_OF_RANGE,
  RESERVATION_CONFIRMED,
} from './constants';

export type ReservationStatus =
  | typeof CHECK_IN
  | typeof CHECK_OUT
  | typeof GUEST_STAYING
  | typeof OUT_OF_RANGE
  | typeof RESERVATION_CONFIRMED;
