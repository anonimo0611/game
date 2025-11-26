import {pacman} from './pacman.js';

/** Save which side of the tunnel the player entered from */
export class TunnelEntry {
	#side = /**@type {?('Left'|'Right')}*/(null)
	get side() {return this.#side}
	update() {
		pacman.inTunSide == null && (this.#side = null)
		pacman.inTunSide == R && pacman.dir == R && (this.#side ||= R)
		pacman.inTunSide == L && pacman.dir == L && (this.#side ||= L)
	}
}