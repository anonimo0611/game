import * as Main  from './main.js'
import * as Demo  from './demo.js'
import {State}    from '../state.js'
import {PtsMgr}   from '../points.js'
import {Message}  from '../message.js'
import {Cutscene} from '../demo/cutscene.js'

const Scenes = [
	Main.Scene,
	Demo.Scene
]
export const Scene  = {
	get shouldPlayCutscene() {
		return Cutscene.num > 0
	},
	update() {
		Demo.updateTimer()
		PtsMgr.update()
		Scenes[+State.isDemoMode].update()
	},
	draw() {
		Fg.clear()
		Scenes[+State.isDemoMode].draw()
		Message.draw()
	},
}