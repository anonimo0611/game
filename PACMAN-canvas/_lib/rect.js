export class Rect {
	constructor(
	/**@type {number}*/x,
	/**@type {number}*/y,
	/**@type {number}*/width,
	/**@type {number}*/height,
	) {
		this.x = x
		this.y = y
		this.width  = width
		this.height = height
	}
	freeze() {
		return freeze(this)
	}
	contains(/**@type {Readonly<Position>}*/pos) {
		const {x,y,width:w,height:h}=this
		return (
			(pos.x >= x && pos.x < x+w) &&
			(pos.y >= y && pos.y < y+h))
	}
	/** @returns {readonly [x:number, y:number, width:number, height:number]} */
	get vals() {
		return ([this.x, this.y, this.width, this.height])
	}
}