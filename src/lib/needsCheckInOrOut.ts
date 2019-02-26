import { Message } from "../types";
import { TWELVE_MONTHS } from "./constants";
import logger from "./logger";

const needsCheckInOrOut = (
	period: string,
	now = new Date(Date.now()),
):
	| {
			type: Message
			required: boolean,
	  }
	| undefined => {
	const periodMatcher = new RegExp(
		`(${TWELVE_MONTHS.join("|")}) (\\d{1,2})–(\\d{1,2})`,
	);
	const matched = periodMatcher.exec(period);

	if (matched) {
		// map types to number
		let [, month, startDate, endDate] = matched.map((match) =>
			isNaN(Number(match)) ? match : Number(match),
		);

		// month to number
		month = TWELVE_MONTHS.findIndex((m) => m === month);

		const thisMonth = now.getMonth();
		const currentDate = now.getDate();

		let messageType: Message;

		if (month === thisMonth && startDate === currentDate) {
			messageType = "check-in";
		}

		if (month === thisMonth && endDate === currentDate) {
			messageType = "check-out";
		}

		return {
			required:
				month === thisMonth &&
				(startDate === currentDate || endDate === currentDate),
			type: messageType,
		};
	}
};

export default needsCheckInOrOut;
