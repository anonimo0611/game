import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {Ctrl}   from '../control.js'
import {State}  from '../state.js'
import {Fruit}  from '../fruit.js'
import {Pacman} from '../pacman.js'
import {Ghost}  from '../ghosts/ghost.js'
import Sprite   from '../sprites/ghost_cb.js'

const ModSymbol = Symbol()
const IntermissionMap = new Map([[2,1], [5,2], [9,3]])

export class CoffBrk {
	/** @type {?(Scene1|Scene2|Scene3)} */
	static #scene = null
	static {$on({CoffBrk:(_,num)=> this.#begin(num)})}
	static #begin(num=IntermissionMap.get(Game.level)) {
		Sound.play('cutscene', {loop:1^num == 2})
		console.log(num)
		CoffBrk.#scene = new [Scene1,Scene2,Scene3][num-1]
	}
	static update() {
		this.#scene?.update()
	}
	static draw()   {
		this.#scene?.draw()
		return State.isCoffBrk
	}
	static get isIntermission() {
		return !Ctrl.isPractice
			&& IntermissionMap.has(Game.level)
	}
	pacman  = new Pacman
	akabei  = new Ghost
	pacVelX = -CvsW/180

	constructor(symbol) {
		if (symbol != ModSymbol) {
			throw TypeError('The constructor'
			+` ${this.constructor.name}() is not visible`)
		}
		$onNS('.CB',{
			Quit:      this.end,
			blur_focus:this.pause})
		this.pacman.y =
		this.akabei.y = CvsH/2 - T/2
	}
	movePacman() {
		this.pacman.x += this.pacVelX
		this.pacman.sprite.update()
	}
	drawPacman(scale=1) {
		this.pacman.sprite.draw(this.pacman, scale)
	}
	drawAkabei(cfg={}) {
		const {akabei:aka}=this,{aIdx,pos}=aka
		aka.sprite.draw({aIdx, ...cfg, ...pos, ...aka})
	}
	pause() {
		Sound.allPaused = Ticker.pause()
	}
	draw() {
		State.last('FlashMaze')
			&& Fruit.drawLevelCounter()
	}
	end() {
		$off('.CB')
		CoffBrk.#scene = null
		State.to(State.last('Title') || 'NewLevel')
	}
}
$('button.CB').on('click', function() {
	State.to('CoffBrk', {data:+this.value})
})

class Scene1 extends CoffBrk {
	constructor() {
		super(ModSymbol)
		this.frightened = false
		this.akaVelX  = -CvsW / 156.4
		this.pacman.x =  CvsW + T*1
		this.akabei.x =  CvsW + T*3
	}
	moveAkabei() {
		if (Ticker.elapsedTime > 400)
			this.akabei.x += this.akaVelX
	}
	update() {
		const {pacman,akabei}= this
		this.moveAkabei()
		switch (pacman.dir) {
		case L:
			this.movePacman()
			if (pacman.x >= -T*9) break
			this.pacVelX *= -1.08
			this.akaVelX *= -0.60
			this.frightened = true
			pacman.dir = akabei.dir = R
			break
		case R:
			akabei.x > T*7.5    && this.movePacman()
			akabei.x > CvsW+T*9 && this.end()
		}
	}
	draw() {
		const {pacman,frightened}= this
		this.drawAkabei({frightened})
		this.drawPacman(pacman.dir == R ? 4:1)
		super.draw()
	}
}
class Scene2 extends CoffBrk {
	constructor() {
		super(ModSymbol)
		this.counter  = 0
		this.akaEyes  = L
		this.ripped   = false
		this.sprite   = Sprite.stakeClothes
		this.akaVelX  = this.pacVelX
		this.pacman.x = CvsW + T*3
		this.akabei.x = CvsW + T*16
	}
	moveAkabei({akabei:aka, akaVelX:v}=this) {
		const {CaughtX,AkaMinX}= this.sprite
		aka.x+v    > CaughtX && (aka.x+=v)
		aka.x+v/10 > AkaMinX ?  (aka.x+=v/10):(aka.x=AkaMinX)
		return (aka.x != AkaMinX)
	}
	update() {
		this.movePacman()
		if (!this.counter && this.moveAkabei(this))
			return
		switch (this.counter++) {
		case 90:
			this.akabei.x -= T/4
			this.ripped  = true
			this.akaEyes = U
			break
		case 90 + 60*1:
			this.akaEyes = 'LowerR'
			break
		case 90 + 60*3:
			this.end()
		}
	}
	draw() {
		const {sprite:sp, akabei:aka, akaVelX,akaEyes,ripped}= this
		const aIdx = ripped? 0 : (this.counter? 1 : aka.aIdx)
		sp.drawStake()
		ripped && sp.drawOffcut()
		this.drawPacman()
		this.drawAkabei({aIdx,ripped,orient:akaEyes})
		if (aka.x + akaVelX < sp.CaughtX && !ripped) {
			const pos  = aka.centerPos.add(T,0)
			const rate = norm(sp.CaughtX, sp.AkaMinX, aka.x)
			sp.expandClothes(pos, aIdx, rate)
		}
		super.draw()
	}
}
class Scene3 extends CoffBrk {
	constructor() {
		super(ModSymbol)
		this.pacVelX  = -CvsW / 200
		this.akaVelX  = -CvsW / 200
		this.pacman.x =  CvsW + T*3
		this.akabei.x =  CvsW + T*10
	}
	moveAkabei({akabei:aka}=this) {
		aka.x += this.akaVelX
		aka.x < -T*8 && (aka.dir = R) && (this.akaVelX *= -1)
		aka.x > (T*9 + CvsW) && aka.dir == R && this.end()
	}
	update() {
		this.movePacman()
		this.moveAkabei(this)
	}
	draw() {
		this.drawPacman()
		this.akabei.dir == L
			? this.drawAkabei({repaired:true})
			: this.drawAkabei({hadaketa:true})
		super.draw()
	}
}