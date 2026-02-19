import '../_lib/mouse.js'
import * as Pts   from '../src/sprites/points.js'
import * as Fruit from '../src/sprites/fruits.js'
import PacSprite  from '../src/sprites/pacman.js'
import {snagSpr}  from '../src/sprites/ghost_cb.js'
import {GridSize,T,S,GAP,ghsSprite} from './_constants.js'

export const View = function()
{
	/** @param {number} colIdx */
	const ofst = colIdx=> (S*colIdx)+(GAP*colIdx)
	const ctx  = Fg

	function draw()
	{
		ctx.save()
		ctx.translate(GAP, GAP/2)
		ctx.clear()
		drawGridLines()
		drawFruits()
		drawGhosts()
		drawPoints()
		drawPacman()
		drawAkabei()
		ctx.restore()
	}

	function drawGridLines()
	{
		ctx.save()
		ctx.translate(-GAP/2, 0)
		ctx.setLineDash([2,2])
		ctx.beginPath()
		const {x:Cols,y:Rows}= GridSize
		for (const y of range(Cols+0)) ctx.setLinePath([ofst(y), 0], [ofst(y), Rows*S])
		for (const x of range(Rows+1)) ctx.setLinePath([0, x*S], [Cols*S+GAP, x*S])
		ctx.lineWidth   = 2
		ctx.strokeStyle = '#555555'
		ctx.stroke()
		ctx.restore()
	}

	function drawFruits()
	{
		for (const i of range(8))
		{
			Fruit.draw(ctx, i, ofst(7-i)+S/2, S/2, S/16)
		}
	}

	function drawGhosts()
	{
		for (const row of range(1,6))
		{
			for (const col of range(0,8))
			{
				ctx.save()
				ctx.translate(T/2, T/2)
				drawGhost(col, row)
				ctx.restore()
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
			ghsSprite.draw(ctx,
			{
				x,y,size:S,
				type:  row-1,
				animIdx: +(col % 2 != 0),
				orient:/**@type {const}*/([U,U,L,L,D,D,R,R])[col],
			})
			return
		}
		ghsSprite.draw(ctx,
		{
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
		 @import {PtsType} from '../src/sprites/points'
		 @type {(pts:PtsType, x:number, y:number)=> void}
		*/
		function draw(pts, x, y)
		{
			const {ctx:cache,w,h}= Pts.cache(pts, S)
			ctx.save()
			ctx.translate(x,y)
			ctx.drawImage(cache.canvas, -w/2, -h/2)
			ctx.restore()
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
			const params = {center, orient:dirs[i-1], radius:T*PacScale}
			new PacSprite(ctx, i>0 ? (i%2 ? 1:2) : 0).draw(params)
		}
	}

	function drawAkabei() {
		const aka = ghsSprite
		const spr = snagSpr(ctx)

		ctx.translate(S/4, S*9+S/4-GAP/4)

		/**
		 @type {(x:number, y:number, params:object)=> void}
		*/
		const draw = (x,y, params)=>
		{
			aka.draw(ctx,{size:S,x,y,...params})
		}
		{// Snagged Clothing
			const pos = Vec2.Zero, ratios = [0.3, 0.5 ,1]
			for (const i of range(3)) {
				draw(...pos.vals, {animIdx:+(i==2)})
				const nPos = Vec2.new(pos).add(S*0.75, S/4)
				spr.drawSnaggedClothing(+(i==2), ratios[i], {...nPos,size:S})
				pos.x += S*1.2 + ((i+1)*GAP)
			}
		}
		{// Stake and Shard
			const s = T/TileSize
			const [sx,sy]= Vec2.new(spr.stakeSize).mul(s).vals
			// Stake
			ctx.save()
			ctx.translate(S*6.9, S-T/2-sy-3*s)
			ctx.scale(s, s)
			spr.drawStake(Vec2.Zero)
			ctx.restore()
			// Shard
			ctx.save()
			ctx.translate(S*6.9+sx, S-T/2-3*s)
			ctx.scale(s, s)
			spr.drawShard(Vec2.Zero)
			ctx.restore()
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
	Fg.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
})

$('#resetBtn').on('click', function()
{
	Array.from(document.forms).forEach(f=> f.reset())
	$('[type=range]').trigger('input')
})

$load(()=> document.body.style.opacity = '1')