import express from "express";
import { logger } from "lib";

import { answerToReservation, checkInReminder } from "api";
import {
	ANSWER_TO_RESERVATION_PERIOD,
	CHECK_IN_REMINDER_START_HOUR,
	CHECK_IN_REMINDER_START_MINUTES,
} from "lib/constants";

const port = 3000;
const app = express();

checkInReminder(
	`${CHECK_IN_REMINDER_START_MINUTES} ${CHECK_IN_REMINDER_START_HOUR} * * *`,
);
answerToReservation(`*/${ANSWER_TO_RESERVATION_PERIOD} * * * *`);

app.listen(port, () => logger.info(`listening to ${port}`));
