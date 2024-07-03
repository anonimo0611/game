export class Rect {
	#width = 0;
	constructor({x, y}, width, height) {
		this.Pos    = vec2(x, y);
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
		if (obj instanceof Rect === false) {
			return false;
		}
		const {x:aX,y:aY,Width:aW,Height:aH}= this;
		const {x:bX,y:bY,Width:bW,Height:bH}= obj;
		const aPos = vec2(aX, aY);
		const bPos = vec2(bX, bY);
		return (
			abs((aPos.x+aW/2)-(bPos.x+bW/2)) < (aW+bW)/2 &&
			abs((aPos.y+aH/2)-(bPos.y+bH/2)) < (aH+bH)/2);
	}
}