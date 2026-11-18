export {PacMan,player,Ghosts}
export {Actor}            from '@/actor.js'
export {Ghost}            from '@/ghosts/ghost.js'
export {onPlayerDotEaten} from '@/pacman/pacman.js'
import {PacMan,player}    from '@/pacman/pacman.js'
import {Ghosts}           from '@/ghosts/_system.js'

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