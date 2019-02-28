import puppeteer from "puppeteer";
import { logger } from ".";
import { AIRBNB_HOME_URL, AIRBNB_LOGIN_URL } from "./constants";

interface Credentials {
	email: string;
	password: string;
}

async function airbnbLogin(
	this: puppeteer.Browser,
	credentials: Credentials,
) {
	try {
		const $emailInput = "#signin_email";
		const $passwordInput = "#signin_password";
		const $submitButton = "#user-login-btn";

		const [page] = await this.pages();

		await Promise.all([
			page.goto(AIRBNB_LOGIN_URL),
			page.waitForNavigation({ waitUntil: "networkidle0" }),
		]);

		if (page.url() === AIRBNB_HOME_URL) {
			return true;
		}

		const { email, password } = process.env;

		if (email && password) {
			await page.type($emailInput, email);
			await page.type($passwordInput, password);
			await Promise.all([
				page.click($submitButton),
				page.waitForNavigation({ waitUntil: "networkidle0" }),
			]);
		}

		return page.url() === AIRBNB_HOME_URL;
	} catch (error) {
		logger.error(error);
	}
}

export default airbnbLogin;
