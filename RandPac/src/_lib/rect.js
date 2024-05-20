import {Vec2} from './vec2.js';
export class Rect {
	constructor(x, y, width, height) {
		this.Width  = width;
		this.Height = height;
		this.Left   = this.x  = x;
		this.Top    = this.y  = y;
		this.Right  = this.ex = x+width;
		this.Bottom = this.ey = y+height;
		freeze(this);
	}
	get vals() {
		return [this.x,this.y,this.Width,this.Height];
	}
	mul(n) {
		return new Rect(...this.vals.map(val=> val*n));
	}
	outer(n) {
		n = max(n, 0) |0;
		const {x,y,ex,ey}= this;
		return new Rect(x-n, y-n, (ex+n)-(x-n), (ey+n)-(y-n));
	}
	contains({x, y}={}) {
		return (
			between(x, this.x, this.ex) &&
			between(y, this.y, this.ey)
		);
	}
}
Rect.surround = ({x:sx, y:sy}, n=1)=> {
	if (n <= 0) return [];
	const ret = [];
	const [xmin,xmax,ymin,ymax] = [sx-n,sx+n,sy-n,sy+n];
	for (let x=xmin; x<=xmax; x++)
		ret.push(Vec2(x, ymin));
	for (let y=ymin+1; y<=ymax-1; y++) {
		ret.push(Vec2(xmin,y));
		ret.push(Vec2(xmax,y));
	}
	for (let x=xmin; x<=xmax; x++)
		ret.push(Vec2(x, ymax));
	return ret;
};
freeze(Rect);