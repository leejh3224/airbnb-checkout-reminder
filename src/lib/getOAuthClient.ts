import * as fs from "fs";
import { google } from "googleapis";
import * as http from "http";
import * as path from "path";
import puppeteer from "puppeteer";
import destroyer from "server-destroy";
import * as url from "url";
import { GMAIL_SCOPES, OAUTH_SERVER_PORT } from "./constants";
import logger from "./logger";

const getOAuthClient = (page: puppeteer.Page) => {
	const keyPath = path.resolve(process.env.OAUTH2_KEY as string);
	let keys: any = { redirect_uris: [""] };
	if (fs.existsSync(keyPath)) {
		keys = require(keyPath).web;
	}

	async function authenticate(scopes: any) {
		return new Promise((resolve, reject) => {
			const oauth2Client = new google.auth.OAuth2(
				keys.client_id,
				keys.client_secret,
				keys.redirect_uris[0],
			);

			const authorizeUrl = oauth2Client.generateAuthUrl({
				access_type: "offline",
				scope: scopes.join(" "),
			});

			const authSuccessMessage =
				"Authentication successful! Please return to the console.";

			const server = http
				.createServer(async (req, res) => {
					try {
						if (req.url!.indexOf("/oauth2callback") > -1) {
							const qs = new url.URL(
								req.url as string,
								`http://localhost:${OAUTH_SERVER_PORT}`,
							).searchParams;
							res.end(authSuccessMessage);
							server.close();
							const { tokens } = await oauth2Client.getToken(qs.get(
								"code",
							) as any);
							oauth2Client.credentials = tokens;
							resolve(oauth2Client);
						}
					} catch (e) {
						reject(e);
					}
				})
				.listen(OAUTH_SERVER_PORT, async () => {
					try {
						// selectors
						const $me = "content li:first-child > div > div";
						const $header = "#headingText > content";
						const $email = 'input[type="email"]';
            const $password = 'input[type="password"]';
            const $emailNextPageButton = "#identifierNext";
						const $nextPageButton = "#passwordNext";

						await page.goto(authorizeUrl, { waitUntil: 'networkidle2' });

            // when your login history is gone
						if ((await page.$($email)) !== null) {
              await page.type($email, process.env.email as string);
              await page.click($emailNextPageButton);
              await page.waitFor(3000);
              await page.type($password, process.env.password as string);
              await page.waitForSelector($nextPageButton);
              await page.click($nextPageButton);
              await page.waitFor(3000);
						}

						const bodyText = await page.evaluate(() => {
							const body = document.querySelector("body");

							if (body !== null) {
								return body.textContent;
							}
						});

						// already authenticated
						if (bodyText && bodyText === authSuccessMessage) {
              resolve(oauth2Client);
						} else {
							await page.waitForSelector($me);
							await page.click($me);

							await page.waitForFunction(
								(text: string, headerSelector: string) => {
									const header = document.querySelector(headerSelector);

									if (header !== null) {
										return header.textContent !== text;
									}
								},
								{}, // options
								"Choose an account",
								$header,
							);

							await page.waitForSelector($password);
							await page.type($password, process.env.password as string);
							await page.click($nextPageButton);
              await page.waitFor(3000);
              resolve(oauth2Client);
						}
					} catch (error) {
            logger.error(error);
            reject(error);
					}
				});

			destroyer(server);
		});
	}

	return authenticate(GMAIL_SCOPES);
};

export default getOAuthClient;
