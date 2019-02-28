import { detectLanguage, needsCheckInOrOut } from "./src/lib";
import { CHECK_IN, CHECK_OUT } from "./src/lib/constants";

describe("needsCheckInOrOut", () => {
	const date = new Date("2019 1. 15.");

	test.each([
		["Jan 13–18, 2019", date, { required: false, type: undefined }],
		["Jan 13–15, 2019", date, { required: true, type: CHECK_OUT }],
		["Jan 15–17, 2019", date, { required: true, type: CHECK_IN }],
		["Jan 15–Feb 1, 2019", date, { required: true, type: CHECK_IN }],
		[
			"Dec 31–Jan 15, 2019",
			date,
			{ required: true, type: CHECK_OUT },
		],
	])("input: %s", (a, b, expected) => {
		expect(needsCheckInOrOut(a, b)).toEqual(expected);
	});
});

describe.skip("detect language", () => {
	test.each([
		[
			"안녕하세요!숙소 문의드리고싶어서요�혹시 집에서 바다가 보이나요?",
			"ko",
		],
		[
			"hello, we are coming from germany and looking forward to staying at your place :)",
			"en",
		],
		["Qu'est-ce que vous faites?", "en"], // detect french then reply english
		[".", "ko"],
		["", "ko"],
	])("should detect `%s` to `%s`", async (input, output, done) => {
		const lang = await detectLanguage(input);
		expect(lang).toBe(output);
		done();
	});
});
