export class Rect {
	constructor(
		/**@type {number}*/x,
		/**@type {number}*/y,
		/**@type {number}*/w,
		/**@type {number}*/h,
	) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}
	freeze() {
		return freeze(this)
	}
	contains(/**@type {Position}*/pos) {
		const {x,y,w,h}=this
		return (
			(pos.x >= x && pos.x < x+w) &&
			(pos.y >= y && pos.y < y+h))
	}
	/** @returns {readonly [x:number, y:number, w:number, h:number]} */
	get vals() {
		const {x,y,w,h}=this
		return ([x,y,w,h])
	}
}