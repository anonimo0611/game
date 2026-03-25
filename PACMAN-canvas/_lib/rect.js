export class Rect {
	/**
	 @param {number} x
	 @param {number} y
	 @param {number} width
	 @param {number} height
	*/
	constructor(x,y,width,height) {
		this.x = x
		this.y = y
		this.w = width
		this.h = height
	}
	freeze() {
		return freeze(this)
	}

	/**
	 @param {Position} pos
	*/
	contains(pos) {
		const {x,y,w,h}= this
		return (
			(pos.x >= x && pos.x < x+w) &&
			(pos.y >= y && pos.y < y+h)
		)
	}

	/**
	 @returns {readonly [x:number, y:number, w:number, h:number]}
	*/
	get vals() {return ([this.x, this.y, this.w, this.h])}
}