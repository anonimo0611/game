import {Actor} from './actor.js'
import Sprite  from './sprites/pacman.js'
export class Pacman extends Actor {
	/** @readonly */
	sprite = new Sprite(Ctx)
	get radius()  {return PacRadius}
	get hidden()  {return Timer.frozen}
	constructor() {super()}
}