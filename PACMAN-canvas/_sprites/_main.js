import '../_lib/mouse.js'
import PacSprite  from '../src/sprites/pacman.js'
import * as Pts   from '../src/sprites/points.js'
import * as Fruit from '../src/sprites/fruits.js'
import {GridSize,_t,_s,_gap,_ghost} from './_constants.js'

export const View = function() {
	/** @param {number} colIdx */
	const ofst = colIdx=> (_s*colIdx)+(_gap*colIdx)

	function draw() {
		Ctx.save()
		Ctx.translate(_gap, _gap/2)
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
		Ctx.translate(-_gap/2, 0)
		Ctx.setLineDash([2,2])
		Ctx.lineWidth = 2
		Ctx.strokeStyle = '#555'
		const {x:Cols,y:Rows}= GridSize
		const line = (x1=0,y1=0,x2=0,y2=0)=> Ctx.strokeLine(x1,y1,x2,y2)
		for (let y=0; y<Cols;   y++) line(ofst(y), 0, ofst(y), Rows*_s)
		for (let x=0; x<Rows+1; x++) line(0, x*_s, Cols*_s+_gap, x*_s)
		Ctx.restore()
	}
	function drawFruits() {
		for (let i=0; i<8; i++)
			Fruit.draw(Ctx, i, ofst(i)+_s/2, _s/2, _s/16)
	}
	function drawGhosts() {
		for (let row=1; row<=5; row++)
			for (let col=0; col<8; col++) {
				Ctx.save()
				Ctx.translate(_t/2, _t/2)
				drawGhost(col, row)
				Ctx.restore()
			}
	}
	/**
	 * @param {number} col
	 * @param {number} row
	 */
	function drawGhost(col, row) {
		const [x,y]= [ofst(col), row*_s]
		if (row < 5) {
			_ghost.sprite.draw({
				..._ghost,x,y,
				aIdx:  +(col % 2 != 0),
				orient:/**@type {const}*/([U,U,L,L,D,D,R,R])[col],
				color: Color[GhsNames[row-1]],
			})
			return
		}
		_ghost.sprite.draw({
			..._ghost,x,y,
			orient:/**@type {const}*/([R,R,R,R,U,L,D,R])[col],
			aIdx:     +(col % 2 != 0),
			isFright:  (col <= 3),
			isEscaping:(col >= 4),
			spriteIdx:+(col >= 2),
		})
	}
	function drawPoints() {
		/**
		 * @typedef {typeof Pts.Vals.All[number]} Pts
		 * @type {(pts:Pts, x:number, y:number)=> void}
		 */
		const draw = (pts, x, y)=> {
			const {ctx,w,h}= Pts.cache(pts, _s)
			Ctx.save()
			Ctx.translate(x, y)
			Ctx.drawImage(ctx.canvas, -w/2, -h/2)
			Ctx.restore()
		}
		const scoreLst = /**@type {const}*/([
			[200,400,800,1600,100,300,500,700],
			[1000,2000,3000,5000]
		])
		scoreLst[0].forEach((pts,i)=> draw(pts, ofst(i)+_t, _s*6+_t))
		scoreLst[1].forEach((pts,i)=> draw(pts, (_s+_gap/2)+_s*(2+_gap/_t)*i, _s*7+_s/2))
	}
	function drawPacman() {
		const dirs = /**@type {const}*/([U,U,L,L,D,D,R,R])
		for (let i=-1; i<=8; i++) {
			const centerPos = Vec2(_t+ofst(i), _s*8.5)
			const cfg = {centerPos, orient:dirs[i-1], radius:_t*PacScale}
			new PacSprite(Ctx, i>0 ? (i%2 ? 1:2) : 0).draw(cfg)
		}
	}
	function drawAkabei() {
		/** @type {(x:number, y:number, cfg:object)=> void} */
		const draw = (x,y, cfg)=> aka.sprite.draw({...aka, x,y, ...cfg})
		const aka = _ghost, spr = aka.cbSprite.stakeClothes

		Ctx.translate(_s/4, _s*9+_s/4-_gap/4)
		;{//Expand clothes
			const pos = Vec2.Zero, rates = [0.3, 0.5 ,1]
			for (let i=0,ofst=0; i<3; i++) {
				draw(...pos.vals, {aIdx:+(i==2)})
				const nPos = Vec2(pos).add(_s*0.75, _s/4)
				spr.expandClothes(+(i==2), rates[i], {...nPos,size:_s})
				pos.x += _s*1.2 + (++ofst*_gap)
			}
		}
		;{//Stake and offcut
			const s = _t/TileSize
			const [sx,sy]= Vec2(spr.stakeSize).mul(s).vals
			// Stake
			Ctx.save()
			Ctx.translate(_s*6.9, _s-_t/2-sy-3*s)
			Ctx.scale(s, s)
			spr.drawStake(Vec2.Zero)
			Ctx.restore()
			// Offcut
			Ctx.save()
			Ctx.translate(_s*6.9+sx, _s-_t/2-3*s)
			Ctx.scale(s, s)
			spr.drawOffcut(Vec2.Zero)
			Ctx.restore()
		}
		draw(ofst(4.00),  0, {isRipped: true,orient:U})
		draw(ofst(5.00),  0, {isRipped: true,orient:'LowerR'})
		draw(ofst(0.00), _s, {isMended: true})
		draw(ofst(1.00), _s, {isMended: true,aIdx:1})
		draw(ofst(2.25), _s, {isExposed:true})
		draw(ofst(4.25), _s, {isExposed:true,aIdx:1})
	}
	return {draw}
}()

$('#brightRng').on('input', function() {
	const v = /**@type {HTMLInputElement}*/(this).value
	Ctx.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
})
$('#resetBtn').on('click', function() {
	Array.from(document.forms).forEach(f=> f.reset())
	$('[type=range]').trigger('input')
})
$load(()=> document.body.style.opacity = '1')