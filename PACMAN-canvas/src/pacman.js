import {Actor} from './actor.js'
import Sprite  from './sprites/pacman.js'
export class Pacman extends Actor {
	#sprite = new Sprite(Ctx)
	get radius()  {return PacRadius}
	get sprite()  {return this.#sprite}
	constructor() {super()}
}