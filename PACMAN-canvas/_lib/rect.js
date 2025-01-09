export class Rect {
	#vals = [0,0,0,0]
	constructor(x=0,y=0,w=0,h=0) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.#vals = freeze([x,y,w,h])
		freeze(this)
	}
	get vals() {return this.#vals}
	contains(pos={}) {
		const [x,y,w,h]=this.#vals
		return (
			between(pos?.x, x, x+w) &&
			between(pos?.y, y, y+h) )
	}
}