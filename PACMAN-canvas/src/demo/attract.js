﻿import {State}    from '../state.js'
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

/** @type {?Attract} */
let   _attract  = null
const ModSymbol = Symbol()
const CHARA=0, DEMO=1

export class Attract {
	static {
		$(RunTimer).on({Run:this.#begin})
		$('button.attractDemo').on({click:this.#begin})
	}
	static #begin() {
		_attract = new Attract(ModSymbol)
	}
	static update() {
		RunTimer .update()
		_attract?.update()
	}
	static draw() {
		_attract?.draw()
		return State.isAttract
	}

	/** @type {Ghost[][]} */
	ghsList = [[],[]]
	pacman  = new Pacman
	powDisp = 1
	pacVelX = -CvsW/180
	ghsVelX = -CvsW/169

	constructor(symbol) {
		if (symbol != ModSymbol) {
			throw TypeError('The constructor'
			+` ${this.constructor.name}() is not visible`)
		}
		$onNS('.Attract', {click_keydown_blur:this.end})
		this.initialize()
	}
	initialize() {
		const {Max}=GhsType
		for (let i=0; i<this.ghsList.length*Max; i++)
			this.setActor(i/Max|0, i%Max)
		State.switchToAttract({data:this.ghsList[DEMO]})
	}
	setActor(idx, gIdx) {
		const g = new Ghost({idx:gIdx,aniFlag:+!!idx})
		if (idx) {
			g.pos = Vec2(CvsW+(T*6)+(T*2*gIdx), T*19)
			!gIdx && (this.pacman.pos = Vec2(g.x-T*3.5, g.y))
		}
		g.dir = [R,L][idx]
		this.ghsList[idx].push(g)
	}
	drawGhost(idx, ghsIdx, pos) {
		const
		ghost = this.ghsList[idx][ghsIdx]
		ghost.pos = pos
		ghost.sprite.draw(ghost)
	}
	draw() {
		const et = Ticker.elapsedTime/100, ptsFontSize = T*.68
		Score.draw(),drawText(7, 5, null, 'CHARACTOR　/　NICKNAME')
		et > 10 && this.drawGhost(CHARA, 0, Vec2(5*T, 6*T))
		et > 15 && drawText( 8,  7, Color.Akabei, 'OIKAKE----')
		et > 20 && drawText(18,  7, Color.Akabei, '"AKABEI"')

		et > 30 && this.drawGhost(CHARA, 1, Vec2(5*T, 9*T))
		et > 35 && drawText( 8, 10, Color.Pinky, 'MACHIBUSE--')
		et > 40 && drawText(19, 10, Color.Pinky, '"PINKY"')

		et > 50 && this.drawGhost(CHARA, 2, Vec2(5*T, 12*T))
		et > 55 && drawText( 8, 13, Color.Aosuke, 'KIMAGURE--')
		et > 60 && drawText(18, 13, Color.Aosuke, '"AOSUKE"')

		et > 70 && this.drawGhost(CHARA, 3, Vec2(5*T, 15*T))
		et > 75 && drawText( 8, 16, Color.Guzuta, 'OTOBOKE---')
		et > 80 && drawText(18, 16, Color.Guzuta, '"GUZUTA"')
		if (et > 85) {
			drawDot(Ctx, Vec2(10, 24))
			this.powDisp && drawDot(Ctx, Vec2(10, 26), true)
			drawText(12.0, 25, null, '10')
			drawText(14.3, 25, null, 'PTS', {size:ptsFontSize})
			drawText(12.0, 27, null, '50')
			drawText(14.3, 27, null, 'PTS', {size:ptsFontSize})
		}
		if (et > 90) {
			if (this.pacman.dir == L && this.powDisp) {
				drawDot(Ctx, Vec2(4, 19), true)
			}
			if (Ctrl.extendPts > 0) {
				const {BonusText:color}= Color
				drawText( 2.0, 30, color, `BONUS　PACMAN　FOR　${Ctrl.extendPts}`)
				drawText(24.3, 30, color, 'PTS', {size:ptsFontSize})
			}
		}
		if (et > 105) {
			for (let i=0; i<GhsType.Max; i++)
				this.drawGhost(DEMO, i)
			this.pacman.sprite.draw(this.pacman)
			PtsMgr.drawGhostPts()
		}
		Fruit.drawLevelCounter()
	}
	update() {
		if (Ticker.elapsedTime <= 1e4+500) return
		this.powDisp ^= Ticker.count % 15 == 0
		!Timer.frozen && this.updatePacman()
		!Timer.frozen && this.updateGhosts()
	}
	updatePacman() {
		this.pacman.sprite.update()
		this.pacman.x += this.pacVelX
		if (this.pacman.dir == L && this.pacman.x <= T*4) {
			this.pacVelX *= -1.11
			this.ghsVelX /= -2.14
			this.pacman.dir = R
			GhsMgr.setFrightMode()
		}
	}
	updateGhosts() {
		this.ghsList[DEMO].forEach(g=> {
			g.x += this.ghsVelX
			const fn = ()=> this.caughtGhost(g)
			GhsMgr.crashWithPac(g, this.pacman, {radius:T/4,fn})
		})
	}
	caughtGhost(g) {
		g.state.switchToBitten()
		this.ghsList[DEMO].every(g=> g.state.isBitten)
			&& Attract.#begin()
	}
	end(e={}) {
		if (e.target.tagName == 'BUTTON') return
		_attract = null
		State.switchToTitle()
		$off('.Attract')
	}
}