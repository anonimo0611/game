import {State}    from '../state.js'
import {drawText} from '../message.js'
import {Ctrl}     from '../control.js'
import {Score}    from '../score.js'
import {Fruit}    from '../fruit.js'
import {drawDot}  from '../maze.js'
import {Actor}    from '../actor.js'
import {GhsMgr}   from '../ghosts/_system.js'
import {Ghost}    from '../ghosts/ghost.js'
import {PacMan}   from '../actor.js'
import {RunTimer} from './_run_timer.js'

export class Attract {
	static #attract = /**@type {?Attract}*/(null)
	static {State.on({Attract:this.#begin})}

	static #begin() {
		Attract.#attract = new Attract
	}
	static update() {
		RunTimer.update()
		Attract.#attract?.update()
	}
	static draw() {
		Attract.#attract?.draw()
		return State.isAttract
	}

	powIdx = 1
	ghosts = /**@type {Ghost[]}*/([])
	pacman = new PacMan
	subAct = new EnergizerAct(this.pacman, this.ghosts)

	/** @private */
	constructor() {
		range(GhsType.Max).forEach(i=> this.setActor(i))
		GhsMgr.trigger('Init', this.ghosts)
		$onNS('.Attract', {click_keydown_blur:this.quit})
	}
	get subActStarted() {
		return Ticker.elapsedTime > 1e4+500
	}
	setActor(type=0) {
		const
		g = new Ghost(L, {type,tile:[Cols+6+(type*2),19]})
		g.type == 0 && this.pacman.pos.set(g.x-(T*3.5), g.y)
		this.ghosts.push(g)
	}
	update() {
		if (this.subActStarted) {
			this.subAct.update()
			this.powIdx ^= +!(Ticker.count % PowDotInterval)
		}
	}
	draw() {
		Score.draw()
		drawText(7, 5, null, 'CHARACTOR　/　NICKNAME')
		const Small = {size:T*.68},
		et = Ticker.elapsedTime/100
		et > 10 && this.drawGhostOnTable(GhsType.Akabei, 6)
		et > 15 && drawText( 8,  7, Colors.Akabei, 'OIKAKE----')
		et > 20 && drawText(18,  7, Colors.Akabei, '"AKABEI"')

		et > 30 && this.drawGhostOnTable(GhsType.Pinky,  9)
		et > 35 && drawText( 8, 10, Colors.Pinky, 'MACHIBUSE--')
		et > 40 && drawText(19, 10, Colors.Pinky, '"PINKY"')

		et > 50 && this.drawGhostOnTable(GhsType.Aosuke, 12)
		et > 55 && drawText( 8, 13, Colors.Aosuke, 'KIMAGURE--')
		et > 60 && drawText(18, 13, Colors.Aosuke, '"AOSUKE"')

		et > 70 && this.drawGhostOnTable(GhsType.Guzuta, 15)
		et > 75 && drawText( 8, 16, Colors.Guzuta, 'OTOBOKE---')
		et > 80 && drawText(18, 16, Colors.Guzuta, '"GUZUTA"')
		if (et > 85) {
			drawDot(Ctx, 10, 24)
			drawDot(Ctx, 10, 26, true, !!this.powIdx)
			drawText(12.0, 25, null, DotPts)
			drawText(12.0, 27, null, PowPts)
			drawText(14.3, 25, null,'PTS',Small)
			drawText(14.3, 27, null,'PTS',Small)
		}
		if (et > 90) {
			const {extendScore}= Ctrl
			if (this.pacman.dir == L) {
				drawDot(Ctx, 4, 19, true, !!this.powIdx)
			}
			if (extendScore > 0) {
				const text = `BONUS　PACMAN　FOR　${extendScore}`
				drawText( 2.0, 30, Colors.Orange, text)
				drawText(24.3, 30, Colors.Orange,'PTS',Small)
			}
		}
		if (this.subActStarted)
			Actor.draw(this.pacman)
		Fruit.drawLevelCounter()
	}
	drawGhostOnTable(type=0, row=0) {
		this.ghosts[0].sprite.draw({type,orient:R,x:(T*5),y:(T*row)})
	}
	quit() {
		Attract.#attract = null
		State.toTitle()
		$off('.Attract')
	}
}

class EnergizerAct {
	pacVelX = -BW/180
	ghsVelX = -BW/169
	constructor(
	 /**@type {PacMan} */pacman,
	 /**@type {Ghost[]}*/ghosts
	) {
		this.pacman = pacman
		this.ghosts = ghosts
	}
	update() {
		if (Timer.frozen) return
		this.pacman.sprite.update()
		this.pacman.x += this.pacVelX * Ticker.delta
		if (this.pacman.dir == L
		 && this.pacman.x <= T*4
		) {
			this.pacVelX *= -1
			this.ghsVelX /= -2
			this.pacman.dir = R
			GhsMgr.setFrightMode()
		}
		this.#updateGhosts()
	}
	#updateGhosts() {
		this.ghosts.forEach(g=> {
			g.x += this.ghsVelX * Ticker.delta
			g.collidesWith(this.pacman.pos, T/4, this.#end)
		})
	}
	#end() {
		GhsMgr.caughtAll && State.toAttract()
	}
}