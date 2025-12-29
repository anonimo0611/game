import {Actor} from './actor.js'
import Sprite  from './sprites/pacman.js'

export class PacMan extends Actor {
	/** @readonly */
	sprite = new Sprite(Ctx)
	constructor() {super()}
	get radius()  {return PacRadius}
	get hidden()  {return Timer.frozen}
	draw() {this.sprite.draw(this)}
}