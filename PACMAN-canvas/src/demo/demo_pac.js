import {Actor} from '../actor.js'
import Sprite  from '../pacman/pac_sprite.js'
export class Pacman extends Actor {
    sprite = new Sprite(this)
    constructor() {super();freeze(this)}
}