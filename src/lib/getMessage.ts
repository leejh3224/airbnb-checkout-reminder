import { stripIndents } from "common-tags";
import { Message } from "../types";
import {
	MAP_TO_HOUSE_URL,
	SELF_CHECK_IN_BASE_URL,
	SELF_CHECK_IN_LINK,
} from "./constants";

interface Options {
	aptNumber: string;
}

const getMessage = (
	type: Message,
	{ aptNumber }: Options,
): { [key: string]: string[] } | undefined => {
	if (!SELF_CHECK_IN_LINK[aptNumber]) {
		throw new Error(
			"알 수 없는 객실입니다. 셀프 체크인 가이드 오브젝트에 추가해주세요.",
		);
	}

	if (type !== undefined) {
		return {
			"check-in": {
				ko: [
					stripIndents`
            오늘은 체크인하는 날이에요.
            3시부터 체크인해주시면 돼요.
            다시 한번 셀프 체크인 가이드를 확인해주세요.
            즐거운 여행이 되시길 바래요~!!`,
					stripIndents`
            이 링크를 누르면 셀프 체크인 가이드로 이동됩니다.
            ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}
            `,
				],
				en: [
					stripIndents`
            It's check in day today!
            Please check in after 3:00 PM.
            Check out self check in guide to know how to do check in.
            Have a nice trip :)`,
					stripIndents`
            You can checkout self check in guide in the link below.
            ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}
            `,
				],
			},
			"check-out": {
				ko: [
					stripIndents`
            여행은 즐거우셨나요?
            체크아웃은 11시까지 해주시면 돼요.
            퇴실 전에 기본적인 뒷정리 부탁드리고,
            혹시 놓고가시는 물건이 없는지 한번 더 체크해보세요~

            소중한 추억을 만드는데 저희가 도움이 되었기를 바랍니다.
            안녕히 가세요 ^^`,
				],
				en: [
					stripIndents`
            Did you enjoyed the trip?
            You should check out until 11:00 AM.
            Before you leave, please clean up and make sure you take all your belongings with you.
            Thank you. Have a nice day :)`,
				],
			},
			"reservation-confirmed": {
				ko: [
					stripIndents`
            안녕하세요~ ^^
            저희 숙소를 선택해 주셔서 감사합니다.

            * 주소: 포항시 북구 삼호로253번길 17-5 필오피스텔

            ${MAP_TO_HOUSE_URL}

            * 체크인: 오후 3시부터
            * 체크아웃: 오전 11시까지
            (퇴실 시간을 엄수해주시길 간곡히 부탁드립니다 ^^ 숙소 정리에 오랜 시간이 소요되오니 너그러이 이해해주세요.)

            * 흡연은 절대 금지입니다!

            * 침구, 쇼파, 러그의 오염 시(주스, 기름, 양념 자국 등) 추가 세탁 비용이 청구되오니 조금만 주의해주세요.

            * 퇴실 전 설거지와 분리수거를 비롯한 기본적인 뒷정리를 꼭 부탁드립니다.

            * 약도/숙소 체크인 방법/비밀 번호/이용 가이드/맛집 정보는 체크인 3일전부터 셀프 체크인 가이드를 통해서 확인 가능 합니다. (아래 링크)

            ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}
          `,
				],
				en: [
					stripIndents`
            Hi!

            We look forward to meeting you.

            * Address: 17-5, Samho-ro 253beon-gil, Buk-gu, Pohang-si

            ${MAP_TO_HOUSE_URL}

            * Check-in: After 3:00 PM
            * Check-out: Before 11:00 AM
            (Don't be late for check out time. Please be aware that it takes some time to clean up the room after you check out)

            Here are some helpful information.

            * Don't smoke in the room.

            * Please be aware that additional fee may charged for spilling on bedding, sofa and lug.

            * Before you leave, make sure you did the dishes and separated the collection of waste.

            * You can check information such as
              - map to house
              - how to check in
              - door lock code
              - famous places nearby
            in self check in guide.
            (Self check in guide link will be open 3days before check in)

            ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}
          `,
				],
			},
		}[type];
	}
};

export default getMessage;
