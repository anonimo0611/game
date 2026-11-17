import {Fruits} from '@src/fruits.js'
import {Maze}   from '@src/maze.js'
import {Score}  from '@src/score.js'
import {Actors} from '@src/actors.js'

export const Scene = {
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