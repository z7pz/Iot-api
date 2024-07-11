export const PUBLIC_DEVICES = process.env.PUBLIC_DEVICES.split(",").filter(
	(c) => !isNaN(+c)
);
