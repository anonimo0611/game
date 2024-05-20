class _RGBA {
	constructor(r,g,b,a=1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = 1;
	}
	get string() {
		return this.toString();
	}
	toString() {
		const {r,g,b,a}= this;
		return `rgba(${r},${g},${b},${a})`;
	}
}
export function RGBA(...args) {
	return new _RGBA(...args);
}
export function rgba(r,g,b,a=1) {
	return `rgba(${r},${g},${b},${a})`;
}