import {State}    from '../state.js'
import {Env}      from '../control.js'
import {Fruits}   from '../fruits.js'
import {Score}    from '../score.js'
import  GhostSpr  from '../sprites/ghost.js'
import {drawText} from '../message.js'
import {drawDot,PowBlinker} from '../maze.js'
import {Actors,PacMan,Ghosts,Ghost} from '../actors.js'

export class Attract {
	static {State.on({Attract:this.#begin})}
	static #instance = /**@type {?Attract}*/(null)
	static #begin() {Attract.#instance = new Attract}
	static draw()   {Attract.#instance?.draw()}
	static update() {Attract.#instance?.update()}

	ghsSpr = new GhostSpr(Fg,T*2)
	subAct = new EnergizerAct

	/** @private */
	constructor() {
		$win.onNS('Attract', {click_keydown_blur:this.quit})
		this.update = ()=> this.subAct.update()
	}
	GhostEntries = /**@type {const}*/([
		// time, col1, col2, row, txt1, txt2
		[10, 8, 18,  6, 'OIKAKE----', '"AKABEI"'],
		[30, 8, 19,  9, 'MACHIBUSE--','"PINKY"' ],
		[50, 8, 18, 12, 'KIMAGURE--', '"AOSUKE"'],
		[70, 8, 18, 15, 'OTOBOKE---', '"GUZUTA"']
	])
	draw() {
		Score.draw()
		drawText(7, 4, null, 'CHARACTOR　/　NICKNAME')
		const et = (Ticker.elapsedTime/100), Small ={size:T*.68}
		this.GhostEntries.forEach(([t,col1,col2,row,txt1,txt2],i)=> {
			et > t    && this.drawGhostOnTable(i,row)
			et > t+ 5 && drawText(col1, row, Color.GhostBodies[i], txt1)
			et > t+10 && drawText(col2, row, Color.GhostBodies[i], txt2)
		})
		if (et > 85) {
			/**@type {const}*/([
			 [23, DOT_PTS, false, true],
			 [25, POW_PTS, true,  this.subAct.pow.show]]
			).forEach(([row,pts,isPow,showDot])=> {
				drawDot(Fg,10, row, isPow, showDot)
				drawText(12.0, row, null,  pts)
				drawText(14.3, row, null, 'PTS', Small)
			})
		}
		if (et > 90) {
			const {extendScore}= Env
			if (this.subAct.outward) {
				drawDot(Fg, 4, 19, true, this.subAct.pow.show)
			}
			if (extendScore > 0) {
				const text = `BONUS　PACMAN　FOR　${extendScore}`
				drawText( 2.0, 29, Color.NoticeTxt, text)
				drawText(24.3, 29, Color.NoticeTxt,'PTS', Small)
			}
			this.subAct.draw()
		}
		Fruits.drawLevelCounter()
	}
	drawGhostOnTable(type=0, row=0) {
		const center = Vec2.new(T*5, T*row).add(T/2)
		this.ghsSpr.draw({type,orient:R,center})
	}
	quit() {
		$win.off('.Attract')
		Attract.#instance = null
		State.setQuit()
	}
}

class EnergizerAct {
	/** @readonly */
	pow = new PowBlinker
	#pacman = new PacMan
	#ghosts = /**@type {Ghost[]}*/([])
	#pacvx  = -BW/180
	#ghsvx  = -BW/169
	constructor() {
		for (let i=0; i<GhostType.Max; i++)
			this.#setActor(i)
		Ghosts.initialize(this.#ghosts)
	}
	get started() {return Ticker.elapsedTime > 1e4+500}
	get outward() {return this.#pacman.dir == L}

	#setActor(type=0) {
		const
		g = new Ghost(L, {type,tile:[COLS+6+(type*2),19]})
		g.type == 0 && this.#pacman.pos.set(g.x-(T*3.5), g.y)
		this.#ghosts.push(g)
	}
	update() {
		if (!this.started) return
		this.pow.update()
		this.#updateActors()
		if (this.#pacman.dir == L
		 && this.#pacman.x <= T*4)
			this.#turnBack()
	}
	#updateActors() {
		if (Timer.frozen) return
		Actors.update(this.#pacman)
		this.#pacman.x += this.#pacvx
		this.#ghosts.forEach(g=> {
			g.x += this.#ghsvx
			g.collidesWith(this.#pacman.pos, T/4, this.#end)
		})
	}
	#turnBack() {
		this.#pacvx *= -1
		this.#ghsvx /= -2
		this.#pacman.dir = R
		Ghosts.frighten()
	}
	draw() {this.started && Actors.draw(this.#pacman)}
	#end() {Ghosts.caughtAll && State.setAttract()}
}