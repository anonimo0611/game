import '../_lib/mouse.js'
import PacSprite     from '../src/sprites/pacman.js'
import * as FruitSpr from '../src/sprites/fruits.js'
import pointsSprite  from '../src/sprites/points.js'
import {GridSize,T,S,Gap,ghost} from './_constants.js'

export const View = function() {
	/** @param {number} colIdx */
	const ofst = colIdx=> (S*colIdx)+(Gap*colIdx)
	function draw() {
		Ctx.save()
		Ctx.translate(Gap, Gap/2)
		Ctx.clear()
		drawGridLines()
		drawFruits()
		drawGhosts()
		drawPoints()
		drawPacman()
		drawAkabei()
		Ctx.restore()
	}
	function drawGridLines() {
		Ctx.save()
		Ctx.translate(-Gap/2, 0)
		Ctx.setLineDash([2,2])
		Ctx.lineWidth = 2
		Ctx.strokeStyle = '#555'
		const {x:Cols,y:Rows}= GridSize
		const line = (x1=0,y1=0,x2=0,y2=0)=> Ctx.strokeLine(x1,y1,x2,y2)
		for (let y=0; y<Cols;   y++) line(ofst(y), 0, ofst(y), Rows*S)
		for (let x=0; x<Rows+1; x++) line(0, x*S, Cols*S+Gap, x*S)
		Ctx.restore()
	}
	function drawFruits() {
		for (let i=0; i<8; i++)
			FruitSpr.draw(Ctx, i, ofst(i)+S/2, S/2, S/16)
	}
	function drawGhosts() {
		for (let row=1; row<=5; row++)
			for (let col=0; col<8; col++) {
				Ctx.save()
				Ctx.translate(T/2, T/2)
				drawGhost(col, row)
				Ctx.restore()
			}
	}
	/**
	 * @param {number} col
	 * @param {number} row
	 */
	function drawGhost(col, row) {
		const [x,y]= [ofst(col), row*S]
		const dirs = [U,U,L,L,D,D,R,R]
		if (row < 5) {
			ghost.sprite.draw({
				...ghost,x,y,
				idx:   row-1,
				aIdx:  +(col % 2 != 0),
				orient:dirs[col],
			})
			return
		}
		const orient = [R,R,R,R,U,L,D,R][col]
		ghost.sprite.draw({
			...ghost,x,y,orient,
			aIdx:     +(col % 2 != 0),
			isFright:  (col <= 3),
			isEscaping:(col >= 4),
			spriteIdx:+(col >= 2),
		})
	}
	function drawPoints() {
		/**
		 * @param {number} pts
		 * @param {number} x
		 * @param {number} y
		 */
		const draw = (pts, x, y)=> {
			Ctx.save()
			Ctx.translate(x, y)
			pointsSprite.draw(0, 0, pts, S)
			Ctx.restore()
		}
		;[200,400,800,1600,100,300,500,700].forEach(
			(pts,i)=> draw(pts, ofst(i)+T, S*6+T))

		;[1000,2000,3000,5000].forEach(
			(pts,i)=> draw(pts, (S+Gap/2)+S*(2+Gap/T)*i, S*7+S/2))
	}
	function drawPacman() {
		const dirs = [U,U,L,L,D,D,R,R]
		for (let i=-1; i<=8; i++) {
			const centerPos = Vec2(T+ofst(i), S*8.5)
			const cfg = {centerPos, orient:dirs[i-1], radius:T*PacScale}
			const openType = i>0 ? (i%2 ? 1:2) : 0
			new PacSprite(Ctx, {openType}).draw(cfg)
		}
	}
	function drawAkabei() {
		const aka = ghost
		const spr = aka.cbSprite.stakeClothes
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {object} cfg
		 */
		function draw(x,y, cfg) {
			Ctx.save()
			aka.sprite.draw({...aka, x,y, ...cfg})
			Ctx.restore()
		}
		Ctx.translate(S/4, S*9+S/4-Gap/4)
		{ // Expand clothes
			const pos = Vec2.Zero, rates = [0.3, 0.5 ,1]
			for (let i=0,ofst=0; i<3; i++) {
				draw(...pos.vals, {aIdx:+(i==2)})
				const nPos = Vec2(pos).add(S*0.75, S/4)
				spr.expandClothes({...nPos,size:S}, +(i==2), rates[i])
				pos.x += S*1.2 + (++ofst * Gap)
			}
		}
		{ // Stake and offcut
			const s = T/TileSize
			const [sx,sy]= Vec2(spr.stakeSize).mul(s).vals
			// Stake
			Ctx.save()
			Ctx.translate(S*6.9, S-S/4-sy-3*s)
			Ctx.scale(s, s)
			spr.drawStake(Vec2.Zero)
			Ctx.restore()
			// Offcut
			Ctx.save()
			Ctx.translate(S*6.9+sx, S-S/4-3*s)
			Ctx.scale(s, s)
			spr.drawOffcut(Vec2.Zero)
			Ctx.restore()
		}
		draw(ofst(4.00), 0, {isRipped: true,orient:U})
		draw(ofst(5.00), 0, {isRipped: true,orient:'LowerR'})
		draw(ofst(0.00), S, {isMended: true})
		draw(ofst(1.00), S, {isMended: true,aIdx:1})
		draw(ofst(2.25), S, {isExposed:true})
		draw(ofst(4.25), S, {isExposed:true,aIdx:1})
	}
	return {draw}
}()

$('#brightRng').on('input', function() {
	const v = this.getAttribute('value')
	Ctx.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
})

$('#resetBtn').on('click', function() {
	Array.from(document.forms).forEach(f=> f.reset())
	$('[type=range]').trigger('input')
})

$load(()=> document.body.style.opacity = '1')
