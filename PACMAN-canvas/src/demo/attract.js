import {Ticker,Timer} from '../../_lib/timer.js'
import {Vec2}         from '../../_lib/vec2.js'
import {L,R}          from '../../_lib/direction.js'
import {State}        from '../_state.js'
import {Ctrl}         from '../control.js'
import {drawDot}      from '../maze.js'
import {drawText}     from '../message.js'
import {Pacman}       from '../pacman/_pacman.js'
import {Ghost}        from '../ghosts/_ghost.js'
import {GhsMgr}       from '../ghosts/_system.js'
import {FrightMode}   from '../ghosts/_system.js'
import {AttractTimer} from './_run_timer.js'
import {Cvs,Ctx,Color,GhsType,TileSize as T} from '../_constants.js'

/** @type {?Attract} */
let   _attract  = null
const ModSymbol = Symbol()
const CHARA=0, DEMO=1

export class Attract {
	static {
		$(AttractTimer).on('Run', this.#reset)
		$('button.attractDemo').on('click', this.#reset)
	}
	static update() {_attract?.update()}
	static draw()   {_attract?.draw()}
	static #reset() {_attract = new Attract(ModSymbol)}
	static get Timer() {return AttractTimer}

	/** @type {Ghost[][]} */
	ghsList = [[],[]]
	pacman  = new Pacman
	powDisp = 1
	pacVelX = -Cvs.width/180
	ghsVelX = -Cvs.width/169

	constructor(symbol) {
		if (symbol != ModSymbol)
			throw TypeError('The constructor is not visible')
		$onNS('.Attract','click keydown blur', this.end)
		this.setActors(GhsType.Max)
		State.switchToAttract({data:this.ghsList[DEMO]})
	}
	setActors(len) {
		for (let i=0; i<this.ghsList.length*len; i++)
			this.setActor(i/len|0, i%len)
	}
	setActor(idx, gIdx) {
		const g = new Ghost({idx:gIdx,anime:!!idx})
		if (idx) {
			g.pos = Vec2(Cvs.width+(T*6)+(T*2*gIdx), T*19)
			!gIdx && (this.pacman.pos = Vec2(g.x-T*3.5, g.y))
		}
		g.orient = [R,L][idx]
		this.ghsList[idx].push(g)
	}
	drawGhost(idx, ghsIdx, pos) {
		const
		ghost = this.ghsList[idx][ghsIdx]
		ghost.pos = pos
		ghost.sprite.draw(ghost)
	}
	draw() {
		const et = Ticker.elapsedTime, ptsFontSize = T*.68
		drawText(7, 5, '#FFF', 'CHARACTOR　/　NICKNAME')
		et > 1000 && this.drawGhost(CHARA, 0, Vec2(5*T, 6*T))
		et > 1500 && drawText( 8,  7, Color.Akabei, 'OIKAKE----')
		et > 2000 && drawText(18,  7, Color.Akabei, '"AKABEI"')

		et > 3000 && this.drawGhost(CHARA, 1, Vec2(5*T, 9*T))
		et > 3500 && drawText( 8, 10, Color.Pinky, 'MACHIBUSE--')
		et > 4000 && drawText(19, 10, Color.Pinky, '"PINKY"')

		et > 5000 && this.drawGhost(CHARA, 2, Vec2(5*T, 12*T))
		et > 5500 && drawText( 8, 13, Color.Aosuke, 'KIMAGURE--')
		et > 6000 && drawText(18, 13, Color.Aosuke, '"AOSUKE"')

		et > 7000 && this.drawGhost(CHARA, 3, Vec2(5*T, 15*T))
		et > 7500 && drawText( 8, 16, Color.Guzuta, 'OTOBOKE---')
		et > 8000 && drawText(18, 16, Color.Guzuta, '"GUZUTA"')
		if (et > 8500) {
			drawDot(Ctx, Vec2(10, 24))
			this.powDisp && drawDot(Ctx, Vec2(10, 26), true)
			drawText(12.0, 25, '#FFF', '10')
			drawText(14.3, 25, '#FFF', 'PTS', {size:ptsFontSize})
			drawText(12.0, 27, '#FFF', '50')
			drawText(14.3, 27, '#FFF', 'PTS', {size:ptsFontSize})
		}
		if (et > 9000) {
			if (this.pacman.orient == L && this.powDisp) {
				drawDot(Ctx, Vec2(4, 19), true)
			}
			if (Ctrl.extendPts > 0) {
				drawText( 2.0, 30, '#F90', `BONUS　PACMAN　FOR　${Ctrl.extendPts}`)
				drawText(24.3, 30, '#F90', 'PTS', {size:ptsFontSize})
			}
		}
		if (et > 1e4+500) {
			for (let i=0; i<GhsType.Max; i++)
				this.drawGhost(DEMO, i)
			this.pacman.sprite.draw(Ctx, this.pacman)
		}
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
		if (this.pacman.orient == L && this.pacman.x <= T*4) {
			this.pacVelX *= -1.11
			this.ghsVelX /= -2.14
			this.pacman.orient = R
			new FrightMode()
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
		this.ghsList[DEMO].every(g=> g.state.isBitten) && Attract.#reset()
	}
	end(e={}) {
		if (e.target.tagName == 'BUTTON') return
		_attract = null
		State.switchToTitle()
		$off('.Attract')
	}
}