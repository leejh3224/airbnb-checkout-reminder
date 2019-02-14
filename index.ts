import express from "express";

import { checkInReminder } from "api";

const port = 3000;
const app = express();

/**
 * Airbnb auto reply reservation confirmed
 * 1. Use Gmail:watch api (https://developers.google.com/gmail/api/guides/push)
 * 2. Send Gmail that says this reservation request was replied by machine
 * 3. Send message only if the title starts with '예약 완료'
 */

checkInReminder();

app.listen(port, () =>
	console.log(
		`listening to ${port}, started: ${new Intl.DateTimeFormat('ko-KR', {
  			year: 'numeric', month: 'numeric', day: 'numeric',
  			hour: 'numeric', minute: 'numeric', second: 'numeric',
  			hour12: false,
		}).format(new Date(Date.now()))}`,
	),
);
