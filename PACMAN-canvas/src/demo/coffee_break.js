import {Sound}   from '../../_snd/sound.js'
import {Ticker}  from '../../_lib/timer.js'
import {U,R,L}   from '../../_lib/direction.js'
import {Cvs,Ctx} from '../_canvas.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Pacman}  from '../pacman/_pacman.js'
import {Ghost}   from '../ghosts/_ghost.js'
import Sprite    from '../ghosts/ghs_sprite_cb.js'
import {CvsWidth,TileSize as T} from '../_constants.js'

const ModSymbol = Symbol()
const IntermissionMap = new Map([[2,1], [5,2], [9,3]])

export class CBreak {
	/** @type {?(Scene1|Scene2|Scene3)} */
	static #scene = null
	static begin(num=IntermissionMap.get(Game.level)) {
		if (State.isCBreak || !between(num,1,3)) return false
		Sound.play('cutscene', {loop:1^num == 2})
		CBreak.#scene = new [Scene1,Scene2,Scene3][num-1]
		return true
	}
	static update() {this.#scene?.update(this.#scene)}
	static draw()   {this.#scene?.draw(this.#scene)}

	pacman  = new Pacman
	akabei  = new Ghost
	pacVelX = -CvsWidth/180
	constructor(symbol) {
		if (symbol != ModSymbol)
			throw TypeError('The constructor is not visible')
		this.pacman.y =
		this.akabei.y = Cvs.height/2 - T/2
		$onNS('.CB','Quit', this.end)
		$onNS('.CB','blur focus', this.pause)
		State.switchToCBreak()
	}
	movePacman() {
		this.pacman.x += this.pacVelX
		this.pacman.sprite.update()
	}
	drawPacman(scale=1) {
		this.pacman.sprite.draw(Ctx, this.pacman, scale)
	}
	drawAkabei(cfg={}) {
		const
		aka = this.akabei, {pos,aIdx}= aka
		aka.sprite.draw({...aka, ...pos, aIdx, ...cfg})
	}
	pause() {
		Ticker.pause()
		Sound.pauseAll(Ticker.paused)
	}
	end() {
		$off('.CB')
		CBreak.#scene = null
		State.lastIs('Title')
			? State.switchToTitle()
			: State.switchToNewLevel()
	}
} $('button.CB').on('click', e=> CBreak.begin(+e.target.value))

class Scene1 extends CBreak {
	constructor() {
		super(ModSymbol)
		this.akaVelX  = -CvsWidth / 156.4
		this.pacman.x =  CvsWidth + T*1
		this.akabei.x =  CvsWidth + T*3
	}
	moveAkabei() {
		if (Ticker.elapsedTime > 400)
			this.akabei.x += this.akaVelX
	}
	update({pacman,akabei}=this) {
		this.moveAkabei()
		switch (pacman.orient) {
		case L:
			this.movePacman()
			if (pacman.x >= -T*9) break
			this.pacVelX *= -1.08
			this.akaVelX *= -0.60
			pacman.orient = akabei.orient = R
			break
		case R:
			akabei.x > T*7.5 && this.movePacman()
			akabei.x > CvsWidth + T*9 && this.end()
			break
		}
	}
	draw() {
		this.drawAkabei({frightened: this.akabei.orient == R})
		this.drawPacman(this.pacman.orient == R ? 4 : 1)
	}
}
class Scene2 extends CBreak {
	constructor() {
		super(ModSymbol)
		this.counter  = 0
		this.akaEyes  = L
		this.ripped   = false
		this.sprite   = Sprite.stakeClothes
		this.akaVelX  = this.pacVelX
		this.pacman.x = CvsWidth + T*3
		this.akabei.x = CvsWidth + T*16
	}
	moveAkabei({akabei:aka, akaVelX:vX}=this) {
		const {CaughtX,AkaMinX}= this.sprite
		aka.x + vX    > CaughtX && (aka.x += vX)
		aka.x + vX/10 > AkaMinX ?  (aka.x += vX/10):(aka.x = AkaMinX)
		return aka.x != AkaMinX
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
	draw({sprite:sp, akabei:aka, akaVelX,akaEyes,ripped}=this) {
		sp.drawStake()
		ripped && sp.drawOffcut()
		const aIdx = ripped? 0 : (this.counter? 1 : aka.aIdx)
		this.drawPacman()
		this.drawAkabei({aIdx,ripped,orient:akaEyes})
		if (aka.x + akaVelX < sp.CaughtX && !ripped) {
			const pos  = aka.centerPos.add(T,0)
			const rate = norm(sp.CaughtX, sp.AkaMinX, aka.x)
			sp.expandClothes(pos, aIdx, rate)
		}
	}
}
class Scene3 extends CBreak {
	constructor() {
		super(ModSymbol)
		this.pacVelX  = -CvsWidth / 200
		this.akaVelX  = -CvsWidth / 200
		this.pacman.x =  CvsWidth + T*3
		this.akabei.x =  CvsWidth + T*10
	}
	moveAkabei({akabei:aka}=this) {
		aka.x += this.akaVelX
		aka.x < -T*8 && (aka.orient = R) && (this.akaVelX *= -1)
		aka.x > (T*9 + CvsWidth) && aka.orient == R && this.end()
	}
	update() {
		this.movePacman()
		this.moveAkabei(this)
	}
	draw() {
		this.drawPacman()
		this.akabei.orient == L
			? this.drawAkabei({repaired:true})
			: this.drawAkabei({hadaketa:true})
	}
}