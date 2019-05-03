import express from "express";
import { logger } from "lib";

import { remindCheckIn, respondReservation } from "api";
import {
	ANSWER_TO_RESERVATION_PERIOD,
	CHECK_IN_REMINDER_START_HOUR,
	CHECK_IN_REMINDER_START_MINUTES,
} from "lib/constants";

const port = 3000;
const app = express();

remindCheckIn(
	`${CHECK_IN_REMINDER_START_MINUTES} ${CHECK_IN_REMINDER_START_HOUR} * * *`,
);
respondReservation(`*/${ANSWER_TO_RESERVATION_PERIOD} * * * *`);

app.listen(port, () => logger.info(`listening to ${port}`));

process.on("uncaughtException", (err) => {
	console.log(err.stack);
});
