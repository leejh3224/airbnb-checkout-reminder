import { CHECK_IN, CHECK_OUT, GUEST_STAYING, OUT_OF_RANGE } from "./constants";
import getReservationStatus from "./getReservationStatus";
import { parseReservationDates } from "./getReservationStatus";
import { ReservationStatus } from "./types";

describe("getReservationStatus", () => {
	it("parses given period of reservation", () => {
		const period = "Jan 13–18, 2019";

		const parsed = parseReservationDates(period);

		expect(parsed.start.month).toEqual(0);
		expect(parsed.start.day).toEqual(13);
		expect(parsed.end.month).toEqual(0);
		expect(parsed.end.day).toEqual(18);
	});

	describe("returns guest's status for given period", () => {
		const now = new Date("2019 1. 15.");

		test.each([
			["Jan 13–18, 2019", GUEST_STAYING],
			["Jan 13–15, 2019", CHECK_OUT],
			["Jan 15–17, 2019", CHECK_IN],
			["Jan 15–Feb 1, 2019", CHECK_IN],
			["Jan 30–Feb 1, 2019", OUT_OF_RANGE],
			["Dec 31–Jan 15, 2019", CHECK_OUT],
		])(
			"given: %s, status: %s",
			(input: string, expected: ReservationStatus) => {
				expect(getReservationStatus(input, now)).toEqual(expected);
			},
		);
	});
});
