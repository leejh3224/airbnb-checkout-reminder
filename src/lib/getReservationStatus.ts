import moment from 'moment';
import { CHECK_IN, CHECK_OUT, GUEST_STAYING, OUT_OF_RANGE } from './constants';
import { ReservationStatus } from './types';

interface IReservationPeriod {
  start: {
    month: number;
    day: number;
  };
  end: {
    month: number;
    day: number;
  };
}

export const parseReservationDates = (period: string): IReservationPeriod => {
  const month = `(${moment.monthsShort().join('|')})`;
  const dayOfMonth = '(\\d{1,2})';

  const periodMatcher = new RegExp(
    `${month} ${dayOfMonth}–${month}\?\\s\?${dayOfMonth}`,
  );
  const matched = periodMatcher.exec(period);

  if (!matched) {
    throw new Error('예약 날짜를 파싱할 수 없습니다.');
  }

  const [, month1, day1, month2, day2] = matched;

  const monthToNumber = (target: string) =>
    moment.monthsShort().findIndex(monthShort => monthShort === target);

  return {
    start: {
      month: monthToNumber(month1),
      day: Number(day1),
    },
    end: {
      month: monthToNumber(month2 || month1),
      day: Number(day2),
    },
  };
};

export const getReservationStatus = (
  period: string,
  now: Date = new Date(Date.now()), // for testing purpose
): ReservationStatus => {
  const reservation = parseReservationDates(period);
  let status: ReservationStatus;

  const willCheckIn = moment(reservation.start).isSame(moment(now), 'day');
  const willCheckOut = moment(reservation.end).isSame(moment(now), 'day');
  const isStaying = moment(moment(now)).isBetween(
    moment(reservation.start),
    moment(reservation.end),
    'day',
    // both side exclusive
    // check https://momentjs.com/docs/#/query/is-between/
    '()',
  );

  if (willCheckIn) {
    status = CHECK_IN;
  } else if (willCheckOut) {
    status = CHECK_OUT;
  } else if (isStaying) {
    status = GUEST_STAYING;
  } else {
    status = OUT_OF_RANGE;
  }

  return status;
};

export default getReservationStatus;
