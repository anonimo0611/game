import {Vec2}	 from '../lib/vec2.js';
import {Sound}	 from '../snd/sound.js';
import {rgba}	 from '../lib/color.js';
import {HSL,hsl} from '../lib/color.js';
import {Ticker}  from '../lib/timer.js';
import {Field}	 from './field.js';
import {Scene}	 from './scene.js';
import {Game}	 from './_main.js';
import {Score}	 from './score.js';
import {Stages}  from './stage.js';
import {Paddle}  from './paddle.js';
import {ItemMgr} from './item.js';
import * as Cvs  from './_canvas.js';

const {cvs,ctx,ctxBrick:ctxB,ctxShadow:ctxS}= Cvs;
const {Frame,Cols,Rows,ColWidth,RowHeight}= Field;

const LineWidth    = int(cvs.width/315);
const ShadowOffset = ColWidth * 0.2;
const AnimDuration = 250 / Ticker.Interval;

export const BrickType = freeze({
	None:	   -1,
	Immortality:0,
	Hard:		1,
	White:		2,
	Red:		3,
	Orange: 	5,
	Yellow: 	5,
	Green:		6,
	Cyan:		7,
	Blue:		8,
	Pink:		9,
});
const BrickHSLTable = deepFreeze([
	[ 60, 49, 50], // Immortality
	[212,  0, 70], // Hard
	[  0,  0,100], // White
	[  0, 79, 64], // Red
	[ 38, 79, 64], // Orange
	[ 60, 79, 64], // Yellow
	[120, 79, 64], // Green
	[170, 79, 64], // Cyan
	[220, 79, 64], // Blue
	[300, 79, 64], // Pink
]);
const BrickPtsTable = freeze([
	  0, // Immortality
	 50, // Hard
	 50, // White
	 90, // Red
	 60, // Orange
	120, // Yellow
	 80, // Green
	 70, // Cyan
	100, // Blue
	110, // Pink
]);

const MapData = [...Array(Rows)].map(_=> Array(Cols));
const LusterMap    = new Map();
const DisappearMap = new Map();

export const BrickMgr = freeze(new class {
	MapData    = MapData;
	Type	   = BrickType;
	Rows	   = Rows;
	Cols	   = Cols;
	ColWidth   = ColWidth;
	RowHeight  = RowHeight;
	#brokenAll = false;
	get remains() {
		return MapData.flat().filter(d=> d.isBreakable).length;
	}
	get brokenAll() {
		return this.#brokenAll;
	}
	isBrick(obj) {
		return obj instanceof Brick;
	}
	isBreakable({col,row}={}) {
		return !!MapData?.[row]?.[col]?.isBreakable;
	}
	init() {
		LusterMap.clear();
		DisappearMap.clear();
		const map = Stages[Game.stageIdx];
		for (const row of integers(Rows)) {
			for (const col of integers(Cols)) {
				MapData[row][col] =	new Brick(row, col, map[row]?.[col]);
			}
		}
		this.#brokenAll = false;
		View.cache();
	}
	animation() {
		if (Game.isReadyScene && Ticker.elapsed < 300) {return}
		for (const [brick,data] of LusterMap) {
		  	if (data.offset >= 1) {
				LusterMap.delete(brick);
				continue;
			}
		  	View.drawLuster(brick, data);
		}
		for (const [brick,data] of DisappearMap) {
		   	const scale = max(data.scale-=1/AnimDuration, 0);
		 	if (scale == 0) {
				DisappearMap.delete(brick);
				continue;
			}
			View.drawDisappear(brick, scale);
		}
	}
	update() {
		if (this.brokenAll) {return}
		if (!MapData.flat().every(b=> !b.isBreakable)) {return}
		this.#brokenAll = true;
		LusterMap.clear();
		DisappearMap.clear();
		if (Scene.isInGame) {
			Scene.switchToClear();
		}
		if (Scene.isInDemo) {
			Scene.switchToEndDemo();
			Scene.switchToReset(1000);
		}
	}
});
class Brick {
	Width		= ColWidth;
	Height		= RowHeight;
	#type		= BrickType.None;
	#pointRate	= 1;
	#durability = 0;
	get type()			{return this.#type}
	get durability()	{return this.#durability}
	get exists()		{return !this.isNone}
	get isBreakable()	{return this.type >  BrickType.Immortality}
	get isImmortality() {return this.type == BrickType.Immortality}
	get isNone()		{return this.type == BrickType.None}
	get isHard()		{return this.type == BrickType.Hard}
	get isNormal()		{return this.isBreakable && !this.isHard}

	constructor(row, col, type=BrickType.None) {
		this.row   = row;
		this.col   = col;
		this.x	   = (ColWidth *col) + Field.Left;
		this.y	   = (RowHeight*row) + Field.Top;
		this.Pos   = Vec2(this.x, this.y);
		this.#type = type;
		this.color = type >= 0 ? HSL(...BrickHSLTable[type]) : null;

		if (type == BrickType.Hard
		 || type == BrickType.Immortality) {
			LusterMap.set(this, {offset:0});
		}
		this.#durability   =
		this.DurabilityMax = this.#getDurabilityMax();
		freeze(this);
	}
	containsX(v)	{return between(v, this.x, this.x+this.Width) }
	containsY(v)	{return between(v, this.y, this.y+this.Height)}
	contains({x,y}) {return this.containsX(x) && this.containsY(y)}

	getAdjacent(x=0, y=0) {
		return MapData[this.row+y]?.[this.col+x] || {exists:false};
	}
	get AdjL() {return this.getAdjacent(-1, 0)}
	get AdjR() {return this.getAdjacent( 1, 0)}
	get AdjU() {return this.getAdjacent( 0,-1)}
	get AdjD() {return this.getAdjacent( 0, 1)}

	#getDurabilityMax() {
		if (this.isImmortality) {
			return Infinity;
		}
		if (this.isHard) {
			this.#pointRate = Game.stageNum;
			if (Game.stageNum == 10) return 3;
			if (Game.stageNum >=  8) return 2;
			return 1;
		}
	}
	crash() {
		this.#durability-- > 0
			? this.#holdUp()
			: this.#destroy(this);
		return this;
	}
	#holdUp() {
		if (this.isHard) {
			const {durability:d}= this;
			this.color.s += 30 - 30/this.DurabilityMax * d;
			this.color.l -= 30 - 30/this.DurabilityMax * d;
			this.color.a = min((1/this.DurabilityMax * d)+0.5, 1);
			View.drawBrick(this);
		}
		if (!LusterMap.has(this)) {
			Sound.stop('se1').stop('se2').play('se2');
			LusterMap.set(this, {offset:0});
		}
	}
	#destroy({Pos,type}) {
		LusterMap.delete(this);
		DisappearMap.set(this, {scale:1});
		View.destroy(Pos);
		Sound.stop('se1').stop('se2').play('se1');
		if (this.isNormal) {
			ItemMgr.appear(this);
		}
		if (Scene.isInGame) {
			Score.add(BrickPtsTable[type] * this.#pointRate);
		}
		this.#type = BrickType.None;
	}
} freeze(Brick);

