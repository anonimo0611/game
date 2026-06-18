export {Actor}  from './actor.js'
export {Ghost}  from './ghosts/ghost.js'
import {Ghosts} from './ghosts/_system.js'
import {PacMan} from './pacman/pacman.js'
import {player} from './pacman/pacman.js'
export {onPlayerDotEaten} from './pacman/pacman.js'

export {Ghosts,PacMan,player}
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