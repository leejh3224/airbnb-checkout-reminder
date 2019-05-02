import { Message } from "../types";
import { CHECK_IN, CHECK_OUT, TWELVE_MONTHS } from "./constants";

// helpers
const mapToNumber = (numString: string[]) => {
	return numString.map((str) => {
		const num = Number(str);
		return isNaN(num) ? str : num;
	});
};

const getMonthNumber = (target: string) =>
	TWELVE_MONTHS.findIndex((month) => month === target);

// main
const needsCheckInOrOut = (
	period: string,
	now = new Date(Date.now()),
):
	| {
			type: Message;
			required: boolean;
	  }
	| undefined => {
	// Catches Feb 1-2, Feb 3-Mar 1 like strings
	const periodMatcher = new RegExp(
		`(${TWELVE_MONTHS.join("|")}) (\\d{1,2})–(${TWELVE_MONTHS.join(
			"|",
		)})\?\\s\?(\\d{1,2})`,
	);
	const matched = periodMatcher.exec(period);

	if (matched) {
		let [, month, startDate, month2, endDate] = mapToNumber(matched);

		if (month2 && typeof month2 === "string") {
			month2 = getMonthNumber(month2);
		}

		if (typeof month === "string") {
			month = getMonthNumber(month);
		}

		const thisMonth = now.getMonth();
		const currentDate = now.getDate();

		const willCheckIn = month === thisMonth && startDate === currentDate;
		const willCheckOut =
			// today: Jan 15
			// case1: Jan 13-15
			(!month2 && month === thisMonth && endDate === currentDate) ||
			// case2: Jan 30-Feb 15
			(month2 === thisMonth && endDate === currentDate);

		let messageType: Message;

		if (willCheckIn) {
			messageType = CHECK_IN;
		} else if (willCheckOut) {
			messageType = CHECK_OUT;
		}

		return {
			required: willCheckIn || willCheckOut,
			type: messageType,
		};
	}
};

export default needsCheckInOrOut;
