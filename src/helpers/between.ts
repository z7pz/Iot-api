export const between = function (a, b, inclusive) {
	return (n) => {
		var min = Math.min(a, b),
			max = Math.max(a, b);

		return inclusive ? n >= min && n <= max : n > min && n < max;
	};
};