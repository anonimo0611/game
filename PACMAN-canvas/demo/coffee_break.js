import {Sound}   from '../../_snd/sound.js'
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js'
import {Fruit}   from '../fruit.js'
import {Ghost}   from '../ghosts/ghost.js'
import {PacMan}  from '../actor.js'
import Sprite    from '../sprites/ghost_cb.js'

export class CoffBreak {
	static #scene = /**@type {?Scene1|Scene2|Scene3}*/(null)
	static {State.on({CoffBreak:this.#begin})}

	static #begin(_={}, n=CoffBreak.number) {
		if (!between(n,1,3))
			throw RangeError('The scene number must be 1-3.')
		CoffBreak.#scene = new [Scene1,Scene2,Scene3][n-1]
	}
	static update() {
		CoffBreak.#scene?.update()
	}
	static draw() {
		CoffBreak.#scene?.draw()
		return State.isCoffBreak
	}
	static get number() {
		const sceneNum = {2:1, 5:2, 9:3}[Game.level]
		return !Ctrl.isPractice && sceneNum || -1
	}
	pacvx  = -BW/180
	akavx  = -BW/180
	pacman = new PacMan
	akabei = new Ghost

	/** @protected @param {number} num */
	constructor(num) {
		this.pacman.y = this.akabei.y = (BH/2 - T/2)
		Sound.play('cutscene', {loop:1^+(num == 2)})
		$onNS('.CB',{Quit:this.end, blur_focus:this.pause})
	}
	movePac() {
		this.pacman.x += this.pacvx
		this.pacman.sprite.update()
	}
	/** @param {number} rate */
	moveAka(rate=1) {
		this.akabei.x += this.akavx * rate
	}
	drawPac(scale=1) {
		this.pacman.sprite.draw(this.pacman, {scale})
	}
	drawAka(cfg={}) {
		const {akabei:{pos,animIdx}}= this
		this.akabei.sprite.draw({animIdx, ...cfg, ...pos})
	}
	pause() {
		Sound.pause( Ticker.pause() )
	}
	draw() {
		State.wasFlashing && Fruit.drawLevelCounter()
	}
	end() {
		$off('.CB')
		CoffBreak.#scene = null
		State.wasTitle
			? State.toTitle()
			: State.toNewLevel()
	}
}

class Scene1 extends CoffBreak {
	constructor() {
		super(1)
		this.isFrightened = false
		this.akavx    = -BW / 156.4
		this.pacman.x =  BW + T*1
		this.akabei.x =  BW + T*3
	}
	turnBack() {
		this.isFrightened = true
		this.pacvx *= -1.1
		this.akavx *= -0.6
		this.pacman.dir = this.akabei.dir = R
	}
	moveLeft() {
		this.movePac()
		this.pacman.x < -T*9 && this.turnBack()
	}
	moveRight() {
		this.akabei.x > T*7.5  && this.movePac()
		this.akabei.x > T*9+BW && this.end()
	}
	update() {
		if (Ticker.elapsedTime > 400)
			this.moveAka()
		this.pacman.dir == L
			? this.moveLeft()
			: this.moveRight()
	}
	draw() {
		const {pacman,isFrightened}= this
		this.drawAka({isFrightened})
		this.drawPac(pacman.dir == R ? 4:1)
		super.draw()
	}
}

class Scene2 extends CoffBreak {
	constructor() {
		super(2)
		this.counter  = 0
		this.akaEyes  = L
		this.isRipped = false
		this.sprite   = Sprite.stakeClothes
		this.pacman.x = BW + T*3
		this.akabei.x = BW + T*16
	}
	moveAka() {
		const {akabei:a, sprite:spr}= this
		a.x > spr.CaughtX ? super.moveAka(1.0):
		a.x > spr.AkaMinX ? super.moveAka(0.1):(a.x=spr.AkaMinX)
		return (a.x != spr.AkaMinX)
	}
	update() {
		this.movePac()
		if (!this.counter && this.moveAka())
			return
		switch(this.counter++) {
		case 90:
			this.akabei.x -= T/4
			this.akaEyes  = U
			this.isRipped = true
			break
		case 150:
			this.akaEyes = 'Bracket'
			break
		case 270:
			this.end()
			break
		}
	}
	draw() {
		const {akabei:a, sprite:spr, akaEyes,isRipped}= this
		const animIdx = isRipped? 0 : (this.counter? 1 : a.animIdx)
		spr.drawStake()
		this.drawPac()
		this.drawAka({animIdx,isRipped,orient:akaEyes})
		isRipped?
			spr.drawCloth():
			function() { // Expand clothes
				if (isRipped || a.x >= spr.CaughtX) return
				const rate = norm(spr.CaughtX, spr.AkaMinX, a.x)
				spr.stretchClothing(animIdx, rate, a.center.addX(T))
			}()
		super.draw()
	}
}

class Scene3 extends CoffBreak {
	constructor() {
		super(3)
		this.pacman.x = BW + T*6
		this.akabei.x = BW + T*13
	}
	moveAka() {
		const {akabei:aka}= this
		super.moveAka()
		aka.dir == L
			? aka.x < -T*10 && (aka.dir = R) && (this.akavx *= -1)
			: aka.x > (T*13+BW) && this.end()
	}
	update() {
		this.movePac()
		this.moveAka()
	}
	draw() {
		this.drawPac()
		this.akabei.dir == L
			? this.drawAka({isMended: true})
			: this.drawAka({isExposed:true})
		super.draw()
	}
}