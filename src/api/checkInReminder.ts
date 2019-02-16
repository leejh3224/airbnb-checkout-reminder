import cron from "node-cron";

import { initPuppeteer, main } from "lib";

const checkInReminder = (schedule: string) =>
	cron.schedule(
		schedule,
		async () => {
			try {
				const browser = await initPuppeteer();
				await main(browser);
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
