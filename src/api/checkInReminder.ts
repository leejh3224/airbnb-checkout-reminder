import cron from "node-cron";

import { checkInReminderMain, initPuppeteer, logger } from "lib";

const checkInReminder = (schedule: string) =>
	cron.schedule(
		schedule,
		async () => {
			try {
				const browser = await initPuppeteer();
				await checkInReminderMain(browser);
				await browser.close();
			} catch (error) {
				logger.log("error", error);
			}
		},
		{
			timezone: "Asia/Seoul",
		},
	);

export default checkInReminder;
