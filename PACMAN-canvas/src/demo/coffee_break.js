import {Sound}    from '../../_snd/sound.js'
import {Game}     from '../_main.js'
import {State}    from '../state.js'
import {Ctrl}     from '../control.js'
import {FruitMgr} from '../fruit.js'
import {Ghost}    from '../ghosts/ghost.js'
import {PacMan}   from '../actor.js'
import {snagSpr}  from '../sprites/ghost_cb.js'

const sceneNum = (lv=0)=>
	!Ctrl.isPractice && ({2:1, 5:2, 9:3}[lv]) || -1

export class CoffBreak {
	static {State.on({CoffBreak:this.#begin})}
	static #scene = /**@type {?Scene1|Scene2|Scene3}*/(null)
	static #begin(_={}, n=CoffBreak.num) {
		if (!between(n,1,3))
			throw new RangeError(`Invalid scene number: ${n}.`
				+` Must be between 1 and 3.`)
		CoffBreak.#scene = new [Scene1,Scene2,Scene3][n-1]
	}
	static get num() {return sceneNum(Game.level)}
	static draw()    {CoffBreak.#scene?.draw()}
	static update()  {CoffBreak.#scene?.update()}

	pacvx  = -BW/180
	akavx  = -BW/180
	pacman = new PacMan
	akabei = new Ghost

	/** @protected @param {number} num */
	constructor(num) {
		this.pacman.y = this.akabei.y = 16.5*T
		Sound.playCoffBreak({loop:(num == 2) ? 0:1})
	}
	movePac() {
		this.pacman.x += this.pacvx
		this.pacman.sprite.update()
	}
	/** @param {number} rate */
	moveAka(rate=1) {
		this.akabei.x += this.akavx * rate
	}
	drawPac(radius=this.pacman.radius) {
		const {pacman:{center,orient}}= this
		this.pacman.sprite.draw({center,orient,radius})
	}
	drawAka(data={}) {
		const {akabei:{pos,animIdx}}= this
		this.akabei.sprite.draw({animIdx, ...data, ...pos})
	}
	draw() {
		State.wasFlashing && FruitMgr.drawLevelCounter()
	}
	end() {
		State.wasTitle
			? State.setTitle()
			: State.setNewLevel()
	}
}

class Scene1 extends CoffBreak {
	isFrightened = false
	constructor() {
		super(1)
		this.akavx    = -BW / 156.4
		this.pacman.x =  BW + T*1
		this.akabei.x =  BW + T*3
	}
	update() {
		if (Ticker.elapsedTime > 400)
			this.moveAka()
		this.pacman.dir == L
			? this.moveLeft()
			: this.moveRight()
	}
	moveLeft() {
		this.movePac()
		this.pacman.x < -T*9 && this.turnBack()
	}
	turnBack() {
		this.isFrightened = true
		this.pacvx *= -1.1
		this.akavx *= -0.6
		this.pacman.dir = this.akabei.dir = R
	}
	moveRight() {
		this.akabei.x > T*7.5  && this.movePac()
		this.akabei.x > T*9+BW && this.end()
	}
	draw() {
		const {isFrightened}= this
		const {pacman:{dir,radius:r}}= this
		this.drawAka({isFrightened})
		this.drawPac((dir == L ? 1:4)*r)
		super.draw()
	}
}

class Scene2 extends CoffBreak {
	counter  = 0
	akaEyes  = L
	snag     = snagSpr(Fg)
	isRipped = false
	constructor() {
		super(2)
		this.pacman.x = BW + T*3
		this.akabei.x = BW + T*16
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
	moveAka() {
		const {akabei:a,snag}= this
		a.x > snag.CaughtX ? super.moveAka(1.0):
		a.x > snag.AkaMinX ? super.moveAka(0.1):(a.x=snag.AkaMinX)
		return (a.x != snag.AkaMinX)
	}
	draw() {
		const {akabei:a,snag,akaEyes,isRipped}= this
		const animIdx = isRipped? 0 : (this.counter? 1 : a.animIdx)
		snag.drawStake()
		this.drawPac()
		this.drawAka({isRipped,animIdx,orient:akaEyes})
		isRipped
			? snag.drawShard()
			: function() { // Snagged clothing
				if (isRipped || a.x >= snag.CaughtX) return
				const pos   = a.center.addX(T)
				const ratio = norm(snag.CaughtX, snag.AkaMinX, a.x)
				snag.drawSnaggedClothing(animIdx, ratio, pos)
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
	update() {
		this.movePac()
		this.moveAka()
	}
	moveAka() {
		const {akabei:aka}= this
		super.moveAka()
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