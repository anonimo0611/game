class _HSL {
	constructor(h,s,l,a=1) {
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = 1;
	}
	get vals() {
		return Object.values(this);
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
		return Object.values(this);
	}
	toString() {
		const {r,g,b,a}= this;
		return `rgba(${r} ${g} ${b} /${a})`;
	}
}
export const HSL  = (...args)=> new _HSL (...args);
export const RGBA = (...args)=> new _RGBA(...args);
export const hsl  = (h,s,l,a=1)=> `hsl(${h} ${s}% ${l}% /${a})`;
export const rgba = (r,g,b,a=1)=> `rgba(${r} ${g} ${b} /${a})`;