const View = freeze(new class {
	#drawShadow({x,y,col,color}) {
		ctxS.save();
		ctxS.fillStyle = rgba(0,0,0, color.a*0.4);
		ctxS.translate(x+ShadowOffset, y+ShadowOffset);
		ctxS.clearRect(0,0, ColWidth,RowHeight);
		ctxS.fillRect (0,0, ColWidth,RowHeight);
		ctxS.restore();
	}
	#drawBrick(ctx, brick, {effect=false,Grad=null}={}) {
		if (!effect && brick.isNone) {return}
		if (!effect) {this.#drawShadow(brick)}
		const {h,s,l,a}= brick.color, LW = LineWidth;

		Grad ??= ctx.createLinearGradient(0,0,ColWidth,RowHeight);
		Grad.addColorStop(0.0, hsl(h,s,l-20,a));
		Grad.addColorStop(0.5, hsl(h,s,l+2, a));
		Grad.addColorStop(1.0, hsl(h,s,l-20,a));

		// Surface
		ctx.lineWidth = LW;
		ctx.fillStyle = Grad;
		ctx.clearRect(LW*1.5, LW*1.5, ColWidth-LW*3, RowHeight-LW*3);
		ctx.fillRect (LW*1.5, LW*1.5, ColWidth-LW*3, RowHeight-LW*3);

		// Top and left edges
		ctx.beginPath();
			ctx.strokeStyle = hsl(h,s,80);
			ctx.moveTo(LW, RowHeight-LW);
			ctx.lineTo(LW, LW);
			ctx.lineTo(ColWidth-LW, LW);
		ctx.stroke();

		// Bottom and right edges
		ctx.beginPath();
			ctx.strokeStyle = hsl(h,s,40);
			ctx.moveTo(ColWidth-LW, LW);
			ctx.lineTo(ColWidth-LW, RowHeight-LW);
			ctx.lineTo(LW, RowHeight-LW);
		ctx.stroke();
	}
	drawLuster(brick,data) {
  		const {x, y}    = brick;
		const {h,s,l,a} = brick.color;
		const {offset}  = data;
		const faceColor = hsl(h,s,l-20,a);

		const
		Grad = ctx.createLinearGradient(0,0,ColWidth,RowHeight);
		Grad.addColorStop(0,                  faceColor);
		Grad.addColorStop(max(offset*0.5, 0), faceColor);
		Grad.addColorStop(offset,            '#FFF');
		Grad.addColorStop(min(offset*0.7, 1), faceColor);
		Grad.addColorStop(1,                  faceColor);
		data.offset = min(data.offset+1/AnimDuration, 1);

		// Brick surface
	  	ctx.save();
	   	ctx.translate(x+ColWidth, y);
	  	ctx.scale(-1, 1);
		this.#drawBrick(ctx, brick, {Grad,effect:true});
	  	ctx.restore();

		// Highlight(bottom right)
		const LW = LineWidth;
	   	ctx.save();
	   	ctx.globalAlpha = 1-data.offset;
	   	ctx.translate(x, y);
		ctx.beginPath();
	 		ctx.lineWidth   = LW;
			ctx.strokeStyle ='#FFF';
			ctx.moveTo(ColWidth-LW, LW);
			ctx.lineTo(ColWidth-LW, RowHeight-LW);
			ctx.lineTo(LW, RowHeight-LW);
		ctx.stroke();
	  	ctx.restore();
	}
	drawDisappear(brick, scale) {
  		const {x, y}= brick;
	   	ctx.save();
		ctx.globalAlpha = scale;
	  	ctx.translate(
	  		ColWidth /2.0*(1-scale)+x,
	  		RowHeight/1.5*(1-scale)+y);
		ctx.scale(scale, scale);
		this.#drawBrick(ctx, brick, {effect:true});
	   	ctx.restore();
	}
	drawBrick(brick) {
		ctxB.save();
		ctxB.translate(brick.x, brick.y);
		this.#drawBrick(ctxB, brick);
		ctxB.restore();
	}
	destroy({x, y}) {
		ctxB.clearRect(x,y, ColWidth,RowHeight);
		ctxS.clearRect(x+ShadowOffset, y+ShadowOffset, ColWidth,RowHeight);
	}
	cache() {
		ctxS.clear();
		ctxB.clear();
		MapData.flat().forEach( this.drawBrick.bind(this) );
	}
});