import {Vec2}  from './_lib/vec2.js';
import {Scene} from './scene.js';
import {Maze}  from './maze.js';
export class Actor {
	static #frozen = false;
	static get frozen()  {return Actor.#frozen}
	static set frozen(b) {isBool(b) && (Actor.#frozen=b)}
	static {$on('Title', _=> this.frozen = false)}
	#x = 0;
	#y = 0;
	#lstCount  = 0;
	#lstTile   = null;
	#fadeInObj = Scene.isRespawn? new FadeIn(500) : null;
	set pos(pos)    {isObj(pos) && this.setPos(pos)}
	set x(num)      {isNum(num) && (this.#x = num)}
	set y(num)      {isNum(num) && (this.#y = num)}
	get x()         {return this.#x}
	get y()         {return this.#y}
	get fadeIn()    {return this.#fadeInObj}
	get isInBoard() {return !Maze.isInTunnel(this.tilePos)}
	get pos()       {return Vec2(this)}
	get centerPos() {return Vec2(this).add(T/2)}
	get nextPos()   {return Vec2[this.dir].mul(this.step).add(this)}
	get tilePos()   {return Vec2(this.centerPos).divInt(T)}
	get tileIdx()   {return Vec2.idx(this.tilePos, GRID)}
	get stepsPerTile() {
		if (!this.dir) return 0;
		const {x,y} = this.centerPos, v = Vec2[this.dir]
		const count = v.x? x % T : y % T
		return (v.x || v.y) > 0 ? count : T-count
	}
	get inForwardOfTile() {
		return this.stepsPerTile <= T/2;
	}
	get inBackwardOfTile() {
		return this.stepsPerTile > T/2;
	}
	get newTileReached() {
		return this.#lstCount && (this.stepsPerTile <= this.#lstCount);
	}
	get tileCenterReached() {
		return this.#lstTile
			? !this.nextPos.divInt(T).eq(this.#lstTile)
			: false;
	}
	setPos({x=this.x, y=this.y}={}) {
		if (x < -this.Radius - T/2) x = CVS_SIZE;
		if (x > CVS_SIZE) x = -this.Radius - T/2;
		[this.#x,this.#y] = [x,y];
	}
	setNextPos() {
		this.#lstTile  = Vec2(this).divInt(T);
		this.#lstCount = this.stepsPerTile;
		this.pos = this.nextPos;
	}
	snapToCenterline() {
		const v = Vec2[this.turning? this.orient : this.dir];
		if (v.x) this.#y = this.tilePos.y * T;
		if (v.y) this.#x = this.tilePos.x * T;
	}
	hasAdjacentWall(dir) {
		return Maze.hasWall( this.getAdjacentTile(dir) );
	}
	getAdjacentTile(dir, n=1, tile=this.tilePos) {
		const v = Vec2[dir].mul(n).add(tile);
		v.x = (v.x+GRID) % GRID;
		return v;
	}
	collidedWithWall(dir=this.dir) {
		const {step,centerPos:pos}= this;
		const {x,y}= Vec2[dir].mul(T/2+step).add(pos).divInt(T);
		return Maze.hasWall({x:clamp(x, 0, GRID-1), y});
	}
} freeze(Actor);