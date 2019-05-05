import cron from "node-cron";

import { initPuppeteer, logger, remindCheckIn } from "lib";

const checkInReminder = (schedule: string) =>
	cron.schedule(
		schedule,
		async () => {
			try {
				const browser = await initPuppeteer();
				await remindCheckIn(browser);
				await browser.close();
			} catch (error) {
				logger.error(error);
			}
		},
		{
			timezone: "Asia/Seoul",
		},
	);

export default checkInReminder;
