import {Vec2}     from '../lib/vec2.js';
import {Field}    from './field.js';
import {BrickMgr} from './brick.js';

export class Rect {
	#width = 0;
	constructor({x, y}, width, height, radius=0) {
		this.Pos    = Vec2(x, y);
		this.#width = width;
		this.Height = height;
		this.Radius = radius;
	}
	get x()       {return this.Pos.x}
	get y()       {return this.Pos.y}
	get Width()   {return this.#width}
	get TilePos() {return this.OffsetTilePos()}

	OffsetTilePos({x=0, y=0}={}) {
		const col = int((this.x+x - Field.Left) / Field.ColWidth);
		const row = int((this.y+y - Field.Top)  / Field.RowHeight);
		return {row,col}
	}
	getBrick({row,col}=this.TilePos, {y=0,x=0}={}) {
		return BrickMgr.MapData[row+y]?.[col+x];
	}
	contains({x:_x, y:_y}={}) {
		const {x,y,Radius:r,Width:w,Height:h}= this;
		return between(_x+r, x, x+w) && between(_y+r, y, y+h);
	}
	collisionRect(obj) {
		if (obj instanceof Rect === false) {
			return false;
		}
		const {x:aX,y:aY,Width:aW,Height:aH,Radius:aR}= this;
		const {x:bX,y:bY,Width:bW,Height:bH,Radius:bR}= obj;
		const aPos = Vec2(aX, aY).sub(aR);
		const bPos = Vec2(bX, bY).sub(bR);
		return (
			abs((aPos.x+aW/2)-(bPos.x+bW/2)) < (aW+bW)/2 &&
			abs((aPos.y+aH/2)-(bPos.y+bH/2)) < (aH+bH)/2);
	}
}
export class Collider extends Rect {
	constructor(pos, radius) {
		super(pos, radius*2, radius*2, radius);
	}
	#detect(ox=0, oy=0) {
		const offset = Vec2(ox, oy).mul(this.Radius);
		const point  = Vec2(this.Pos).add(offset);
        const brick  = this.getBrick( this.OffsetTilePos(offset) );
        if (point.x < Field.Left
         || point.x > Field.Right
         || point.y < Field.Top
        ) {return Field}
		return brick?.exists ? brick : null;
	}
	#collidedWith(fn) {
		return [this.hitL,this.hitR,this.hitB,this.hitT].find(fn);
	}
	get collidedBrick() {
		return this.#collidedWith(BrickMgr.isBrick);
	}
	get collidedField() {
		return this.#collidedWith(obj=> obj == Field);
	}
	get hitT()    {return this.#detect( 0, -1)}
	get hitR()    {return this.#detect( 1,  0)}
	get hitB()    {return this.#detect( 0,  1)}
	get hitL()    {return this.#detect(-1,  0)}
	get hitLT()   {return this.#detect(-1, -1)}
	get hitRT()   {return this.#detect( 1, -1)}
	get hitLB()   {return this.#detect(-1,  1)}
	get hitRB()   {return this.#detect( 1,  1)}
	get hitLB3Q() {return this.#detect(-1.10, 0.75)}
	get hitRB3Q() {return this.#detect( 1.10, 0.75)}
}