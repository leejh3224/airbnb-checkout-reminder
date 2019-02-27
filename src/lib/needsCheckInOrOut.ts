import { Message } from "../types";
import { TWELVE_MONTHS } from "./constants";

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
			type: Message
			required: boolean,
	  }
	| undefined => {
	const periodMatcher = new RegExp(
		`(${TWELVE_MONTHS.join("|")}) (\\d{1,2})–(${TWELVE_MONTHS.join(
			"|",
		)})\?\\s\?(\\d{1,2})`,
	);
	const matched = periodMatcher.exec(period);

	if (matched) {
		// map types to number
		let [, month, startDate, month2, endDate] = mapToNumber(matched);

		if (month2 && typeof month2 === "string") {
			month2 = getMonthNumber(month2);
		}

		if (typeof month === "string") {
			month = getMonthNumber(month);
		}

		const thisMonth = now.getMonth();
		const currentDate = now.getDate();

		const startsThisMonth =
			month === thisMonth && startDate === currentDate;
		const endsThisMonth =
			month === thisMonth && endDate === currentDate;
		const endsNextMonth =
			month2 === thisMonth && endDate === currentDate;

		let messageType: Message;

		if (startsThisMonth) {
			messageType = "check-in";
		}

		if (endsThisMonth || endsNextMonth) {
			messageType = "check-out";
		}

		return {
			required: startsThisMonth || endsThisMonth || endsNextMonth,
			type: messageType,
		};
	}
};

export default needsCheckInOrOut;
