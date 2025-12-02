import {player} from './player.js';

/** Save which side of the tunnel the player entered from */
export class TunnelEntry {
	#side = /**@type {?('Left'|'Right')}*/(null)
	get side() {return this.#side}
	update() {
		player.inTunSide == null && (this.#side = null)
		player.inTunSide == R && player.dir == R && (this.#side ||= R)
		player.inTunSide == L && player.dir == L && (this.#side ||= L)
	}
}