const time = document.getElementById("time");
const day = document.getElementById("day");
const midday = document.getElementById("midday");

let clock = setInterval(
	function calcTime() {
		let date_now = new Date();
		let hr = date_now.getHours();
		let min = date_now.getMinutes();
		let sec = date_now.getSeconds();
		let middayValue = "AM";

		let days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		];

		day.textContent = days[date_now.getDay()];

		middayValue = hr >= 12 ? "PM" : "AM";

		if (hr == 0) {
			hr = 12;
		} else if (hr > 12) {
			hr -= 12;
		}

		hr = hr < 10 ? "0" + hr : hr;
		min = min < 10 ? "0" + min : min;
		sec = sec < 10 ? "0" + sec : sec;

		time.textContent = hr + ":" + min + ":" + sec;
		midday.textContent = middayValue;
	},

	1000
);