import puppeteer from "puppeteer";
import { logger } from ".";

interface Credentials {
	email: string;
	password: string;
}

/**
 * handles Airbnb login
 * @param this - bound puppeteer.Browser instance
 * @param credentials - user login credentials, i.e. google email and password
 */
async function airbnbLogin(
	this: puppeteer.Browser,
	credentials: Credentials,
) {
	try {
		const login = "https://www.airbnb.com/login";
		const home = "https://www.airbnb.com/hosting";

		// selectors
		const $emailInput = "#signin_email";
		const $passwordInput = "#signin_password";
		const $submitButton = "#user-login-btn";

		const [page] = await this.pages();

		// For debugging purpose
		await page.setViewport({ width: 1480, height: 860 });

		await Promise.all([
			page.goto(login),
			page.waitForNavigation({ waitUntil: "networkidle0" }),
		]);

		if (page.url() === home) {
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

		return page.url() === home;
	} catch (error) {
		logger.log("error", error);
	}
}

export default airbnbLogin;
