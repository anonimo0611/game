import {Sound}  from '../_snd/sound.js';
import {Ticker} from '../_lib/timer.js';
import {State}  from '../_lib/state.js';
import {Param}  from '../_param.js';
import {Actor}  from '../actor.js';
import {Scene}  from '../scene.js';
import {Maze}   from '../maze.js';
import {Ghost}  from './ghost.js';

export const Ghosts    = [];
export const SysMap    = new Map();
export const Step      = Param.GhsStep;
export const WaveType  = freeze({Scatter:0,Chase:1});
export const GhostType = freeze({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4});
export class GhostMode extends State {
	isIdle   = true;
	isGoOut  = false;
	isWalk   = false;
	isBitten = false;
	isEscape = false;
	isReturn = false;
	constructor(isInHouse) {
		super();
		this.init(isInHouse? 'Idle':'Walk');
	}
};
export const Wave = new class {
	static {$on('Title Playing Respawn', _=> Wave.#reset())}
	#mode = WaveType.Scatter;
	get isChase()   {return this.#mode == WaveType.Chase}
	get isScatter() {return this.#mode == WaveType.Scatter}
	#reset() {
		let [time, idx] = [-1, 0];
		function update() {
			if (Actor.frozen || Ghost.frightened) return;
			if (Ticker.Interval * ++time < Param.ghsModeTime(idx)) return;
			[time, Wave.#mode] = [0, ++idx % 2];
			Wave.setReversalSig();
		}
		this.#mode = WaveType.Scatter;
		SysMap.set(Wave, {update});
	}
	setReversalSig() {Ghosts.forEach(g=> $(g).trigger('Reverse'))}
};
export const Elroy = new class {
	static {$on('Title', _=> Elroy.#part = 0)}
	#part = 0;
	get part() {return this.#part}
	get step() {return Step.Base * Param.ElroySpdRates[this.part]}
	get angry() {
		return Scene.isPlaying && this.part > 1
			&& Ghosts[GhostType.Akabei]?.frightened === false
			&& Ghosts[GhostType.Guzuta]?.started === true;
	}
	dotEaten() {
		if (Maze.DotMap.size <= Maze.DotMax/Param.ElroyDotRates[this.part]) {
			++this.#part;
			Sound.siren();
		}
	}
};
export class FrightMode {
	#timeCnt    = 0;
	#spriteIdx  = 0;
	#captureCnt = 0;
	#flashedCnt = 0;
	get points()      {return 100 * (1 << this.#captureCnt)}
	get spriteIdx()   {return this.#flashedCnt > 0 ? this.#spriteIdx^1 : 0}
	get allCaptured() {return this.#captureCnt == GhostType.Max}
	constructor() {
		Wave.setReversalSig();
		Ghosts.forEach(g=> $(g).offon('Bitten', _=> ++this.#captureCnt));
		SysMap.set(FrightMode, this.#toggle(true));
	}
	update() {
		if (Actor.frozen) return;
		const et = Ticker.Interval * this.#timeCnt++;
		this.#spriteIdx ^= +(this.#flashedCnt % (Ghost.aInterval*2) == 0);
		if (et >= Param.FrightTime-2e3) this.#flashedCnt++;
		if (et >= Param.FrightTime || this.allCaptured) this.#toggle(false);
	}
	#toggle(bool) {
		SysMap.delete(FrightMode);
		bool? Sound.fright() : Sound.siren();
		Ghosts.forEach(g=> $(g).trigger('FrightMode', bool));
		return this;
	}
}