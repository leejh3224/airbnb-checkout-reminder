import { stripIndents } from "common-tags";
import { checkInOut } from "../types";

// TODO: send image in inbox
const getMessage = (
	type: checkInOut,
): { [key: string]: string[] } | undefined => {
	if (type !== undefined) {
		return {
			"check-in": {
				ko: [
					stripIndents`
            오늘은 체크인하는 날이에요.
            3시부터 체크인해주시면 돼요.
            다시 한번 셀프 체크인 가이드를 확인해주세요.
            즐거운 여행이 되시길 바래요~!!`,
				],
				en: [
					stripIndents`
            It's check in day today!
            Please check in after 3:00 PM.
            Check out self check in guide to know how to do check in.
            Have a nice trip :)`,
				],
			},
			"check-out": {
				ko: [
					stripIndents`
            체크아웃은 12시까지 해주시면 돼요.
            혹시 놓고가시는 물건이 없는지 한번 더 체크해보세요~
            소중한 추억을 만드는데 저희가 도움이 되었기를 바랍니다.
            안녕히 가세요 ^^`,
				],
				en: [
					stripIndents`
            Did you enjoyed the trip?
            You should check out until 12:00 PM.
            Please make sure you take all your belongings with you when you leave the room.
            Thank you. Have a nice day :)`,
				],
			},
		}[type];
	}
};

export default getMessage;
