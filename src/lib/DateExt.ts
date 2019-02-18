interface Date {
	add({ hour, minutes }: { hour?: number; minutes?: number }): Date;
}

Date.prototype.add = function({ hour, minutes }) {
	if (hour) {
		this.setHours(this.getHours() + hour);
	}

	if (minutes) {
		this.setMinutes(this.getMinutes() + minutes);
	}

	return this;
};
