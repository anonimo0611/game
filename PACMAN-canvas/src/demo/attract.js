import {State}      from '../state.js'
import {drawText}   from '../message.js'
import {Ctrl}       from '../control.js'
import {drawDot}    from '../maze.js'
import {PowBlinker} from '../maze.js'
import {ScoreMgr}   from '../score.js'
import {FruitMgr}   from '../fruit.js'
import {GhostMgr}   from '../ghosts/_system.js'
import {Actors}     from '../actor.js'
import {PacMan}     from '../actor.js'
import {Ghost}      from '../ghosts/ghost.js'
import GhostSprite  from '../sprites/ghost.js'

export class Attract {
	static {State.on({Attract:this.#begin})}
	static #instance = /**@type {?Attract}*/(null)
	static #begin() {Attract.#instance = new Attract}
	static draw()   {Attract.#instance?.draw()}
	static update() {Attract.#instance?.update()}

	ghsSpr = new GhostSprite(Fg,T*2)
	subAct = new EnergizerAct

	/** @private */
	constructor() {
		$onNS('Attract',{click_keydown_blur:this.quit})
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
		ScoreMgr.draw()
		drawText(7, 4, null, 'CHARACTOR　/　NICKNAME')
		const et = (Ticker.elapsedTime/100), Small ={size:T*.68}
		this.GhostEntries.forEach(([t,col1,col2,row,txt1,txt2],i)=> {
			et > t    && this.drawGhostOnTable(i,row)
			et > t+ 5 && drawText(col1, row, Palette.Ghosts[i], txt1)
			et > t+10 && drawText(col2, row, Palette.Ghosts[i], txt2)
		})
		if (et > 85) {
			[[23, DotPts, +true],
			 [25, PowPts, +this.subAct.pow.show],
			].forEach(([row,pts,showDot],i)=> {
				drawDot(Fg, 10, row, i == 1, !!showDot)
				drawText(12.0, row, null, pts)
				drawText(14.3, row, null,'PTS', Small)
			})
		}
		if (et > 90) {
			const {extendScore}= Ctrl
			if (this.subAct.outward) {
				drawDot(Fg, 4, 19, true, this.subAct.pow.show)
			}
			if (extendScore > 0) {
				const text = `BONUS　PACMAN　FOR　${extendScore}`
				drawText( 2.0, 29, Color.Notice, text)
				drawText(24.3, 29, Color.Notice,'PTS', Small)
			}
			this.subAct.draw()
		}
		FruitMgr.drawLevelCounter()
	}
	drawGhostOnTable(type=0, row=0) {
		const center = Vec2.new(T*5, T*row).add(T/2)
		this.ghsSpr.draw({type,orient:R,center})
	}
	quit() {
		$off('.Attract')
		Attract.#instance = null
		State.setQuit()
	}
}

class EnergizerAct {
	pow = new PowBlinker
	#pacman = new PacMan
	#ghosts = /**@type {Ghost[]}*/([])
	#pacvx  = -BW/180
	#ghsvx  = -BW/169
	get started() {return Ticker.elapsedTime > 1e4+500}
	get outward() {return this.#pacman.dir == L}
	constructor() {
		for (let i=0; i<GhostType.Max; i++)
			this.#setActor(i)
		GhostMgr.initialize(this.#ghosts)
	}
	#setActor(type=0) {
		const
		g = new Ghost(L, {type,tile:[Cols+6+(type*2),19]})
		g.type == 0 && this.#pacman.pos.set(g.x-(T*3.5), g.y)
		this.#ghosts.push(g)
	}
	update() {
		if (!this.started) return
		this.pow.update()
		this.#move()
		if (this.#pacman.dir == L
		 && this.#pacman.x <= T*4)
			this.#turnBack()
	}
	#move() {
		if (Timer.frozen) return
		this.#pacman.sprite.update()
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
		GhostMgr.frighten()
	}
	draw() {this.started && Actors.draw(this.#pacman)}
	#end() {GhostMgr.caughtAll && State.setAttract()}
}