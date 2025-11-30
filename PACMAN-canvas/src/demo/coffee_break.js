import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Fruit}  from '../fruit.js'
import {Pacman} from '../pacman.js'
import {Ghost}  from '../ghosts/ghost.js'
import Sprite   from '../sprites/ghost_cb.js'

export class CoffBreak {
	static {State.on({CoffBreak:(_,n=this.number)=> this.#begin(n)})}
	static #scene = /**@type {?Scene1|Scene2|Scene3}*/(null)
	static #begin(n=1) {this.#scene=new[Scene1,Scene2,Scene3][n-1]}
	static update() {this.#scene?.update()}
	static draw() {return this.#scene?.draw() ?? State.isCoffBreak}
	static get number() {
		return !Ctrl.isPractice && {2:1, 5:2, 9:3}[Game.level] || -1
	}
	pacman  = new Pacman
	akabei  = new Ghost
	pacVelX = -BW/180

	/** @protected @param {number} num */
	constructor(num) {
		this.pacman.y = this.akabei.y = (BH/2 - T/2)
		Sound.play('cutscene', {loop:1^+(num == 2)})
		$onNS('.CB',{Quit:this.end, blur_focus:this.pause})
	}
	movePacman() {
		this.pacman.x += this.pacVelX
		this.pacman.sprite.update()
	}
	drawPacman(scale=1) {
		this.pacman.sprite.draw(this.pacman, {scale})
	}
	drawAkabei(cfg={}) {
		const {akabei:{pos,animIdx}}= this
		this.akabei.sprite.draw({animIdx, ...cfg, ...pos})
	}
	pause() {
		Sound.pause(Ticker.pause())
	}
	draw() {
		State.wasFlashing && Fruit.drawLevelCounter()
		return true
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
		this.frightened = false
		this.akaVelX  = -BW / 156.4
		this.pacman.x =  BW + T*1
		this.akabei.x =  BW + T*3
	}
	turnBack() {
		this.frightened = true
		this.pacVelX *= -1.1
		this.akaVelX *= -0.6
		this.pacman.dir = this.akabei.dir = R
	}
	moveLeft() {
		this.movePacman()
		this.pacman.x < -T*9 && this.turnBack()
	}
	moveRight() {
		this.akabei.x > T*7.5  && this.movePacman()
		this.akabei.x > T*9+BW && this.end()
	}
	update() {
		if (Ticker.elapsedTime > 400)
			this.akabei.x += this.akaVelX
		this.pacman.dir == L
			? this.moveLeft()
			: this.moveRight()
	}
	draw() {
		const {pacman,frightened}= this
		this.drawAkabei({frightened})
		this.drawPacman(pacman.dir == R ? 4:1)
		return super.draw()
	}
}

class Scene2 extends CoffBreak {
	constructor() {
		super(2)
		this.counter  = 0
		this.akaEyes  = L
		this.ripped   = false
		this.sprite   = Sprite.stakeClothes
		this.akaVelX  = this.pacVelX
		this.pacman.x = BW + T*3
		this.akabei.x = BW + T*16
	}
	moveAkabei({akabei:a, akaVelX:v, sprite:spr}=this) {
		a.x > spr.CaughtX ? (a.x+=v):
		a.x > spr.AkaMinX ? (a.x+=v/10):(a.x=spr.AkaMinX)
		return (a.x != spr.AkaMinX)
	}
	update() {
		this.movePacman()
		if (!this.counter && this.moveAkabei(this))
			return
		match(this.counter++, {
			90:()=> {
				this.akabei.x -= T/4
				this.akaEyes  = U
				this.ripped   = true
			},
			150:()=> {this.akaEyes = 'Bracket'},
			270:()=> {this.end()},
		})
	}
	draw() {
		const {akabei:a, sprite:spr, akaEyes,ripped}= this
		const animIdx = ripped? 0 : (this.counter? 1 : a.animIdx)
		spr.drawStake()
		this.drawPacman()
		this.drawAkabei({animIdx,ripped,orient:akaEyes})
		ripped
			? spr.drawCloth()
			: function() { // Expand clothes
				if (ripped || a.x >= spr.CaughtX) return
				const rate = norm(spr.CaughtX, spr.AkaMinX, a.x)
				spr.stretchClothing(animIdx, rate, a.center.addX(T))
			}()
		return super.draw()
	}
}

class Scene3 extends CoffBreak {
	constructor() {
		super(3)
		this.pacVelX  = -BW / 200
		this.akaVelX  = -BW / 200
		this.pacman.x =  BW + T*3
		this.akabei.x =  BW + T*10
	}
	moveAkabei({akabei:aka}=this) {
		aka.x += this.akaVelX
		aka.dir == L
			? aka.x < -T*8 && (aka.dir = R) && (this.akaVelX *= -1)
			: aka.x > (T*9 + BW) && aka.dir == R && this.end()
	}
	update() {
		this.movePacman()
		this.moveAkabei(this)
	}
	draw() {
		this.drawPacman()
		this.akabei.dir == L
			? this.drawAkabei({mended: true})
			: this.drawAkabei({exposed:true})
		return super.draw()
	}
}