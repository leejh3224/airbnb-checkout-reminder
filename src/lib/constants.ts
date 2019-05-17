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

export const ROOM_ID_MAP: { [roomName: string]: string } = {
	"*포항 영일대 해수욕장 도보5분 #201 Joy’s Cozy House": "27092267",
	"*포항 영일대 해수욕장 도보5분 #302 Joy’s Cozy House": "31765470",
	"*포항 영일대 해수욕장 도보5분 #304 Joy’s Cozy House": "31765531",
	"*포항 영일대 해수욕장 도보5분 #406 Joy’s Cozy House": "30923304",
	"*포항 영일대 해수욕장 도보5분 #408 Joy’s Cozy House": "32050698",
	"*포항 영일대 해수욕장 도보5분 #503 Joy’s Cozy House": "29767093",
	"*포항 영일대 해수욕장 도보5분 #308 Joy’s Cozy House": "33443064",
	"*포항 영일대 해수욕장 도보5분 #403 Joy’s Cozy House": "33443644",
	"*포항 영일대 해수욕장 도보5분 #405 Joy’s Cozy House": "33443985",
	"*포항 영일대 해수욕장 도보5분 #501 Joy’s Cozy House": "34123213",
	"*포항 영일대 해수욕장 도보5분 #301 Joy’s Cozy House": "34342772",
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
