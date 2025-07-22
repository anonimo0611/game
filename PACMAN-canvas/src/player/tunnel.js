import {pacman as self} from './pacman.js';

/** Save which side of the tunnel the player entered from */
export class TunnelEntered {
	#side = /**@type {?('Left'|'Right')}*/(null)
	get side() {return this.#side}
	update() {
		self.inTunnel == null && (this.#side = null)
		self.inTunnel == R && self.dir == R && (this.#side ||= R)
		self.inTunnel == L && self.dir == L && (this.#side ||= L)
	}
}