import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Fruit}  from '../fruit.js'
import {Pacman} from '../pacman.js'
import {Ghost}  from '../ghosts/ghost.js'
import Sprite   from '../sprites/ghost_cb.js'

export class CoffBrk {
	static #scene = /**@type {?(Scene1|Scene2|Scene3)}*/(null)
	static {
		/** @type {(_:unknown,i:number)=> void} */
		const beginFn = (_,i)=> this.#begin(i)
		$on('CoffBrk', beginFn)
	}
	static #begin(sceneIdx=0) {
		Sound.play('cutscene', {loop:1^Number(sceneIdx == 2)})
		CoffBrk.#scene = new[Scene1,Scene2,Scene3][sceneIdx-1]
	}
	static update() {
		this.#scene?.update()
	}
	static draw()   {
		this.#scene?.draw()
		return State.isCoffBrk
	}
	static get intermissionLevel() {
		return {2:1, 5:2, 9:3}[Game.level] ?? -1
	}

	pacman  = new Pacman
	akabei  = new Ghost
	pacVelX = -CW/180

	/** @protected */
	constructor() {
		this.pacman.y = this.akabei.y = (CH/2 - T/2)
		$onNS('.CB',{Quit:this.end, blur_focus:this.pause})
	}
	movePacman() {
		this.pacman.x += this.pacVelX
		this.pacman.sprite.update()
	}
	drawPacman(scale=1) {
		this.pacman.sprite.draw(this.pacman, scale)
	}
	drawAkabei(cfg={}) {
		const {akabei:{pos}}= this
		this.akabei.sprite.draw({...cfg, ...pos})
	}
	pause() {
		Sound.paused(Ticker.pause())
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
qSAll('button.CBBtn').forEach((e,i)=> {
	$(e).on('click', ()=> State.to('CoffBrk', {data:i+1}))
})

class Scene1 extends CoffBrk {
	constructor() {
		super()
		this.isFright = false
		this.akaVelX  = -CW / 156.4
		this.pacman.x =  CW + T*1
		this.akabei.x =  CW + T*3
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
			this.isFright = true
			this.pacVelX *= -1.08
			this.akaVelX *= -0.60
			pacman.dir = akabei.dir = R
			break
		case R:
			akabei.x > T*7.5  && this.movePacman()
			akabei.x > CW+T*9 && this.end()
			break
		}
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
		super()
		this.counter  = 0
		this.akaEyes  = L
		this.isRipped = false
		this.sprite   = Sprite.stakeClothes
		this.akaVelX  = this.pacVelX
		this.pacman.x = CW + T*3
		this.akabei.x = CW + T*16
	}
	moveAkabei({akabei:aka, akaVelX:v, sprite:{CaughtX,AkaMinX}}=this) {
		aka.x > CaughtX && (aka.x+=v)
		aka.x > AkaMinX ?  (aka.x+=v/10):(aka.x=AkaMinX)
		return (aka.x != AkaMinX)
	}
	update() {
		this.movePacman()
		if (!this.counter && this.moveAkabei(this))
			return
		switch (this.counter++) {
		case 90:
			this.isRipped = true
			this.akaEyes  = U
			this.akabei.x -= T/4
			break
		case 90 + 60*1:
			this.akaEyes = 'LowerR'
			break
		case 90 + 60*3:
			this.end()
		}
	}
	draw() {
		const {sprite:spr, akabei,akaVelX,akaEyes,isRipped}= this
		const aIdx = isRipped? 0 : (this.counter? 1 : akabei.aIdx)
		spr.drawStake()
		isRipped && spr.drawOffcut()
		this.drawPacman()
		this.drawAkabei({aIdx,orient:akaEyes,isRipped})
		if (akabei.x + akaVelX < spr.CaughtX && !isRipped) {
			const pos  = akabei.centerPos.add(T,0)
			const rate = norm(spr.CaughtX, spr.AkaMinX, akabei.x)
			spr.expandClothes(aIdx, rate, pos)
		}
		super.draw()
	}
}

class Scene3 extends CoffBrk {
	constructor() {
		super()
		this.pacVelX  = -CW / 200
		this.akaVelX  = -CW / 200
		this.pacman.x =  CW + T*3
		this.akabei.x =  CW + T*10
	}
	moveAkabei({akabei:aka}=this) {
		aka.x += this.akaVelX
		aka.dir == L
			? aka.x < -T*8 && (aka.dir = R) && (this.akaVelX *= -1)
			: aka.x > (T*9 + CW) && aka.dir == R && this.end()
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