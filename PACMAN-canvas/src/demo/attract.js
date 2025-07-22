import {State}    from '../state.js'
import {Ctrl}     from '../control.js'
import {Score}    from '../score.js'
import {PtsMgr}   from '../points.js'
import {Fruit}    from '../fruit.js'
import {drawDot}  from '../maze.js'
import {drawText} from '../message.js'
import {Pacman}   from '../pacman.js'
import {GhsMgr}   from '../ghosts/_system.js'
import {Ghost}    from '../ghosts/ghost.js'
import {RunTimer} from './_run_timer.js'

const CHAR = 0
const DEMO = 1
const SmallSize = T*0.68

let _attract = /**@type {?Attract}*/(null)

export class Attract {
	static {State.on({Attract:this.#instantiate})}
	static #instantiate() {
		_attract = new Attract
	}
	static update() {
		RunTimer .update()
		_attract?.update()
	}
	static draw() {
		_attract?.draw()
		return State.isAttract
	}
	pacVelX = -BW/180
	ghsVelX = -BW/169
	pacman  = new Pacman
	powDisp = 1
	ghsList = /**@type {Ghost[][]}*/([])

	/** @private */
	constructor() {
		this.setActors()
		GhsMgr.trigger('Init', this.ghsList[DEMO])
		$onNS('.Attract', {click_keydown_blur:this.quit})
	}
	setActors() {
		for (const where of [CHAR,DEMO])
			for (const i of range(GhsType.Max))
				this.setActor(where, i)
	}
	setActor(where=0, idx=0) {
		const g = new Ghost(where?L:R, {idx,animFlag:where?1:0})
		if (where) {
			g.setPos(BW+(T*6)+(T*2*idx), T*19)
			g.idx == 0 && this.pacman.setPos(g.x-T*3.5, g.y)
		}
		(this.ghsList[where] ||= []).push(g)
	}
	draw() {
		const et = Ticker.elapsedTime/100
		Score.draw(),drawText(7, 5, null, 'CHARACTOR　/　NICKNAME')
		et > 10 && this.drawGhost(CHAR, GhsType.Akabei, 6)
		et > 15 && drawText( 8,  7, Color.Akabei, 'OIKAKE----')
		et > 20 && drawText(18,  7, Color.Akabei, '"AKABEI"')

		et > 30 && this.drawGhost(CHAR, GhsType.Pinky,  9)
		et > 35 && drawText( 8, 10, Color.Pinky, 'MACHIBUSE--')
		et > 40 && drawText(19, 10, Color.Pinky, '"PINKY"')

		et > 50 && this.drawGhost(CHAR, GhsType.Aosuke, 12)
		et > 55 && drawText( 8, 13, Color.Aosuke, 'KIMAGURE--')
		et > 60 && drawText(18, 13, Color.Aosuke, '"AOSUKE"')

		et > 70 && this.drawGhost(CHAR, GhsType.Guzuta, 15)
		et > 75 && drawText( 8, 16, Color.Guzuta, 'OTOBOKE---')
		et > 80 && drawText(18, 16, Color.Guzuta, '"GUZUTA"')
		if (et > 85) {
			drawDot(Ctx, 10, 24)
			this.powDisp && drawDot(Ctx, 10, 26, true)
			drawText(12.0, 25, null, DotScore)
			drawText(12.0, 27, null, PowScore)
			drawText(14.3, 25, null, 'PTS', {size:SmallSize})
			drawText(14.3, 27, null, 'PTS', {size:SmallSize})
		}
		if (et > 90) {
			if (this.pacman.dir == L && this.powDisp) {
				drawDot(Ctx, 4, 19, true)
			}
			if (Ctrl.extendPts > 0) {
				const {BonusText:color}= Color
				drawText( 2.0, 30, color, `BONUS　PACMAN　FOR　${Ctrl.extendPts}`)
				drawText(24.3, 30, color, 'PTS', {size:SmallSize})
			}
		}
		if (et > 105) {
			for (const i of range(GhsType.Max))
				this.drawGhost(DEMO, i)
			this.pacman.sprite.draw(this.pacman)
			PtsMgr.drawGhostPts()
		}
		Fruit.drawLevelCounter()
	}
	drawGhost(where=0, gIdx=0, row=NaN) {
		const ghost = this.ghsList[where][gIdx]
		isFinite(row) && ghost.setPos(T*5, T*row)
		ghost.sprite.draw(ghost)
	}
	update() {
		if (Ticker.elapsedTime <= 1e4+500) return
		!Timer.frozen && this.updatePacman()
		!Timer.frozen && this.updateGhosts()
		this.powDisp ^= +(Ticker.count % PowDotInterval == 0)
	}
	updatePacman() {
		this.pacman.sprite.update()
		this.pacman.x += this.pacVelX
		if (this.pacman.dir == L
		 && this.pacman.x <= T*4
		) {
			this.pacVelX *= -1.11
			this.ghsVelX /= -2.14
			this.pacman.dir = R
			GhsMgr.setFrightMode()
		}
	}
	updateGhosts() {
		for (const g of this.ghsList[DEMO]) {
			g.x += this.ghsVelX
			g.crashWithPac({
				pos: this.pacman.pos, radius: T/4,
				release:()=> GhsMgr.caughtAll && State.to('Attract')
			})
		}
	}
	quit() {
		_attract = null
		State.to('Title')
		$off('.Attract')
	}
} $('.DemoBtn').on({click:()=> State.to('Attract')})