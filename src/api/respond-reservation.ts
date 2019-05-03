import cron from "node-cron";

import { initPuppeteer, logger, ReservationAutoResponder } from "lib";
import {
	ANSWER_TO_RESERVATION_PERIOD,
	CHECK_IN_REMINDER_START_HOUR,
	CHECK_IN_REMINDER_START_MINUTES,
} from "lib/constants";

const respondReservation = (schedule: string) => {
	cron.schedule(schedule, async () => {
		try {
			const browser = await initPuppeteer();

			const date = new Date();
			const hour = date.getHours();
			const minutes = date.getMinutes();

			// not to interrupt `checkInReminder`
			if (
				!(
					hour === CHECK_IN_REMINDER_START_HOUR &&
					minutes >=
						CHECK_IN_REMINDER_START_MINUTES - ANSWER_TO_RESERVATION_PERIOD
				)
			) {
				await new ReservationAutoResponder({ browser }).main();
			}

			await browser.close();
		} catch (error) {
			logger.error(error);
		}
	});
};

export default respondReservation;
