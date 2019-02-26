import cron from "node-cron";

import { answerToReservationMain, initPuppeteer, logger } from "lib";

const answerToReservation = (schedule: string) => {
	cron.schedule(schedule, async () => {
		try {
			const browser = await initPuppeteer();
			await answerToReservationMain(browser);
			await browser.close();
		} catch (error) {
			logger.log("error", error);
		}
	});
};

export default answerToReservation;
