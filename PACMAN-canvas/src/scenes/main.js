import {Fruit}  from '../fruit.js'
import {Maze}   from '../maze.js'
import {Score}  from '../score.js'
import {Actors} from '../actors.js'

export const MainScene = {
	update() {
		Fruit.update()
		Maze.PowDots.update()
		Actors.update()
	},
	draw() {
		Score.draw()
		Maze.PowDots.draw()
		Fruit.drawTarget()
		Actors.draw()
	},
}