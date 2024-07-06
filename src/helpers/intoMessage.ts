
export function intoMessage(status: string): string {
	return status.split("_").join(" ").toLowerCase();
}