import {MainScene} from './main.js'
import {DemoScene} from './demo.js'
import {State}     from '../state.js'
import {PtsMgr}    from '../points.js'
import {Message}   from '../message.js'
import {Cutscene}  from '../demo/cutscene.js'
export {Scene}

const Scenes = [MainScene,DemoScene]
const Scene  = new class SceneManager {
	get shouldPlayCutscene() {
		return Cutscene.num > 0
	}
	update() {
		PtsMgr.update()
		DemoScene.updateTimer()
		Scenes[+State.isDemoMode].update()
	}
	draw() {
		Fg.clear()
		Scenes[+State.isDemoMode].draw()
		Message.draw()
	}
}