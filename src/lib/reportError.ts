import { gmail_v1, google } from "googleapis";
import puppeteer from "puppeteer";
import { buildMailBody, getOAuthClient, logger } from ".";

const reportError = async (page: puppeteer.Page, error: Error) => {
	logger.error(error);
	try {
		const oauth2Client = await getOAuthClient(page);
		const gmail = await google.gmail({
			version: "v1",
			auth: oauth2Client as any,
		});
		await gmail.users.messages.send({
			userId: "me",
			resource: {
				raw: buildMailBody({
					title: "에러 발생",
					body: error.stack,
				}),
			},
		} as gmail_v1.Params$Resource$Users$Messages$Send);
	} catch (error) {
		logger.error(error);
	}
};

export default reportError;
