import {State}    from '@src/state.js'
import {PtsMgr}   from '@src/points.js'
import {Message}  from '@src/message.js'
import {Cutscene} from './cutscene.js'
import * as Main  from './main.js'
import * as Demo  from './demo.js'

const Scenes = [
	Main.Scene,
	Demo.Scene,
]
export const Scene = {
	get shouldPlayCutscene() {
		return Cutscene.getNum() > 0
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