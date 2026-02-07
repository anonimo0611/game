import {Player} from './player.js';

/** Save which side of the tunnel the player entered from */
export class TunEntry {
	#side = /**@type {?('Left'|'Right')}*/(null)
	get side() {return this.#side}
	update() {
		const {inTunSide,dir}= Player.core
		inTunSide == null && (this.#side = null)
		inTunSide == R && dir == R && (this.#side ||= R)
		inTunSide == L && dir == L && (this.#side ||= L)
	}
}