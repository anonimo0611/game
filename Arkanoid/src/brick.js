import {Sound}   from '../snd/sound.js';
import {rgba}    from '../lib/color.js';
import {HSL,hsl} from '../lib/color.js';
import {Ticker}  from '../lib/timer.js';
import {Field}   from './field.js';
import {Scene}   from './scene.js';
import {Game}    from './_main.js';
import {Score}   from './score.js';
import {Stages}  from './stage.js';
import {Paddle}  from './paddle.js';
import {Item}    from './item.js';
import * as Cvs  from './_canvas.js';

const {cvs,ctx,ctxForBrick:ctxB,ctxForShadow:ctxS}= Cvs;

const Cols         = 13;
const Rows         = 30;
const Width        = int(Field.Width/Cols);
const Height       = int(cvs.height /Rows);
const MarginLeft   = Field.Left;
const MarginTop    = Height * 2.0;
const ShadowOffset = Width  * 0.2;
const AnimDuration = 300 / Ticker.Interval;

const BrickType = freeze({
	None:      -1,
	Hard:       0,
	Immortality:1,
	White:      2,
	Red:        3,
	Orange:     5,
	Yellow:     5,
	Green:      6,
	Cyan:       7,
	Blue:       8,
	Pink:       9,
});
const HSLColors = [
	HSL(  0,  0, 70), // Hard
	HSL( 60, 49, 50), // Immortality
	HSL(  0,  0,100), // White
	HSL(  0, 79, 64), // Red
	HSL( 38, 79, 64), // Orange
	HSL( 60, 79, 64), // Yellow
	HSL(120, 79, 64), // Green
	HSL(170, 79, 64), // Cyan
	HSL(220, 79, 64), // Blue
	HSL(300, 79, 64), // Pink
];
const Points = [
	 50, // Hard
	  0, // Immortality
	 50, // White
	 90, // Red
	 60, // Orange
	120, // Yellow
	 80, // Green
	 70, // Cyan
	100, // Blue
	110, // Pink
];

const MapData   = Array(Rows);
const Luster    = new Map();
const Disappear = new Map();

const checkDestroyedOrImmortality = b=>
	b.destroyed || b.type == BrickType.Immortality;

