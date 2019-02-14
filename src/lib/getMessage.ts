// predefined check-in/out message
const getMessage = (type: "check-in" | "check-out") => {
	return {
		"check-in":
			"오늘은 체크인하는 날이예요. 다시 한번 셀프 체크인 가이드를 확인해주세요. 즐거운 여행이 되시길 바래요~!!",
		"check-out": `체크아웃은 12시까지 해주시면 되요. 혹시 놓고가시는 물건이 없는 지 한번 더 체크해보세요~
소중한 추억을 만드는데 저희가 도움이 되었기를 바랍니다.
안녕히 가세요 ^^`,
	}[type];
};

export default getMessage;
