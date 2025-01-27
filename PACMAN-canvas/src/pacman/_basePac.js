import {Dir}       from '../../_lib/direction.js'
import {Actor}     from '../actor.js'
import {PacRadius} from '../_constants.js'
import Sprite      from './pac_sprite.js'
export class BasePac extends Actor {
    get stopped()     {return false}
    get mouthClosed() {return false}
    get showCenter()  {return false}
    constructor({orient=Dir.Left,radius=PacRadius}={}, openType=0) {
        super(radius)
        this.orient = orient
        this.sprite = new Sprite(this, openType)
        freeze(this)
    }
}