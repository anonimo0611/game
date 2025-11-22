import {State}    from '../state.js'
import {print}     from '../message.js'
import {Ctrl}     from '../control.js'
import {Score}    from '../score.js'
import {PtsMgr}   from '../points.js'
import {Fruit}    from '../fruit.js'
import {drawDot}  from '../maze.js'
import {Pacman}   from '../pacman.js'
import {GhsMgr}   from '../ghosts/_system.js'
import {Ghost}    from '../ghosts/ghost.js'
import {RunTimer} from './_run_timer.js'

let _attract = /**@type {?Attract}*/(null)

const {Orange}  = Color
const SmallSize = T*0.68

export class Attract {
	static {
		State.on({Attract:()=> _attract = new Attract})
		$('.DemoBtn').on({click:()=> State.to('Attract')})
	}
	static update() {
		 RunTimer.update()
		_attract?.update()
	}
	static draw() {
		_attract?.draw()
		return State.isAttract
	}
	pacman  = new Pacman
	ghosts  = /**@type {Ghost[]}*/([])
	powDisp = 1
	pacVelX = -BW/180
	ghsVelX = -BW/169

	/** @private */
	constructor() {
		range(GhsType.Max).forEach(i=> this.setActor(i))
		GhsMgr.trigger('Init', this.ghosts)
		$onNS('.Attract', {click_keydown_blur:this.quit})
	}
	setActor(type=0) {
		const
		g = new Ghost(L, {type,tile:[Cols+6+(type*2),19]})
		g.type == 0 && this.pacman.pos.set(g.x-(T*3.5), g.y)
		this.ghosts.push(g)
	}
	drawCharaGhost(type=0, row=0) {
		this.ghosts[0].sprite.draw({type, x:T*5, y:T*row, orient:R})
	}
	draw() {
		Score.draw()
		print(7, 5, null, 'CHARACTOR　/　NICKNAME')
		const
		et = Ticker.elapsedTime/100
		et > 10 && this.drawCharaGhost(GhsType.Akabei, 6)
		et > 15 && print( 8,  7, Color.Akabei, 'OIKAKE----')
		et > 20 && print(18,  7, Color.Akabei, '"AKABEI"')

		et > 30 && this.drawCharaGhost(GhsType.Pinky,  9)
		et > 35 && print( 8, 10, Color.Pinky, 'MACHIBUSE--')
		et > 40 && print(19, 10, Color.Pinky, '"PINKY"')

		et > 50 && this.drawCharaGhost(GhsType.Aosuke, 12)
		et > 55 && print( 8, 13, Color.Aosuke, 'KIMAGURE--')
		et > 60 && print(18, 13, Color.Aosuke, '"AOSUKE"')

		et > 70 && this.drawCharaGhost(GhsType.Guzuta, 15)
		et > 75 && print( 8, 16, Color.Guzuta, 'OTOBOKE---')
		et > 80 && print(18, 16, Color.Guzuta, '"GUZUTA"')
		if (et > 85) {
			drawDot(Ctx, 10, 24)
			drawDot(Ctx, 10, 26, true, !this.powDisp)
			print(12.0, 25, null, DotScore)
			print(12.0, 27, null, PowScore)
			print(14.3, 25, null,'PTS', {size:SmallSize})
			print(14.3, 27, null,'PTS', {size:SmallSize})
		}
		if (et > 90) {
			if (this.pacman.dir == L) {
				drawDot(Ctx, 4, 19, true, !this.powDisp)
			}
			if (Ctrl.extendPts > 0) {
				print( 2.0, 30, Orange, `BONUS　PACMAN　FOR　${Ctrl.extendPts}`)
				print(24.3, 30, Orange, 'PTS', {size:SmallSize})
			}
		}
		if (et > 105) {
			this.ghosts.forEach(g=> g.sprite.draw(g))
			this.pacman.sprite.draw(this.pacman)
			PtsMgr.drawGhostPts()
		}
		Fruit.drawLevelCounter()
	}
	update() {
		if (Ticker.elapsedTime <= 1e4+500) return
		this.powDisp ^= +!(Ticker.count % PowDotInterval)
		!Timer.frozen && this.updateActors()
	}
	updateActors() {
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
		this.updateGhosts()
	}
	updateGhosts() {
		for (const g of this.ghosts) {
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
}