export const BrickG = freeze(new class {
	Type       = BrickType;
	Rows       = Rows;
	Cols       = Cols;
	ColWidth   = Width;
	RowHeight  = Height;
	#destroyed = false;
	get Collider()  {return Collider}
	get destroyed() {return BrickG.#destroyed}

	init() {
		Item.init();
		Luster.clear();
		Disappear.clear();
		const map = Stages[Game.stageIdx];
		for (const row of MapData.keys()) {
			MapData[row] = Array(Cols);
			for (const col of MapData[row].keys())
				MapData[row][col] = new Brick({row,col}, map[row]?.[col]);
		}
		BrickG.#destroyed = false;
		BrickG.#cache();
	}
	update() {
		if (BrickG.#destroyed)
			return;
		if (!MapData.flat().every(checkDestroyedOrImmortality))
			return;
		BrickG.#destroyed = true;
		Luster.clear();
		Disappear.clear();
		if (Scene.isInGame)
			Scene.switch(Scene.enum.Clear);
		if (Scene.isInDemo)
			Scene.switch(Scene.enum.Reset, 1000);
	}
	animation() {
		if (Game.isReadyScene && Ticker.elapsed < 1000)
			return;
		for (const [brick,data] of Luster) {
			if (!Game.isReadyScene && !Game.isPlayScene)
				break;
          	if (data.offset >= 1) {
        		Luster.delete(brick);
        		continue;
        	}
	      	this.#drawLuster(brick,data);
		}
		for (const [brick,data] of Disappear) {
           	const scale = max(data.scale-=1/AnimDuration, 0);
         	if (scale == 0) {
				Disappear.delete(brick);
				continue;
			}
			this.#drawDisappear(brick,scale);
		}
	}
	#drawShadow({x,y,col}) {
		const w = (col == Cols-1) ? (Width+ShadowOffset)-Field.Frame : Width;
		ctxS.save();
			ctxS.translate(x+ShadowOffset, y+ShadowOffset);
			ctxS.fillStyle = rgba(0,0,0,.4);
			ctxS.fillRect(0,0, w,Height);
		ctxS.restore();
	}
	#drawBrick(ctx, brick, {effect=false,grad=null}={}) {
		if (!effect && brick.destroyed)
			return;
		if (!effect)
			this.#drawShadow(brick);

		const {h,s,l}= HSLColors[brick.type];
		if (!grad) {
			grad = ctx.createLinearGradient(0,0,Width,Height);
			grad.addColorStop(0.0, hsl(h,s,l-20));
			grad.addColorStop(0.5, hsl(h,s,l+2));
			grad.addColorStop(1.0, hsl(h,s,l-20));
		}
		// Brick surface
		ctx.fillStyle = grad;
		ctx.fillRect(3, 3, Width-6, Height-6);

		// Highlight(top left)
		ctx.beginPath();
			ctx.moveTo(2,Height-2);
			ctx.lineTo(2,2);
			ctx.lineTo(Width-2,2);
			ctx.lineWidth   = 2;
			ctx.strokeStyle = hsl(h,s,80);
		ctx.stroke();
		// Shadow(bottom right)
		ctx.beginPath();
			ctx.moveTo(Width-2,2);
			ctx.lineTo(Width-2,Height-2);
			ctx.lineTo(2,Height-2);
			ctx.lineWidth   = 2;
			ctx.strokeStyle = hsl(h,s,40);
		ctx.stroke();
	}
	#drawLuster(brick,data) {
  		const {x, y}  = brick;
		const {h,s,l} = brick.color;
		const {offset}= data;
		const grad = ctx.createLinearGradient(0,0,Width,Height);
		grad.addColorStop(0, hsl(h,s,l-20));
		grad.addColorStop(max(offset*.5,0), hsl(h,s,l-20));
		grad.addColorStop(offset, 'white');
		grad.addColorStop(min(offset*.7,1), hsl(h,s,l-20));
		grad.addColorStop(1, hsl(h,s,l-20));
		data.offset = min(data.offset+=1/AnimDuration, 1);

		// Brick surface
      	ctx.save();
	       	ctx.translate(x, y);
			this.#drawBrick(ctx, brick, {grad,effect:true});
      	ctx.restore();

		// Highlight(bottom right)
       	ctx.save();
       	ctx.globalAlpha = 1-data.offset;
       	ctx.translate(x, y);
		ctx.beginPath();
			ctx.moveTo(Width-4,4);
			ctx.lineTo(Width-4,Height-4);
			ctx.lineTo(4,Height-4);
	 		ctx.lineWidth   = 3;
			ctx.strokeStyle = 'white';
		ctx.stroke();
      	ctx.restore();
	}
	#drawDisappear(brick,scale) {
  		const {x, y}= brick;
       	ctx.save();
		ctx.globalAlpha = scale;
      	ctx.translate(x+((Width/2)*(1-scale)),y+((Height/1.5)*(1-scale)));
		ctx.scale(scale,scale);
		this.#drawBrick(ctx, brick, {effect:true});
       	ctx.restore();
	}
	#cache() {
		ctxS.clearRect(0,0, cvs.width,cvs.height);
		ctxB.clearRect(0,0, cvs.width,cvs.height);
		MapData.flat().forEach(brick=> {
			ctxB.save();
			ctxB.translate(brick.x, brick.y);
			this.#drawBrick(ctxB, brick);
			ctxB.restore();
		});
	}
});
const Brick = freeze(class {
	Width        = Width;
	Height       = Height;
	#durability  = 0;
	#pointRate   = 1;
	#destroyed   = false;
	get destroyed() {return this.#destroyed}

	constructor({row,col}, type=BrickType.None) {
		this.row   = row;
		this.col   = col;
		this.x     = (Width *col) + MarginLeft;
		this.y     = (Height*row) + MarginTop;
		this.type  = type;
		this.color = HSLColors[type];
		this.Pos   = vec2(this.x, this.y);

		if (type == BrickType.Hard
		 || type == BrickType.Immortality)
			Luster.set(this, {offset:0});

		this.#destroyed  = (type == BrickType.None);
		this.#durability = this.#durabilityMax;
		freeze(this);
	}
	get #durabilityMax() {
		if (this.type == BrickType.Immortality)
			return Infinity;
		if (this.type == BrickType.Hard) {
			this.#pointRate = Game.stageNum;
			if (Game.stageNum == 10)
				return 3;
			if (Game.stageNum >= 8)
				return 2;
			return 1;
		}
	}
	collision() {
		this.#durability-- > 0
			? this.#holdUp()
			: this.#destroy(this.Pos);
		return this;
	}
	#holdUp() {
		if (Luster.has(this))
			return;
		if (Luster.size <= 4)
			Sound.stop('se2').play('se2');
		Luster.set(this, {offset:0});
	}
	#destroy({x, y}) {
		this.#destroyed = true;
		Luster.delete(this);
		Disappear.set(this, {scale:1});
		ctxB.clearRect(x, y, Width,Height);
		ctxS.clearRect(x+ShadowOffset, y+ShadowOffset, Width,Height);
		Sound.stop('se1').play('se1');
		if (this.type != BrickType.Hard)
			Item.appear(this);
		if (Scene.isInGame)
			Score.add(Points[this.type*this.#pointRate]);
	}
	getAdjacent(x=0, y=0) {
		return MapData[this.row+y]?.[this.col+x] || {exists:false};
	}
	get exists(){return !this.destroyed}
	get Left()  {return this.getAdjacent(-1, 0)}
	get Right() {return this.getAdjacent( 1, 0)}
	get Up()    {return this.getAdjacent( 0,-1)}
	get Down()  {return this.getAdjacent( 0, 1)}
});
class Collider {
	constructor({x, y}, radius) {
		this.Pos    = vec2(x, y);
		this.Radius = radius;
	}
	tilePos({x=0, y=0}={}) {
		const col = int((this.Pos.x+x - MarginLeft) / Width);
		const row = int((this.Pos.y+y - MarginTop)  / Height);
		return {row,col}
	}
	getBrick({row,col}=this.tilePos(), {y=0,x=0}={}) {
		return MapData[row+y]?.[col+x];
	}
	get brickExistsOnBothSides() {
		const brick = this.getBrick();
		return brick?.Left?.exists && brick?.Right?.exists;
	}
	get brickExistsOnOneSide() {
		const brick = this.getBrick();
		return brick?.Left?.exists || brick?.Right?.exists;
	}
	#detect(ox=0, oy=0) {
		const offset = vec2(ox, oy).mul(this.Radius);
		const point  = vec2(this.Pos).add(offset);
        if (point.x <  Field.Left
         || point.x >= Field.Right
         || point.y <  Field.Top
         || point.y >  Field.Bottom+this.Radius
        ) return Field;

        const brick = this.getBrick(this.tilePos(offset));
		return brick?.exists ? brick : null;
	}
	get hitT() {return this.#detect( 0,-1)}
	get hitR() {return this.#detect( 1, 0)}
	get hitB() {return this.#detect( 0, 1)}
	get hitL() {return this.#detect(-1, 0)}
	get hitLT(){return this.#detect(-1,-1)}
	get hitRT(){return this.#detect( 1,-1)}
	get hitLB(){return this.#detect(-1, 1)}
	get hitRB(){return this.#detect( 1, 1)}
}