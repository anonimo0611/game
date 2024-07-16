import {Vec2} from './vec2.js';
export class Rect {
	#width = 0;
	constructor({x, y}, width, height) {
		this.Pos    = Vec2(x, y);
		this.Size   = Vec2(width, height);
		this.Width  = width;
		this.Height = height;
	}
	get x() {return this.Pos.x}
	get y() {return this.Pos.y}
	contains({x:_x, y:_y}={}) {
		const {x,y,Width:w,Height:h}= this;
		return between(_x, x, x+w) && between(_y, y, y+h);
	}
	collisionRect(obj) {
		if (obj instanceof Rect === false) {return false}
		const {x:aX,y:aY,Width:aW,Height:aH}= this;
		const {x:bX,y:bY,Width:bW,Height:bH}= obj;
		return (
			abs((aX+aW/2)-(bX+bW/2)) < (aW+bW)/2 &&
			abs((aY+aH/2)-(bY+bH/2)) < (aH+bH)/2);
	}
}