import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Fruit}  from '../fruit.js'
import {Pacman} from '../pacman.js'
import {Ghost}  from '../ghosts/ghost.js'
import Sprite   from '../sprites/ghost_cb.js'

export class CoffBrk {
	static #scene = /**@type {?(Scene1|Scene2|Scene3)}*/(null)
	static {
		State.on({CoffBrk:(_, num=this.number)=>
			this.#scene = new [Scene1,Scene2,Scene3][num-1]})
	}
	static get number() {
		return (!Ctrl.isPractice && {2:1, 5:2, 9:3}[Game.level]) || -1
	}
	static draw() {
		this.#scene?.draw()
		return State.isCoffBrk
	}
	static update() {
		this.#scene?.update()
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
		State.last('FlashMaze') && Fruit.drawLevelCounter()
	}
	end() {
		$off('.CB')
		CoffBrk.#scene = null
		State.to(State.last('Title') || 'NewLevel')
	}
}
qSAll('button.CBBtn').forEach((e,i)=> {
	$(e).on('click', ()=> State.to('CoffBrk', {data:i+1}))
})

class Scene1 extends CoffBrk {
	constructor() {
		super(1)
		this.isFright = false
		this.akaVelX  = -BW / 156.4
		this.pacman.x =  BW + T*1
		this.akabei.x =  BW + T*3
	}
	turnBack() {
		this.isFright = true
		this.pacVelX *= -1.08
		this.akaVelX *= -0.60
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
		const {pacman,isFright}= this
		this.drawAkabei({isFright})
		this.drawPacman(pacman.dir == R ? 4:1)
		super.draw()
	}
}

class Scene2 extends CoffBrk {
	constructor() {
		super(2)
		this.counter  = 0
		this.akaEyes  = L
		this.isRipped = false
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
				this.isRipped = true
			},
			150:()=> {this.akaEyes = 'LowerR'},
			270:()=> {this.end()},
		})
	}
	draw() {
		const {akabei:a, sprite:spr, akaEyes,isRipped}= this
		const animIdx = isRipped? 0 : (this.counter? 1 : a.animIdx)
		spr.drawStake()
		this.drawPacman()
		this.drawAkabei({animIdx,isRipped,orient:akaEyes})
		isRipped
			? spr.drawOffcut()
			: function() { // Expand clothes
				if (isRipped || a.x >= spr.CaughtX) return
				const rate = norm(spr.CaughtX, spr.AkaMinX, a.x)
				spr.clothes(animIdx, rate, a.center.add(T,0))
			}()
		super.draw()
	}
}

class Scene3 extends CoffBrk {
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
			? this.drawAkabei({isMended: true})
			: this.drawAkabei({isExposed:true})
		super.draw()
	}
}