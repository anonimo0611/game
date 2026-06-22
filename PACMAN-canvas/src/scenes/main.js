import {Fruits}  from '../fruits.js'
import {Maze}   from '../maze.js'
import {Score}  from '../score.js'
import {Actors} from '../actors.js'

export const MainScene = {
	update() {
		Fruits.update()
		Maze.PowDots.update()
		Actors.update()
	},
	draw() {
		Score.draw()
		Maze.PowDots.draw()
		Fruits.drawTarget()
		Actors.draw()
	},
}