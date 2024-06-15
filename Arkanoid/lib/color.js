class _HSL {
	constructor(h,s,l,a=1) {
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = 1;
	}
	get vals() {
		const  {h,s,l,a}= this;
		return [h,s,l,a];
	}
	get string() {
		return this.toString();
	}
	toString() {
		const {h,s,l,a}= this;
		return `hsl(${h} ${s}% ${l}% /${a})`;
	}
}
class _RGBA {
	constructor(r,g,b,a=1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = 1;
	}
	get vals() {
		const  {r,g,b,a}= this;
		return [r,g,b,a];
	}
	get string() {
		return this.toString();
	}
	toString() {
		const {r,g,b,a}= this;
		return `rgba(${r} ${g} ${b} /${a})`;
	}
}
export function HSL(...args) {
	return new _HSL(...args);
}
export function RGBA(...args) {
	return new _RGBA(...args);
}
export function hsl(h,s,l,a=1) {
	return `hsl(${h} ${s}% ${l}% /${a})`;
}
export function rgba(r,g,b,a=1) {
	return `rgba(${r} ${g} ${b} /${a})`;
}