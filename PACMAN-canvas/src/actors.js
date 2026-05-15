import {Actor}  from './actor.js'
import {PacMan} from './actor.js'
import {Ghosts} from './ghosts/_system.js'
import {Ghost}  from './ghosts/ghost.js'

export {Actor,PacMan,Ghost,Ghosts}
export {player,onPlayerDotEaten} from './player/player.js'
export const Actors = {
 	/** @param {PacMan} pacman */
   update(pacman) {
        pacman.update()
        Ghosts.update()
    },
	/** @param {PacMan} pacman */
    draw(pacman) {
        Ghosts.drawBehind()
        pacman.draw()
        Ghosts.drawFront()
    },
}