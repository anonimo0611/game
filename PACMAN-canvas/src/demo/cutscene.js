import {Sound}   from '../../_snd/sound.js'
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js'
import {Fruit}   from '../fruit.js'
import {PacMan}  from '../actor.js'
import {Ghosts}  from '../ghosts/_system.js'
import {Ghost}   from '../ghosts/ghost.js'
import * as Snag from '../sprites/snag.js'

const ACTORS_Y = BH/2
const sceneNum = (lv=0)=>
	!Ctrl.isPractice && ({2:1, 5:2, 9:3}[lv]) || -1

export class Cutscene {
	static {State.on({Cutscene:this.#begin})}
	static #scene = /**@type {?Scene1|Scene2|Scene3}*/(null)
	static #begin(_={}, n=Cutscene.num) {
		const idx = clamp(n,1,3) - 1
		Cutscene.#scene = new [Scene1,Scene2,Scene3][idx]
	}
	static get num() {return sceneNum(Game.level)}
	static draw()    {Cutscene.#scene?.draw()}
	static update()  {Cutscene.#scene?.update()}

	pacvx  = -BW/180
	akavx  = -BW/180
	pacman = new PacMan
	akabei = new Ghost

	/** @protected @param {number} num */
	constructor(num) {
		this.pacman.y = this.akabei.y = ACTORS_Y - T/2
		Ghosts.initialize()
		Sound.playCutscene({loop:(num == 2) ? 0:1})
	}
	updatePac() {
		this.pacman.x += this.pacvx
		this.pacman.update()
	}
	updateAka(rate=1) {
		this.akabei.x += this.akavx * rate
		Ghosts.update()
	}
	drawPac(radius=this.pacman.sprite.r) {
		const {pacman:{center,orient}}= this
		this.pacman.sprite.draw({center,orient,radius})
	}
	drawAka(data={}) {
		const {akabei:{center,animIdx}}= this
		this.akabei.sprite.draw({animIdx,center, ...data})
	}
	draw() {
		State.wasFlashing && Fruit.drawLevelCounter()
	}
	end() {
		State.wasTitle
			? State.setTitle()
			: State.setNewLevel()
	}
}

class Scene1 extends Cutscene {
	constructor() {
		super(1)
		this.akavx    = -BW / 156.4
		this.pacman.x =  BW + T*1
		this.akabei.x =  BW + T*3
	}
	update() {
		if (Ticker.elapsedTime > 400)
			this.updateAka()
		this.pacman.dir == L
			? this.moveLeft()
			: this.moveRight()
	}
	moveLeft() {
		this.updatePac()
		this.pacman.x < -T*9 && this.turnBack()
	}
	turnBack() {
		this.pacvx *= -1.1
		this.akavx *= -0.6
		this.pacman.dir = this.akabei.dir = R
	}
	moveRight() {
		this.akabei.x > T*7.5  && this.updatePac()
		this.akabei.x > T*9+BW && this.end()
	}
	draw() {
		const isFrightened = (this.akavx > 0)
		const {pacman:{dir,sprite:{r}}}= this
		this.drawAka({isFrightened})
		this.drawPac((dir == L ? 1:4)*r)
		super.draw()
	}
}

class Scene2 extends Cutscene {
	counter  = 0
	isRipped = false
	snag     = new Snag.SnagSprite(Fg)
	akaEyes  = /**@type {VisualOrient}*/(L)
	constructor() {
		super(2)
		this.pacman.x = BW + T*3
		this.akabei.x = BW + T*16
	}
	update() {
		this.updatePac()
		if (!this.counter && this.updateAka())
			return
		switch(this.counter++) {
		case 90:
			this.akabei.x -= T/4
			this.akaEyes  = U
			this.isRipped = true
			break
		case 150:
			this.akaEyes = Dazed
			break
		case 270:
			this.end()
			break
		}
	}
	updateAka() {
		const {akabei:a}= this
		a.x > Snag.SNAG_X ? super.updateAka(1.0):
		a.x > Snag.STOP_X ? super.updateAka(0.1):(a.x=Snag.STOP_X)
		return (a.x != Snag.STOP_X)
	}
	draw() {
		const {akabei:a,snag,akaEyes,isRipped}= this
		const animIdx = isRipped? 0 : (this.counter? 1 : a.animIdx)
		this.drawPac()
		snag.drawSnaggedStake({isRipped,y:ACTORS_Y+T})
		this.drawAka({isRipped,animIdx,orient:akaEyes})
		if (!isRipped && a.x < Snag.SNAG_X) {
			const pos   = a.center.addX(T)
			const ratio = norm(Snag.SNAG_X, Snag.STOP_X, a.x)
			snag.drawSnaggedClothing(animIdx, ratio, pos)
		}
		super.draw()
	}
}

class Scene3 extends Cutscene {
	constructor() {
		super(3)
		this.pacman.x = BW + T*6
		this.akabei.x = BW + T*13
	}
	update() {
		this.updatePac()
		this.updateAka()
	}
	updateAka() {
		const {akabei:aka}= this
		super.updateAka()
		aka.dir == L
			? aka.x < -T*10 && (aka.dir = R) && (this.akavx *= -1)
			: aka.x > (T*13+BW) && this.end()
	}
	draw() {
		this.drawPac()
		this.akabei.dir == L
			? this.drawAka({isMended: true})
			: this.drawAka({isExposed:true})
		super.draw()
	}
}