// status
export const CHECK_IN = "check-in";
export const CHECK_OUT = "check-out";
export const GUEST_STAYING = "guest-staying";
export const OUT_OF_RANGE = "out-of-range";
export const RESERVATION_CONFIRMED = "reservation-confirmed";

// languages
export const LANGUAGE_KOREAN = "ko";
export const LANGUAGE_ENGLISH = "en";
export const LANGUAGE_UNKNOWN = "und";

export const SELF_CHECK_IN_LINK: { [key: string]: string } = {
	201: "27092267",
	302: "31765470",
	304: "31765531",
	406: "30923304",
	408: "32050698",
	503: "29767093",
	308: "33443064",
	403: "33443644",
	405: "33443985",
	501: "34123213",
	301: "34342772",
};

export const GMAIL_SCOPES = [
	"https://www.googleapis.com/auth/gmail.modify",
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/gmail.send",
];
export const OAUTH_SERVER_PORT = 3001;

export const SELF_CHECK_IN_BASE_URL =
	"https://www.airbnb.com/reservation/check-in-guide";
export const AIRBNB_LOGIN_URL = "https://www.airbnb.com/login";

// schedules
export const CHECK_IN_REMINDER_START_HOUR = 7;
export const CHECK_IN_REMINDER_START_MINUTES = 40;
export const ANSWER_TO_RESERVATION_PERIOD = 10;

export const TEST_RESERVATION_CODE = "HMPSHBSPMJ";
