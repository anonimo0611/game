import '../_lib/mouse.js'
import './anime.js'
import * as Pts   from '../src/sprites/points.js'
import * as Fruit from '../src/sprites/fruits.js'
import * as Snag  from '../src/sprites/snag.js'
import PacSprite  from '../src/sprites/pacman.js'
import {sizeRng,brightRng,resetBtn,GridSize,T,S,GAP,ghostGr,resize} from './_constants.js'

const [Cols,Rows]= GridSize
const ofst = (colIdx=0)=> (S*colIdx)+(GAP*colIdx)

const Data = /**@type {const}*/({
	SAVE_KEY: 'anopac-atlas',
	PacDirs:  [U,U,L,L,D,D,R,R],
	GhsDirs1: [U,U,L,L,D,D,R,R],
	GhsDirs2: [R,R,R,R,U,L,D,R],
	PtsTable: [
		[ 200, 400, 800,1600],// Ghost pts
		[ 100, 300, 500, 700],// Fruit pts
		[1000,2000,3000,5000],// Fruit pts
	]
})

;(new class Atlas {
	constructor() {
		$(sizeRng).on('resize', this.draw)
	}
	#drawGridLines() {
		Fg.save()
		Fg.translate(-GAP/2, +1)
		Fg.setLineDash([2,2])
		Fg.beginPath()
		for(let x=0; x<Cols+0; x++) Fg.setLinePath([ofst(x), 0], [ofst(x), Rows*S])
		for(let y=0; y<Rows+1; y++) Fg.setLinePath([0, y*S], [Cols*S+GAP, y*S])
		Fg.lineWidth   = 2
		Fg.strokeStyle = '#555555'
		Fg.stroke()
		Fg.restore()
	}
	#drawFruits() {
		for (let i=0; i<8; i++)
			Fruit.draw(Fg, i, S, ofst(7-i)+S/2, S/2)
	}
	#drawGhosts() {
		for (let y=1; y<6; y++) {
			for (let x=0; x<8; x++) {
				Fg.save()
				Fg.translate(T)
				this.#drawGhost(x, y, Data.GhsDirs1[x], Data.GhsDirs2[x])
				Fg.restore()
			}
		}
	}
	/**
	 * @param {number} col
	 * @param {number} row
	 * @param {Direction} dir1
	 * @param {Direction} dir2
	 */
	#drawGhost(col=0, row=0, dir1, dir2) {
		const center = Vec2.new(ofst(col), row*S)
		if (row < 5) {
			ghostGr.draw({
				center,
				orient:  dir1,
				type:    row-1,
				animIdx: +(col % 2 != 0),
			})
			return
		}
		ghostGr.draw({
			center,
			orient:     dir2,
			animIdx:    +(col % 2 != 0),
			spriteIdx:  +(col >= 2 && col <= 3),
			isFrightened:(col <= 3),
			isEscaping:  (col >= 4),
		})
	}
	#drawPoints() {
		/**
		 * @param {PointType} ptsType
		 * @param {PointVal}  ptsValue
		 * @param {number} x
		 * @param {number} y
		 */
		function draw(ptsType, ptsValue, x,y) {
			const {ctx:cache,w,h}= Pts.cache({type: ptsType,value: ptsValue},S)
			Fg.save()
			Fg.translate(x,y)
			Fg.drawImage(cache.canvas, -w/2, -h/2)
			Fg.restore()
		}
		const {PtsTable:tbl}= Data
		tbl[0].forEach((pts,i)=> draw(PointType.Ghost, pts, ofst(i+0)+T, S*6+T))
		tbl[1].forEach((pts,i)=> draw(PointType.Fruit, pts, ofst(i+4)+T, S*6+T))
		tbl[2].forEach((pts,i)=> draw(PointType.Fruit, pts, (S+GAP/2)+S*(2+GAP/T)*i, S*7+S/2))
	}
	#drawPacman() {
		for (let i=-1; i<9; i++) {
			const center = Vec2.new(T+ofst(i), S*8.5)
			const params = {center, orient:Data.PacDirs[i-1], radius:T}
			new PacSprite(Fg, T, i>0 ? (i%2 ? 0.5:1) : 0).draw(params)
		}
	}
	#drawAkabei() {
		const aka   = ghostGr
		const spr   = new Snag.SnagSprite(Fg)
		const scale = T/TILE_SIZE

		Fg.translate(T/2, (Rows-2)*S+T/2)

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
		Fg.save()
		Fg.clear()
		Fg.translate(GAP, GAP/2)
		this.#drawGridLines()
		this.#drawFruits()
		this.#drawGhosts()
		this.#drawPoints()
		this.#drawPacman()
		this.#drawAkabei()
		Fg.restore()
	}
})


if (localStorage[Data.SAVE_KEY]) {
	const data = JSON.parse(localStorage[Data.SAVE_KEY])
	sizeRng  .value = data['sizeRng']
	brightRng.value = data['brightRng']
	$('[type=range]').trigger('input')
}
const saveData = ()=> {
	localStorage[Data.SAVE_KEY] = JSON.stringify({
		sizeRng:   sizeRng.valueAsNumber,
		brightRng: brightRng.valueAsNumber,
	})
}

$win.on('load', ()=> {
	document.body.style.opacity = '1'
})

$(sizeRng).on('input', ()=> {
	resize()
	saveData()
})

$(brightRng).on('input', function() {
	const {value:v}= this
	Fg.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
	saveData()
})

$(resetBtn).on('click', function() {
	[...document.forms].forEach(f=> f.reset())
	$('[type=range]').trigger('input')
	saveData()
})