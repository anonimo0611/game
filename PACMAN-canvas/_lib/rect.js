export class Rect {
	/**
	 * @readonly
	 * @type {readonly [x:number, y:number, w:number, h:number]}
	 */#vals
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
		this.#vals = freeze([x,y,w,h])
		freeze(this)
	}
	contains(/**@type {Position}*/pos) {
		const [x,y,w,h]=this.#vals
		return (
			between(pos?.x, x, x+w) &&
			between(pos?.y, y, y+h) )
	}
	get vals() {return this.#vals}
}