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
import {ItemMgr} from './item.js';
import * as Cvs  from './_canvas.js';

const {cvs,ctx,ctxBrick:ctxB,ctxShadow:ctxS}= Cvs;
const {Frame,Cols,Rows,ColWidth,RowHeight}= Field;

const LineWidth    = int(cvs.width/315);
const ShadowOffset = ColWidth  * 0.2;
const AnimDuration = 200 / Ticker.Interval;

export const BrickType = freeze({
	None:      -1,
	Immortality:0,
	Hard:       1,
	White:      2,
	Red:        3,
	Orange:     5,
	Yellow:     5,
	Green:      6,
	Cyan:       7,
	Blue:       8,
	Pink:       9,
});
const BrickHSLColors = deepFreeze([
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
const BrickPoints = [
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
];

const MapData   = Array(Rows);
const Luster    = new Map();
const Disappear = new Map();

export const BrickMgr = freeze(new class {
	MapData    = MapData;
	Type       = BrickType;
	Rows       = Rows;
	Cols       = Cols;
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
	isBreakable({col, row}={}) {
		return !!MapData?.[row]?.[col]?.isBreakable;
	}
	init() {
		ItemMgr.init();
		Luster.clear();
		Disappear.clear();
		const map = Stages[Game.stageIdx];
		for (const row of MapData.keys()) {
			MapData[row] = Array(Cols);
			for (const col of MapData[row].keys())
				MapData[row][col] = new Brick({row,col}, map[row]?.[col]);
		}
		this.#brokenAll = false;
		this.cache();
	}
	update() {
		if (this.brokenAll)
			return;
		if (!MapData.flat().every(b=> !b.isBreakable))
			return;

		this.#brokenAll = true;
		Luster.clear();
		Disappear.clear();
		if (Scene.isInGame)
			Scene.switchToClear();
		if (Scene.isInDemo) {
			Scene.switchToEndDemo();
			Scene.switchToReset(1000);
		}
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
	#drawShadow({x,y,col,color}) {
		const w = (col == Cols-1)
			? (ColWidth+ShadowOffset)-Frame : ColWidth;
		ctxS.save();
		ctxS.translate(x+ShadowOffset, y+ShadowOffset);
		ctxS.fillStyle = rgba(0,0,0, color.a*0.5);
		ctxS.clearRect(0,0, w,RowHeight);
		ctxS.fillRect(0,0, w,RowHeight);
		ctxS.restore();
	}
	#drawBrick(ctx, brick, {effect=false,grad=null}={}) {
		if (!effect && brick.isNone)
			return;
		if (!effect)
			this.#drawShadow(brick);

		const LW = LineWidth, FO = LW*1.5;
		const {h,s,l,a}= brick.color;
		if (!grad) {
			grad = ctx.createLinearGradient(0,0,ColWidth,RowHeight);
			grad.addColorStop(0.0, hsl(h,s,l-20,a));
			grad.addColorStop(0.5, hsl(h,s,l+2, a));
			grad.addColorStop(1.0, hsl(h,s,l-20,a));
		}
		// Brick surface
		ctx.fillStyle = grad;
		ctx.clearRect(FO, FO, ColWidth-FO*2, RowHeight-FO*2);
		ctx.fillRect (FO, FO, ColWidth-FO*2, RowHeight-FO*2);

		// Highlight(top left)
		ctx.beginPath();
			ctx.lineWidth   = LW;
			ctx.strokeStyle = hsl(h,s,80);
			ctx.moveTo(LW,RowHeight-LW);
			ctx.lineTo(LW,LW);
			ctx.lineTo(ColWidth-LW,LW);
		ctx.stroke();

		// Shadow(bottom right)
		ctx.beginPath();
			ctx.lineWidth   = LW;
			ctx.strokeStyle = hsl(h,s,40);
			ctx.moveTo(ColWidth-LW,LW);
			ctx.lineTo(ColWidth-LW,RowHeight-LW);
			ctx.lineTo(LW,RowHeight-LW);
		ctx.stroke();
	}
	#drawLuster(brick,data) {
  		const {x, y}   = brick;
		const {h,s,l,a}= brick.color;
		const {offset} = data;
		const
		grad = ctx.createLinearGradient(0,0,ColWidth,RowHeight);
		grad.addColorStop(0, hsl(h,s,l-20,a));
		grad.addColorStop(max(offset*0.5, 0), hsl(h,s,l-20,a));
		grad.addColorStop(offset, '#FFF');
		grad.addColorStop(min(offset*0.7, 1), hsl(h,s,l-20,a));
		grad.addColorStop(1, hsl(h,s,l-20,a));
		data.offset = min(data.offset+=1/AnimDuration, 1);

		// Brick surface
      	ctx.save();
       	ctx.translate(x, y);
		this.#drawBrick(ctx, brick, {grad,effect:true});
      	ctx.restore();

		// Highlight(bottom right)
		const LW = LineWidth;
       	ctx.save();
       	ctx.globalAlpha = 1-data.offset;
       	ctx.translate(x, y);
		ctx.beginPath();
	 		ctx.lineWidth   = LW;
			ctx.strokeStyle = '#FFF';
			ctx.moveTo(ColWidth-LW, LW);
			ctx.lineTo(ColWidth-LW, RowHeight-LW);
			ctx.lineTo(LW, RowHeight-LW);
		ctx.stroke();
      	ctx.restore();
	}
	#drawDisappear(brick,scale) {
  		const {x, y}= brick;
       	ctx.save();
		ctx.globalAlpha = scale;
      	ctx.translate(x+((ColWidth/2)*(1-scale)),y+((RowHeight/1.5)*(1-scale)));
		ctx.scale(scale,scale);
		this.#drawBrick(ctx, brick, {effect:true});
       	ctx.restore();
	}
	cache() {
		ctxS.clear();
		ctxB.clear();
		MapData.flat().forEach(brick=> {
			ctxB.save();
			ctxB.translate(brick.x, brick.y);
			this.#drawBrick(ctxB, brick);
			ctxB.restore();
		});
	}
});
const Brick = freeze(class {
	Width       = ColWidth;
	Height      = RowHeight;
	#type       = BrickType.None;
	#durability = 0;
	#pointRate  = 1;
	get type()          {return this.#type}
	get durability()    {return this.#durability}
	get exists()        {return !this.isNone}
	get isBreakable()   {return this.type > BrickType.Immortality}
	get isNone()        {return this.type == BrickType.None}
	get isHard()        {return this.type == BrickType.Hard}
	get isImmortality() {return this.type == BrickType.Immortality}
	get isNormal()      {return this.isBreakable && !this.isHard}

	constructor({row,col}, type=BrickType.None) {
		this.row   = row;
		this.col   = col;
		this.x     = (ColWidth *col) + Field.Left;
		this.y     = (RowHeight*row) + Field.Top;
		this.Pos   = vec2(this.x, this.y);
		this.#type = type;
		this.color = type >= 0 ? HSL(...BrickHSLColors[type]) : null;

		if (type == BrickType.Hard
		 || type == BrickType.Immortality)
			Luster.set(this, {offset:0});

		this.#durability = this.#getDurabilityMax();
		this.durabilityMax = this.#durability;
		freeze(this);
	}
	#getDurabilityMax() {
		if (this.isImmortality)
			return Infinity;

		if (this.isHard) {
			this.#pointRate = Game.stageNum;
			if (Game.stageNum == 10) return 3;
			if (Game.stageNum >=  8) return 2;
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
		if (Luster.has(this)) return;
		if (Luster.size <= 4) Sound.stop('se2').play('se2');
		if (this.isHard) {
			const {durabilityMax:dMax,durability:d}= this;
			this.color.s += 30 - 30/dMax * d;
			this.color.l -= 30 - 30/dMax * d;
			this.color.a = min((1/dMax * d)+0.5, 1);
			BrickMgr.cache();
		}
		Luster.set(this, {offset:0});
	}
	#destroy({x, y}) {
		Luster.delete(this);
		Disappear.set(this, {scale:1});
		ctxB.clearRect(x, y, ColWidth,RowHeight);
		ctxS.clearRect(x+ShadowOffset, y+ShadowOffset, ColWidth,RowHeight);
		Sound.stop('se1').play('se1');
		if (this.isNormal)
			ItemMgr.appear(this);
		if (Scene.isInGame)
			Score.add(BrickPoints[this.type*this.#pointRate]);
		this.#type = BrickType.None;
	}
	getAdjacent(x=0, y=0) {
		return MapData[this.row+y]?.[this.col+x] || {exists:false};
	}
	get AdjL() {return this.getAdjacent(-1, 0)}
	get AdjR() {return this.getAdjacent( 1, 0)}
	get AdjU() {return this.getAdjacent( 0,-1)}
	get AdjD() {return this.getAdjacent( 0, 1)}
});
export class Collider {
	constructor({x, y}, radius) {
		this.Pos    = vec2(x, y);
		this.Radius = radius;
	}
	tilePos({x=0, y=0}={}) {
		const col = int((this.Pos.x+x - Field.Left) / ColWidth);
		const row = int((this.Pos.y+y - Field.Top)  / RowHeight);
		return {row,col}
	}
	getBrick({row,col}=this.tilePos(), {y=0,x=0}={}) {
		return MapData[row+y]?.[col+x];
	}
	contains({x, y}={}) {
		return (
			between(x+this.Radius, this.Pos.x, this.Pos.x+this.Width) &&
			between(y+this.Radius, this.Pos.y, this.Pos.y+this.Height)
		);
	}
	get brickExistsOnBothSides() {
		const brick = this.getBrick();
		return brick?.AdjL?.exists && brick?.AdjRight?.exists;
	}
	get brickExistsOnOneSide() {
		const brick = this.getBrick();
		return brick?.AdjL?.exists || brick?.AdjRight?.exists;
	}
	#detect(ox=0, oy=0) {
		const offset = vec2(ox, oy).mul(this.Radius);
		const point  = vec2(this.Pos).add(offset);
        const brick  = this.getBrick( this.tilePos(offset) );
        if (point.x < Field.Left
         || point.x > Field.Right
         || point.y < Field.Top
        ) return Field;
		return brick?.exists ? brick : null;
	}
	get hitT()  {return this.#detect( 0,-1)}
	get hitR()  {return this.#detect( 1, 0)}
	get hitB()  {return this.#detect( 0, 1)}
	get hitL()  {return this.#detect(-1, 0)}
	get hitLT() {return this.#detect(-1,-1)}
	get hitRT() {return this.#detect( 1,-1)}
	get hitLB() {return this.#detect(-1, 1)}
	get hitRB() {return this.#detect( 1, 1)}
}