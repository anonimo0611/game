import {Sound}  from '../_snd/sound.js';
import {Timer}  from '../_lib/timer.js';
import {Vec2}   from '../_lib/vec2.js';
import {Dir}    from '../_lib/direction.js';
import {Ctx}    from '../_main.js';
import {BgCtx}  from '../_main.js';
import {Param}  from '../_param.js';
import {Scene}  from '../scene.js';
import {Score}  from '../score.js';
import {DotMap} from '../maze.js';
import {PowMap} from '../maze.js';
import {Actor}  from '../actor.js';
import {Ghost}  from '../ghosts/ghost.js';
import {Sprite} from './pac_sprite.js';

const {PacStep:Step}= Param;

export class Pacman extends Actor {
	static #symbol = Symbol();
	static #pacman = null;
	static instantiate()  {return new Pacman(this.#symbol)}
	static get instance() {return this.#pacman ||= this.instantiate()}
	static {
		$on({Losing:  _=> this.instance.#onLosing()});
		$on({keydown: e=> this.instance.#onKeydown(e)});
	}
	#orient   = Dir.Left;
	#moveDir  = Dir.Left;
	#step     = Step.Base;
	#corner   = null;
	#preDir   = null;
	#nextTurn = null;
	#stopped  = true;
	Radius    = A*.8 / 2;
	sprite    = new Sprite(this);
	get step()    {return this.#step}
	get stopped() {return this.#stopped}
	get turning() {return this.#corner != null}
	get dir()     {return this.#moveDir}
	get orient()  {return this.#orient}
	get preDir()  {return this.#preDir}
	constructor(symbol) {
		if (symbol != Pacman.#symbol)
			throw TypeError('The constructor is not visible');
		super();
		this.pos = Vec2(GRID>>1, (GRID>>1)+3).mul(T);
		Pacman.#pacman = freeze(this);
	}
	getForwardPos(num) {
		const offsetX = (this.dir == Dir.Up ? -num : 0);
		return Vec2[this.dir].mul(num).add(this.tilePos).add(offsetX, 0);
	}
	#onKeydown(e) {
		const dir = Dir.from(e, {awsd:true});
		const turnArounded = Dir.isOpposite(dir, this.dir);
		if (dir == null || e.originalEvent.repeat) return;
		if (dir == this.dir && !this.turning) return;

		if (Scene.some('Start|Respawn') && Vec2[dir].x) {
			return void ([this.#moveDir, this.#preDir] = [dir, null]);
		}
		if (this.turning) {
			return void (this.#nextTurn = dir);
		}
		if (this.hasAdjacentWall(dir) && !turnArounded) {
			return void (this.#preDir = dir);
		}
		if (this.#stopped || turnArounded) {
			return void ([this.#preDir, this.#moveDir] = [null, dir]);
		}
		this.#preDir = dir;
		if (this.inBackwardOfTile && this.isInBoard)
			this.#moveDir = Dir.opposite(this.dir);
	}
	update() {
		if (Actor.frozen) return;
		Scene.isPlaying && DotMap.size && this.#behaviour();
		this.sprite.update();
	}
	draw() {
		if (Actor.frozen) return;
		this.sprite.draw(Ctx, this.centerPos);
	}
	get stayStill() {
		return !Scene.isPlaying || !DotMap.size || !this.dir;
	}
	get #canTurn() {
		return this.inForwardOfTile
			&& this.#preDir
			&& !this.collidedWithWall(this.#preDir);
	}
	#getCurrentStep() {
		const eating = DotMap.has(this.tileIdx);
		return Ghost.frightened
			? (eating? Step.EnergEating : Step.Energized)
			: (eating? Step.Eating : Step.Base);
	}
	#behaviour() {
		if (this.newTileReached) {
			this.#step = this.#getCurrentStep();
			this.#eaten(this.tileIdx);
		}
		if (this.tileCenterReached) {
			this.snapToCenterline();
			this.#preDir
				&& !this.hasAdjacentWall(this.#preDir)
				&&([this.#moveDir, this.#preDir] = [this.#preDir, null]);
		}
		this.#orient = this.dir;

		if (!this.turning && this.collidedWithWall()) {
			this.pos = this.tilePos.mul(T);
			this.#stopped = true;
			this.#preDir  = null;
			return;
		}
		this.#stopped = false;
		this.#setCornering();
		this.setNextPos();
		this.#endCornering();
	}
	#setCornering() {
		if (!this.#canTurn) return;
		this.#orient = this.#preDir;
		this.#corner ||= this.tilePos;
		this.pos = Vec2[this.#orient].mul(this.step).add(this);
	}
	#endCornering() {
		if (this.#corner && !this.#corner.eq(this.tilePos)) {
			this.#preDir = this.#nextTurn;
			this.#corner = this.#nextTurn = null;
		}
		Dir.isOpposite(this.orient, this.dir)
			&& (this.#moveDir = this.orient);
	}
	#eaten(idx) {
		if (!DotMap.has(idx)) return;
		const dot = DotMap.get(idx);
		const pow = PowMap.get(idx);
		Score.add(pow ? 50 : 10);
		Sound.eat(idx % 2);
		DotMap.delete(idx);
		PowMap.delete(idx);
		fillCircle(BgCtx)(...dot.vals, T/2, null);
		$trigger('DotEaten', !!pow);
		DotMap.size == 0
			&& Sound.stopLoops()
			&& Scene.switchToClear();
	}
	#onLosing() {
		Timer.set(500, _=> {
			Sound.play('losing');
			this.sprite.setLosing();
		});
	}
}