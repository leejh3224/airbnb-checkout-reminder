import cron from "node-cron";

import { checkInReminderMain, initPuppeteer } from "lib";

const checkInReminder = (schedule: string) =>
	cron.schedule(
		schedule,
		async () => {
			try {
				const browser = await initPuppeteer();
				await checkInReminderMain(browser);
				await browser.close();
			} catch (error) {
				console.log(error);
			}
		},
		{
			timezone: "Asia/Seoul",
		},
	);

export default checkInReminder;
