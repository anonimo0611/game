import {State}      from '../state.js'
import {drawText}   from '../message.js'
import {Ctrl}       from '../control.js'
import {Score}      from '../score.js'
import {Fruit}      from '../fruit.js'
import {drawDot}    from '../maze.js'
import {PowBlinker} from '../maze.js'
import {Actor}      from '../actor.js'
import {GhsMgr}     from '../ghosts/_system.js'
import {Ghost}      from '../ghosts/ghost.js'
import {PacMan}     from '../actor.js'
import {RunTimer}   from './_run_timer.js'
import Sprite       from '../sprites/ghost.js'

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
	pow    = new PowBlinker
	subAct = new EnergizerAct()
	ghsSpr = new Sprite(T*2, T*2)

	/** @private */
	constructor() {$onNS('.Attract', {click_keydown_blur:this.quit})}
	update() {
		if (this.subAct.started) {
			this.subAct.update()
			this.pow.update()
		}
	}
	GhsEntries = /**@type {const}*/([
		// time, col1, col2, row, txt1, txt2
		[10, 8, 18,  6, 'OIKAKE----', '"AKABEI"'],
		[30, 8, 19,  9, 'MACHIBUSE--','"PINKY"' ],
		[50, 8, 18, 12, 'KIMAGURE--', '"AOSUKE"'],
		[70, 8, 18, 15, 'OTOBOKE---', '"GUZUTA"']
	])
	draw() {
		Score.draw()
		drawText(7, 5, null, 'CHARACTOR　/　NICKNAME')
		const et = (Ticker.elapsedTime/100), Small ={size:T*.68}
		this.GhsEntries.forEach(([t,col1,col2,row,txt1,txt2],i)=> {
			et > t    && this.drawGhostOnTable(i,row)
			et > t+ 5 && drawText(col1, row+1, GhsColors[i], txt1)
			et > t+10 && drawText(col2, row+1, GhsColors[i], txt2)
		})
		if (et > 85) {
			[[25, DotPts, +true],
			 [27, PowPts, +this.pow.show],
			].forEach(([row,pts,showDot],i)=> {
				drawDot(Ctx, 10, row-1, i==1, !!showDot)
				drawText(12.0, row, null, pts)
				drawText(14.3, row, null,'PTS', Small)
			})
		}
		if (et > 90) {
			const {extendScore}= Ctrl
			if (this.subAct.outward) {
				drawDot(Ctx, 4, 19, true, this.pow.show)
			}
			if (extendScore > 0) {
				const text = `BONUS　PACMAN　FOR　${extendScore}`
				drawText( 2.0, 30, Colors.Orange, text)
				drawText(24.3, 30, Colors.Orange,'PTS', Small)
			}
		}
		this.subAct.draw()
		Fruit.drawLevelCounter()
	}
	drawGhostOnTable(type=0, row=0) {
		this.ghsSpr.draw({type,orient:R,x:(T*5),y:(T*row)})
	}
	quit() {
		Attract.#attract = null
		State.toTitle()
		$off('.Attract')
	}
}

class EnergizerAct {
	#pacvx  = -BW/180
	#ghsvx  = -BW/169
	#pacman = new PacMan
	#ghosts = /**@type {Ghost[]}*/([])
	get started() {return Ticker.elapsedTime > 1e4+500}
	get outward() {return this.#pacman.dir == L}
	constructor() {
		range(GhsType.Max).forEach(i=> this.#setActor(i))
		GhsMgr.trigger('Init', this.#ghosts)
	}
	#setActor(type=0) {
		const
		g = new Ghost(L, {type,tile:[Cols+6+(type*2),19]})
		g.type == 0 && this.#pacman.pos.set(g.x-(T*3.5), g.y)
		this.#ghosts.push(g)
	}
	update() {
		if (Timer.frozen) return
		this.#pacman.sprite.update()
		this.#pacman.x += this.#pacvx * Ticker.delta
		if (this.#pacman.dir == L
		 && this.#pacman.x <= T*4
		) {
			this.#pacvx *= -1
			this.#ghsvx /= -2
			this.#pacman.dir = R
			GhsMgr.setFrightMode()
		}
		this.#updateGhosts()
	}
	draw() {
		this.started && Actor.draw(this.#pacman)
	}
	#updateGhosts() {
		this.#ghosts.forEach(g=> {
			g.x += this.#ghsvx * Ticker.delta
			g.collidesWith(this.#pacman.pos, T/4, this.#end)
		})
	}
	#end() {
		GhsMgr.caughtAll && State.toAttract()
	}
}