export class Rect {
	constructor(x, y, w, h) {
		this.x  = x;
		this.y  = y;
		this.w  = w;
		this.h  = h;
		this.ex = x+w;
		this.ey = y+h;
		freeze(this);
	}
	contains({x, y}={}) {
		return (
			between(x, this.x, this.ex) &&
			between(y, this.y, this.ey)
		);
	}
}