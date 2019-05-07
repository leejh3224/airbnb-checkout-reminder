import { stripIndents } from "common-tags";
import {
	CHECK_IN,
	CHECK_OUT,
	RESERVATION_CONFIRMED,
	SELF_CHECK_IN_BASE_URL,
	SELF_CHECK_IN_LINK,
} from "./constants";
import { ReservationStatus } from "./types";

interface Options {
	aptNumber: string;
}

const getMessage = (type: ReservationStatus, { aptNumber }: Options) => {
	if (!SELF_CHECK_IN_LINK[aptNumber]) {
		throw new Error(
			"알 수 없는 객실입니다. 셀프 체크인 가이드 오브젝트에 추가해주세요.",
		);
	}

	// tslint:disable: max-line-length
	const messageMap: any = {
		[CHECK_IN]: {
			ko: [
				stripIndents`
            오늘은 체크인하는 날이에요. (입실 : 15시)
            다시 한번 셀프 체크인 가이드를 확인해주세요.
            궁금한 점이 있으신가요?
            에어비앤비 메시지를 통해서 호스트와 빠르게 소통하세요~!
            전화 연락은 어려울 수 있습니다.

            그럼 즐거운 여행이 되시길 바래요~!!
            ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}
          `,
			],
			en: [
				stripIndents`
            It's check in day today!
            Please check in after 3:00 PM.
            Do you have questions?
            Please leave an Airbnb message.

            Then have a nice trip :)
            ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}
          `,
			],
		},
		[CHECK_OUT]: {
			ko: [
				stripIndents`
            여행은 즐거우셨나요? ^^
            체크아웃은 11시까지예요.
            퇴실전에 기본적인 뒷정리 부탁드리고, 놓고 가는 물건이 없는 지 한번 더 체크해보세요~

            그리고 높은 평점, 좋은 후기를 적어주시면 감사의 뜻으로 ₩10,000 을 돌려드려요~ ^^

            후기 작성하고 메세지 남겨주세요~`,
			],
			en: [
				stripIndents`
            Did you enjoy the trip?
            You should check out until 11:00 AM.
            Before you leave, please clean up and make sure you take all your belongings with you.

            And if your leave good review, we'll pay you ₩10,00 back :)

            Leave a review and send us Airbnb message.
            Thank you. Have a nice day :)`,
			],
		},
		[RESERVATION_CONFIRMED]: {
			ko: [
				stripIndents`
          포항시 북구 삼호로253번길 17-5 필오피스텔
        `,
				stripIndents`
          안녕하세요 게스트님^^

          * 주소 검색은 위의 메세지를 꾹 눌러 복사하신 후 사용하세요.
          * 체크인: 오후 3시부터
            체크아웃: 오전 11시까지
            (숙소 정리에 오랜 시간이 소요되오니 퇴실 시간을 엄수해주세요^^)
          * 약도 / 체크인 방법 /
          현관 및 숙소 비밀번호 / 숙소 이용 안내/ 주변 맛집 안내는 아래 링크를 통해 체크인 3일 전부터 확인하실 수 있습니다.

          ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}

          * 침구, 소파, 러그의 오염 시 세탁 비용이 청구될 수 있습니다.
        `,
			],
			en: [
				stripIndents`
          17-5, Samho-ro 253beon-gil, Buk-gu, Pohang-si
        `,
				stripIndents`
          Hi!

          We look forward to meeting you.

          * Check-in: After 3:00 PM
          * Check-out: Before 11:00 AM
          (Don't be late for check out time. Please be aware that it takes some time to clean up the room after you check out)

          * You can check information such as
            - map to house
            - how to check in
            - door lock code
            - famous places nearby
          in self check in guide.
          (Self check in guide link will be open 3days before check in)

          ${SELF_CHECK_IN_BASE_URL}/${SELF_CHECK_IN_LINK[aptNumber]}

          * Please be aware that additional fee may charged for spilling on bedding, sofa and lug.
        `,
			],
		},
	};

	return messageMap[type];
};

export default getMessage;
