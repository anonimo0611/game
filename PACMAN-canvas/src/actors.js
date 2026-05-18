import {Actor}  from './actor.js'
import {PacMan} from './actor.js'
import {Ghosts} from './ghosts/_system.js'
import {Ghost}  from './ghosts/ghost.js'
import {player,onPlayerDotEaten} from './player/player.js'

export {Actor,PacMan,Ghost,Ghosts}
export {player,onPlayerDotEaten}
export const Actors = {
    /** @param {PacMan} pacman */
    update(pacman=player) {
        pacman.update()
        Ghosts.update()
    },
	/** @param {PacMan} pacman */
    draw(pacman=player) {
        Ghosts.drawBehind()
        pacman.draw()
        Ghosts.drawFront()
    },
}