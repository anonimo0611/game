import {pacman} from './pacman.js';

/** Save which side of the tunnel the player entered from */
export class TunnelEntryMgr {
	#side = /**@type {?('Left'|'Right')}*/(null)
	get side() {return this.#side}
	update() {
		pacman.inTunnel == null && (this.#side = null)
		pacman.inTunnel == R && pacman.dir == R && (this.#side ||= R)
		pacman.inTunnel == L && pacman.dir == L && (this.#side ||= L)
	}
}