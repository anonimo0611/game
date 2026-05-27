import {Actor}  from './actor.js'
import {Ghosts} from './ghosts/_system.js'
import {Ghost}  from './ghosts/ghost.js'
import {PacMan,player,onPlayerDotEaten} from './pacman/pacman.js'
export {Actor,PacMan,Ghost,player,onPlayerDotEaten,Ghosts}
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