import {Actor}     from '../actor.js'
import Sprite      from '../pacman/pac_sprite.js'
import {PacRadius} from '../_constants.js'
export class Pacman extends Actor {
    sprite = new Sprite(this)
    Radius = PacRadius
    constructor() {super();freeze(this)}
}