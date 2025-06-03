export class Rect {
	#vals = /** @type {readonly [x:number, y:number, w:number, h:number]} */
		([0,0,0,0])
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(x,y,w,h) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.#vals = freeze([x,y,w,h])
		freeze(this)
	}
	/** @param {Position} pos */
	contains(pos) {
		const [x,y,w,h]=this.#vals
		return (
			between(pos?.x, x, x+w) &&
			between(pos?.y, y, y+h) )
	}
	get vals() {return this.#vals}
}