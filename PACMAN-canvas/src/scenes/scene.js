import {MainScene} from './main.js'
import {DemoScene} from './demo.js'
import {State}     from '../state.js'
import {PtsMgr}    from '../points.js'
import {Message}   from '../message.js'
import {Cutscene}  from '../demo/cutscene.js'

export const Scene = {
	get shouldPlayCutscene() {
		return Cutscene.num > 0
	},
	update() {
		PtsMgr.update()
		DemoScene.update()
		MainScene.update()
	},
	draw() {
		Fg.clear()
		State.isDemoMode
			? DemoScene.draw()
			: MainScene.draw()
		Message.draw()
	},
}