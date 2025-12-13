import '../_lib/mouse.js'
import * as Pts    from '../src/sprites/points.js'
import * as Fruit  from '../src/sprites/fruits.js'
import PacSprite   from '../src/sprites/pacman.js'
import GhsSpriteCb from '../src/sprites/ghost_cb.js'
import {GridSize,T,S,GAP,ghsSprite} from './_constants.js'

export const View = function()
{
	/** @param {number} colIdx */
	const ofst = colIdx=> (S*colIdx)+(GAP*colIdx)

	function draw()
	{
		Ctx.save()
		Ctx.translate(GAP, GAP/2)
		Ctx.clear()
		drawGridLines()
		drawFruits()
		drawGhosts()
		drawPoints()
		drawPacman()
		drawAkabei()
		Ctx.restore()
	}

	function drawGridLines()
	{
		Ctx.save()
		Ctx.translate(-GAP/2, 0)
		Ctx.setLineDash([2,2])
		Ctx.beginPath()
		const {x:Cols,y:Rows}= GridSize
		for (const y of range(Cols+0)) Ctx.setLinePath([ofst(y), 0], [ofst(y), Rows*S])
		for (const x of range(Rows+1)) Ctx.setLinePath([0, x*S], [Cols*S+GAP, x*S])
		Ctx.lineWidth   = 2
		Ctx.strokeStyle = '#555555'
		Ctx.stroke()
		Ctx.restore()
	}

	function drawFruits()
	{
		for (const i of range(8))
		{
			Fruit.draw(Ctx, i, ofst(i)+S/2, S/2, S/16)
		}
	}

	function drawGhosts()
	{
		for (const row of range(1,6))
		{
			for (const col of range(0,8))
			{
				Ctx.save()
				Ctx.translate(T/2, T/2)
				drawGhost(col, row)
				Ctx.restore()
			}
		}
	}

	/**
	 @param {number} col
	 @param {number} row
	*/
	function drawGhost(col, row)
	{
		const [x,y]= [ofst(col), row*S]
		if (row < 5)
		{
			ghsSprite.draw({
				x,y,size:S,
				type:  row-1,
				animIdx: +(col % 2 != 0),
				orient:/**@type {const}*/([U,U,L,L,D,D,R,R])[col],
			})
			return
		}
		ghsSprite.draw({
			x,y,size:S,
			orient:/**@type {const}*/([R,R,R,R,U,L,D,R])[col],
			animIdx:    +(col % 2 != 0),
			spriteIdx:  +(col >= 2),
			isFrightened:(col <= 3),
			isEscaping:  (col >= 4),
		})
	}

	function drawPoints()
	{
		/**
		 @typedef {typeof Pts.AllPts[number]} Pts
		 @type {(pts:Pts, x:number, y:number)=> void}
		*/
		function draw(pts, x, y)
		{
			const {ctx,w,h}= Pts.cache(pts, S)
			Ctx.save()
			Ctx.translate(x,y)
			Ctx.drawImage(ctx.canvas, -w/2, -h/2)
			Ctx.restore()
		}
		const ptsTable = /** @type {const} */
		([
			[200,400,800,1600,100,300,500,700],
			[1000,2000,3000,5000]
		])
		ptsTable[0].forEach((pts,i)=> draw(pts, ofst(i)+T, S*6+T))
		ptsTable[1].forEach((pts,i)=> draw(pts, (S+GAP/2)+S*(2+GAP/T)*i, S*7+S/2))
	}

	function drawPacman() {
		const dirs = /**@type {const}*/([U,U,L,L,D,D,R,R])
		for (const i of range(-1,9))
		{
			const center = Vec2.new(T+ofst(i), S*8.5)
			const cfg = {center, orient:dirs[i-1], radius:T*PacScale}
			new PacSprite(Ctx, i>0 ? (i%2 ? 1:2) : 0).draw(cfg)
		}
	}

	function drawAkabei() {
		const aka = ghsSprite
		const spr = GhsSpriteCb.stakeClothes

		Ctx.translate(S/4, S*9+S/4-GAP/4)

		/**
		 @type {(x:number, y:number, cfg:object)=> void}
		*/
		const draw = (x,y, cfg)=>
		{
			aka.draw({size:S,x,y,...cfg})
		}
		{// Expand clothes
			const pos = Vec2.Zero, rates = [0.3, 0.5 ,1]
			for (const i of range(3)) {
				draw(...pos.vals, {animIdx:+(i==2)})
				const nPos = Vec2.new(pos).add(S*0.75, S/4)
				spr.stretchClothing(+(i==2), rates[i], {...nPos,size:S})
				pos.x += S*1.2 + ((i+1)*GAP)
			}
		}
		{// Stake and offcut
			const s = T/TileSize
			const [sx,sy]= Vec2.new(spr.stakeSize).mul(s).vals
			// Stake
			Ctx.save()
			Ctx.translate(S*6.9, S-T/2-sy-3*s)
			Ctx.scale(s, s)
			spr.drawStake(Vec2.Zero)
			Ctx.restore()
			// Offcut
			Ctx.save()
			Ctx.translate(S*6.9+sx, S-T/2-3*s)
			Ctx.scale(s, s)
			spr.drawCloth(Vec2.Zero)
			Ctx.restore()
		}
		draw(ofst(4.00), 0, {isRipped: true,orient:U})
		draw(ofst(5.00), 0, {isRipped: true,orient:'Bracket'})
		draw(ofst(0.00), S, {isMended: true})
		draw(ofst(1.00), S, {isMended: true,animIdx:1})
		draw(ofst(2.25), S, {isExposed:true})
		draw(ofst(4.25), S, {isExposed:true,animIdx:1})
	}

	return {draw}
}()

$('#brightRng').on('input', function()
{
	const v = /**@type {HTMLInputElement}*/(this).value
	Ctx.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
})

$('#resetBtn').on('click', function()
{
	Array.from(document.forms).forEach(f=> f.reset())
	$('[type=range]').trigger('input')
})

$load(()=> document.body.style.opacity = '1')