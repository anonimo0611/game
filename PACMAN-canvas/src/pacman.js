import {Actor} from './actor.js'
import Sprite  from './sprites/pacman.js'
export class Pacman extends Actor {
	/** @readonly */
	sprite = new Sprite(Ctx)
	constructor() {super()}
	get radius()  {return PacRadius}
	get hidden()  {return Timer.frozen}
}