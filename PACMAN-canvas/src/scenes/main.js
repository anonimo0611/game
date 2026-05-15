import {Actors} from '../actors.js'
import {Fruit}  from '../fruit.js'
import {Maze}   from '../maze.js'
import {player} from '../player/player.js'
import {Score}  from '../score.js'

export const MainScene = {
	update() {
		Fruit.update()
		Maze.PowDots.update()
		Actors.update(player)
	},
	draw() {
		Score.draw()
		Maze.PowDots.draw()
		Fruit.drawTarget()
		Actors.draw(player)
	},
}
