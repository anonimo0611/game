import '../_lib/mouse.js'
import './anime.js'
import * as Pts   from '../src/sprites/points.js'
import * as Fruit from '../src/sprites/fruits.js'
import * as Snag  from '../src/sprites/snag.js'
import PacSprite  from '../src/sprites/pacman.js'
import {SizeRng,BrightRng,ResetBtn,GridSize,T,S,GAP,ghostGr} from './_constants.js'

const ctx  = Fg
const ofst = (colIdx=0)=> (S*colIdx)+(GAP*colIdx)
const [Cols,Rows]= GridSize

;(new class Atlas {
	constructor() {
		$(SizeRng).on('resize', this.draw)
	}
	#drawGridLines() {
		ctx.save()
		ctx.translate(-GAP/2, +1)
		ctx.setLineDash([2,2])
		ctx.beginPath()
		for(let x=0; x<Cols+0; x++) ctx.setLinePath([ofst(x), 0], [ofst(x), Rows*S])
		for(let y=0; y<Rows+1; y++) ctx.setLinePath([0, y*S], [Cols*S+GAP, y*S])
		ctx.lineWidth   = 2
		ctx.strokeStyle = '#555555'
		ctx.stroke()
		ctx.restore()
	}
	#drawFruits() {
		for (let i=0; i<8; i++)
			Fruit.draw(ctx, i, ofst(7-i)+S/2, S/2, S/16)
	}
	#drawGhosts() {
		for (let y=1; y<6; y++) {
			for (let x=0; x<8; x++) {
				ctx.save()
				ctx.translate(T)
				this.#drawGhost(x, y)
				ctx.restore()
			}
		}
	}
	#drawGhost(col=0, row=0) {
		const center = Vec2.new(ofst(col), row*S)
		if (row < 5) {
			ghostGr.draw({
				center,
				type:  row-1,
				animIdx: +(col % 2 != 0),
				orient:/**@type {const}*/([U,U,L,L,D,D,R,R])[col],
			})
			return
		}
		ghostGr.draw({
			center,
			orient:/**@type {const}*/([R,R,R,R,U,L,D,R])[col],
			animIdx:    +(col % 2 != 0),
			spriteIdx:  +(col >= 2 && col <= 3),
			isFrightened:(col <= 3),
			isEscaping:  (col >= 4),
		})
	}
	#drawPoints() {
		/**
		 @param {number}   pointType
		 @param {PtsValue} pointValue
		 @param {number} x
		 @param {number} y
		*/
		function draw(pointType, pointValue, x,y) {
			const {ctx:cache,w,h}= Pts.cache({pointType,pointValue},S)
			ctx.save()
			ctx.translate(x,y)
			ctx.drawImage(cache.canvas, -w/2, -h/2)
			ctx.restore()
		}
		const table = /**@type {const}*/([
			[200,400,800,1600],   // Ghost pts
			[100,300,500,700],    // Fruit pts
			[1000,2000,3000,5000],// Fruit pts
		])
		table[0].forEach((pts,i)=> draw(PointType.Ghost, pts, ofst(i+0)+T, S*6+T))
		table[1].forEach((pts,i)=> draw(PointType.Fruit, pts, ofst(i+4)+T, S*6+T))
		table[2].forEach((pts,i)=> draw(PointType.Fruit, pts, (S+GAP/2)+S*(2+GAP/T)*i, S*7+S/2))
	}
	#drawPacman() {
		const dirs = /**@type {const}*/([U,U,L,L,D,D,R,R])
		for (let i=-1; i<9; i++) {
			const center = Vec2.new(T+ofst(i), S*8.5)
			const params = {center, orient:dirs[i-1], radius:T}
			new PacSprite(ctx, T, i>0 ? (i%2 ? 1:2) : 0).draw(params)
		}
	}
	#drawAkabei() {
		const aka   = ghostGr
		const spr   = new Snag.SnagSprite(ctx)
		const scale = T/TileSize

		ctx.translate(T/2, (Rows-2)*S+T/2)

		/** @type {(x:number, y:number, params:object)=> void} */
		const draw = (x,y, params)=> {
			const center = Vec2.new(x+T/2, y+T/2)
			aka.draw({center, ...params})
		}

		{// Snagged clothing
			const pos = Vec2.Zero, ratios = [0.3, 0.5 ,1]
			for (let i=0; i<3; i++) {
				draw(...pos.vals, {animIdx:+(i == 2)})
				const nPos = Vec2.new(pos).add(S*0.75, S/4)
				spr.drawSnaggedClothing(+(i == 2), ratios[i], {...nPos,scale})
				pos.x += S*1.2 + ((i+1)*GAP)
			}
		}
		{// Stake and Scrap
			const pos = Vec2.new(S*6.9, S-T/2)
			spr.drawSnaggedStake({scale,...pos,isRipped:true})
		}
		draw(ofst(4.00), 0, {isRipped: true,orient:U})
		draw(ofst(5.00), 0, {isRipped: true,orient:Dazed})
		draw(ofst(0.00), S, {isMended: true})
		draw(ofst(1.00), S, {isMended: true,animIdx:1})
		draw(ofst(2.25), S, {isExposed:true})
		draw(ofst(4.25), S, {isExposed:true,animIdx:1})
	}
	draw = ()=> {
		ctx.save()
		ctx.translate(GAP, GAP/2)
		ctx.clear()
		this.#drawGridLines()
		this.#drawFruits()
		this.#drawGhosts()
		this.#drawPoints()
		this.#drawPacman()
		this.#drawAkabei()
		ctx.restore()
	}
})

$(BrightRng).on('input', function() {
	const {value:v}= this
	ctx.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
})
$(ResetBtn).on('click', function() {
	[...document.forms].forEach(f=> f.reset())
	$('[type=range]').trigger('input')
})
$load(()=> document.body.style.opacity = '1')