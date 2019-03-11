import puppeteer from "puppeteer";
import { logger, reportError } from ".";
import { AIRBNB_LOGIN_URL } from "./constants";

async function airbnbLogin(this: puppeteer.Browser) {
	try {
		const $emailInput = "#signin_email";
		const $passwordInput = "#signin_password";
		const $submitButton = "#user-login-btn";

		const [page] = await this.pages();

		await page.goto(AIRBNB_LOGIN_URL, { waitUntil: "networkidle0" });

		logger.info(`page.url is ${page.url()}`);

		// already loggedIn
		if (page.url().includes("hosting")) {
			logger.info("already loggedIn!");
			return true;
		} else {
			const { email, password } = process.env;

			logger.info("not loggedIn!");

			if (email && password) {
				await page.type($emailInput, email);
				await page.type($passwordInput, password);
				await Promise.all([
					page.click($submitButton),
					page.waitForNavigation({ waitUntil: "networkidle0" }),
				]);
			}

			logger.info(`page.url is ${page.url()}`);

			return page.url().includes("hosting");
		}
	} catch (error) {
		const [page] = await this.pages();
		await reportError(page, error);
	}
}

export default airbnbLogin;
