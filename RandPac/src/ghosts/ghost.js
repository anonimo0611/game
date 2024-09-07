import {Sound}    from '../_snd/sound.js';
import {Random}   from '../_lib/rand.js';
import {Astar}    from '../_lib/astar.js';
import {Ticker}   from '../_lib/timer.js';
import {Timer}    from '../_lib/timer.js';
import {Vec2}     from '../_lib/vec2.js';
import {Dir}      from '../_lib/direction.js';
import {U,R,D,L}  from '../_lib/direction.js';
import {Ctx}      from '../_main.js';
import {Scene}    from '../scene.js';
import {Points}   from '../points.js';
import {Maze,Pen} from '../maze.js';
import {Actor}    from '../actor.js';
import {Pacman}   from '../pacman/pac.js';
import * as Sys   from './ghost_sys.js';
import {Sprite}   from './ghost_sprite.js';

const {Ghosts,SysMap,FrightMode,Step}= Sys;
const InvinciblePac = false;
const inFrontOfPac  = g=> !behindThePac(g);
const behindThePac  = g=> g.frightened;

export class Ghost extends Actor {
	static {
		$on({
			'Reset Respawn':Ghost.#reset,
			'Playing':      Ghost.#start,
			'DotEaten':     Ghost.#dotEaten,
			'Clear Losing': Ghost.#setFadeOut,
		});
	}
	static #aIdx = 0;
	static get aIdx()       {return this.#aIdx}
	static get aInterval()  {return 6}
	static get Elroy()      {return Sys.Elroy}
	static get Type()       {return Sys.GhostType}
	static get frightened() {return SysMap.has(FrightMode)}
	static get score()      {return SysMap.get(FrightMode)?.score     || 0}
	static get spriteIdx()  {return SysMap.get(FrightMode)?.spriteIdx || 0}
	static get hasEscape()  {return Ghosts.some(g=> g.escaping)}
	static #reset() {
		Ghost.#aIdx = 0;
		Ghosts.splice(0);
		SysMap.clear();
	}
	static #start(e) {
		Sound.siren();
		Timer.sequence(...Ghosts.slice(1).map(g=>
			[g.ReleaseTime, g.mode.switchToGoOut]));
	}
	static update() {
		if (!Scene.isPlaying) return;
		this.#aIdx ^= +(!Actor.frozen && !(Ticker.count % this.aInterval));
		Ghosts.forEach(this.#_crashWithPac);
		SysMap.forEach(s=> s.update());
		Ghosts.forEach(g=> g.#update());
	}
	static #dotEaten(_, isPow) {
		isPow && (new FrightMode);
	}
	static #setFadeOut() {
		Ghosts.forEach(g=> g.sprite.setFadeOut());
	}
	static #_crashWithPac(g) {
		const radius = g.frightened? A/5 : A/8;
 		collisionCircle(g, Pacman.instance, radius) && g.#crashWithPac();
	}
	static #_draw = (_,i,array)=> array.at(-1-i).#draw();
	static drawFront()  {Ghosts.filter(inFrontOfPac).forEach(this.#_draw)}
	static drawBehind() {Ghosts.filter(behindThePac).forEach(this.#_draw)}
	#orient;
	#moveDir;
	#idleRadian = 0;
	Radius      = A/2;
	#started    = false;
	#revSig     = false;
	#frightened = false;
	get angry()      {return false}
	get chaseStep()  {return Step.Base}
	get started()    {return this.#started}
	get dir()        {return this.#moveDir}
	get orient()     {return this.#orient}
	get frightened() {return this.#frightened}
	get escaping()   {return this.mode.some('Escape|Return')}
	get isInHouse()  {return Pen.isInHouse(this.tilePos)}
	constructor({col,row,idx,dir,offsetX=0,initAlign=null}={}) {
		super();
		this.idx       = idx;
		this.initDir   = dir;
		this.initPos   = col*T + offsetX;
		this.initAlign = initAlign;
		this.initVecY  = Vec2[this.initDir].y;
		this.pos       = Vec2(this.initPos, row*T);
		this.mode      = new Sys.GhostMode(this.isInHouse);
		this.sprite    = new Sprite();
		this.random    = new Random(Maze.Seed+idx);
		this.name      = this.constructor.name;
		this.#moveDir  = this.initDir;
		this.#orient   = this.initDir;
		this.#started  = this.mode.isWalk;
		[this.cvs, this.ctx]= canvas2D(null, A).vals;
		$(this).on('Reverse',_=> this.#revSig = true);
		$(this).on('FrightMode', this.#setFrightMode);
	}
	get isScatter() {
		return Sys.Wave.isScatter
			&& !this.frightened
			&& !this.mode.isEscape
			&& !this.angry;
	}
	get targetTile() {
		return this.mode.isEscape
			? Pen.Entrance
			: (this.isScatter? this.ScatterPos : this.ChasePos);
	}
	get #penEntranceArrived() {
		return this.tilePos.y == Pen.Entrance.y
			&& abs(Maze.Center-this.centerPos.x) <= this.step;
	}
	get step() {
		const {mode}= this;
		if (mode.isGoOut)    return Step.GoOut;
		if (mode.isEscape)   return Step.Escape;
		if (mode.isReturn)   return Step.ReturnHome;
		if (!this.isInBoard) return Step.InTunnel;
		if (this.frightened) return Step.Fright;
		return this.isScatter? Step.Base : this.chaseStep;
	}
	set #dirOfTravel(dir) {
		this.#orient = this.#moveDir = dir;
	}
	#isAllowDir = dir=> {
		return !this.hasAdjacentWall(dir)
			&& !this.collidedWithWall(dir)
			&& !Dir.isOpposite(dir, this.orient);
	}
	#update() {
		if (this.mode.isEscape && this.#penEntranceArrived)
			this.mode.switchToReturn();
		if (Scene.isPlaying && Maze.DotMap.size)
			this.#behavior();
	}
	#behavior() {
		const {mode}= this;
		if (mode.isIdle)   return void this.#idle();
		if (mode.isGoOut)  return void this.#goOut();
		if (mode.isReturn) return void this.#returnToHome();
		this.#walk(mode.isEscape);
	}
	#draw() {
		Ctx.save();
		this.fadeIn?.update(Ctx);
		this.sprite.fadeOut?.update(Ctx);
		if (this.mode.isBitten == false)
			this.sprite.draw(this);
		Ctx.restore();
	}
	#idle() {
		if (Actor.frozen) return;
		const step = PI/Pen.Rect.Height*Step.Base;
		const rate = sin(this.#idleRadian += step*this.initVecY);
		if (rate-step < -1) this.#dirOfTravel = D;
		if (rate+step > +1) this.#dirOfTravel = U;
		this.y = (Pen.Middle + rate*Pen.Rect.Height/3);
	}
	#goOut() {
		if (Actor.frozen) return;
		const step = Step.GoOut;
		if (this.centerPos.x < Maze.Center-step
		 || this.centerPos.x > Maze.Center+step) {
			this.#dirOfTravel = Dir.opposite(this.initAlign);
			this.setNextPos();
			return;
		}
		if (this.centerPos.x != Maze.Center) {
			this.x = Maze.Center - T/2;
			return;
		}
		if (this.y > Pen.Entrance.y*T+step) {
			this.#dirOfTravel = U;
			this.setNextPos();
			return;
		}
		this.#idleRadian  = 0;
		this.#dirOfTravel = L;
		this.#revSig  ||= (!this.#started && this.ScatterPos.x > Pen.Door.x);
		this.#started ||= true;
		this.mode.switchToWalk();
	}
	#returnToHome() {
		const {step,x,y,dir,initPos,initAlign}= this;
		if (!this.isInHouse) {
			this.x = Maze.Center - T/2;
			this.#dirOfTravel = D;
		}
		if (this.tilePos.y != Pen.TileRect.Top+3) {
			dir == D && (this.y = y+step);
			return;
		}
		if (!initAlign || abs(x-initPos) <= step) {
			this.#dirOfTravel = initAlign? Dir.opposite(initAlign) : U;
			this.x = initPos;
			this.sprite.setResurrect();
			this.mode.switchToGoOut();
		 	Sound.ghsArrivedAtHome();
		 	return;
		}
		(this.#dirOfTravel=initAlign) && this.setNextPos();
	}
	#walk(isEscape=false) {
		if (Actor.frozen && !isEscape) return;
		if (this.newTileReached)    this.#setNextDir();
		if (this.tileCenterReached) this.#moveDir = this.orient;
		this.snapToCenterline();
		this.setNextPos();
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false;
			this.#orient = Dir.opposite(this.orient);
			!this.isInBoard && (this.#moveDir = this.orient);
			return;
		}
		this.#orient = this.#getNextDir();
	}
	#getNextDir() {
		const dirs = [U,L,D,R].filter(this.#isAllowDir);
		return this.frightened
			?  this.random.choice(dirs)
			: (this.#getDirWithAstar(dirs)
				?? this.#getDirWithPythagorean(dirs));
	}
	#getDirWithAstar(dirs, target=this.targetTile) {
		const st  = Maze.Graph.nodes[this.tilePos.x]?.[this.tilePos.y];
		const ed  = Maze.Graph.nodes[target.x]?.[target.y];
		const pos = Astar.search(Maze.Graph.nodes, st, ed)[0]?.pos;
		return pos && dirs.find(dir=> this.getAdjacentTile(dir).eq(pos));
	}
	#getDirWithPythagorean(dirs, target=this.targetTile) {
		return dirs.map((dir, index)=>
			({dir,index,dist:this.getAdjacentTile(dir).distance(target)})
		).sort(compareDist)[0].dir;
	}
	#setFrightMode(_, bool) {
		!this.escaping && (this.#frightened = bool);
	}
	#crashWithPac() {
		if (this.mode.isWalk == false) return;
		if (this.frightened) {
			if (Actor.frozen) return;
			Actor.frozen = true;
			this.#revSig = this.#frightened = false;
			$(this).trigger(this.mode.switchToBitten().current);
			Points.set(this, _=> this.#setEscape());
			Sound.play('biteGhs');
		} else {
			if (InvinciblePac) return;
			Sound.stopLoops();
			Scene.switchToLosing();
		}
	}
	#setEscape() {
		Actor.frozen = false;
		Sound.ghsEscape();
		this.mode.switchToEscape();
	}
}