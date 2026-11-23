import '@lib/mouse.js'
import './anime.js'
import './setup.js'
import {U,R,D,L}  from '@lib/direction.js'
import * as Pts   from '@/sprites/points.js'
import * as Fruit from '@/sprites/fruits.js'
import * as Snag  from '@/sprites/snag.js'
import PacSprite  from '@/sprites/pacman.js'
import {sizeRng,GridSize,TS,AS,GAP,ghostGr} from './_constants.js'

const [Cols,Rows]= GridSize
const ofst = (colIdx=0)=> (AS*colIdx)+(GAP*colIdx)

const Data = /**@type {const}*/({
	PacDirs:  [U,U,L,L,D,D,R,R],
	GhsDirs1: [U,U,L,L,D,D,R,R],
	GhsDirs2: [R,R,R,R,U,L,D,R],
	PtsTable: {
		Ghost:  [ 200, 400, 800,1600],
		Fruit0: [ 100, 300, 500, 700],
		Fruit1: [1000,2000,3000,5000],
	}
})

function drawGridLines() {
	Fg.save()
	Fg.translate(-GAP/2, +1)
	Fg.setLineDash([2,2])
	Fg.beginPath()
	for (let x=0; x<Cols+0; x++) {
		Fg.setLinePath([ofst(x), 0], [ofst(x), AS*Rows])
	}
	for (let y=0; y<Rows+1; y++) {
		Fg.setLinePath([0, AS*y], [Cols*AS+GAP, AS*y])
	}
	Fg.lineWidth   = 2
	Fg.strokeStyle = '#555'
	Fg.stroke()
	Fg.restore()
}

function drawFruits() {
	for (let i=0; i<8; i++) {
		Fruit.draw(Fg, i, AS, ofst(7-i)+TS, TS)
	}
}

function drawGhosts() {
	for (let y=1; y<6; y++) {
		for (let x=0; x<8; x++) {
			Fg.save()
			Fg.translate(TS)
			drawGhost(x, y, Data.GhsDirs1[x], Data.GhsDirs2[x])
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
function drawGhost(col=0, row=0, dir1, dir2) {
	const center = vec2(ofst(col), row*AS)
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

function drawPtsTable() {
	const {PtsTable:t}= Data
	t.Ghost .forEach((p,i)=> drawPts(PointType.Ghost, p, ofst(i+0)+TS, AS*6+TS))
	t.Fruit0.forEach((p,i)=> drawPts(PointType.Fruit, p, ofst(i+4)+TS, AS*6+TS))
	t.Fruit1.forEach((p,i)=> drawPts(PointType.Fruit, p, (AS+GAP/2)+AS*(2+GAP/TS)*i, AS*7+AS/2))
}

/**
 * @param {PointType} type
 * @param {PointVal}  value
 * @param {number} x
 * @param {number} y
 */
function drawPts(type, value, x,y) {
	const {ctx,w,h}= Pts.cache({type,value}, AS)
	Fg.save()
	Fg.translate(x,y)
	Fg.drawImage(ctx.canvas, -w/2, -h/2)
	Fg.restore()
}

function drawPacman() {
	for (let i=-1; i<9; i++) {
		const center = vec2(TS+ofst(i), AS*8.5)
		const params = {center, orient:Data.PacDirs[i-1], radius:TS}
		new PacSprite(Fg, TS, i>0 ? (i%2 ? 0.5:1) : 0).draw(params)
	}
}

function drawAkabei() {
	const aka   = ghostGr
	const spr   = new Snag.SnagSprite(Fg)
	const scale = TS/TILE_SIZE

	Fg.translate(TS/2, (Rows-2)*AS+TS/2)

	/** @type {(x:number, y:number, params:object)=> void} */
	const draw = (x,y, params)=> {
		const center = vec2(x+TS/2, y+TS/2)
		aka.draw({center, ...params})
	}

	{// Snagged clothing
		const pos = Vec2.Zero, ratios = [0.3, 0.5 ,1]
		for (let i=0; i<3; i++) {
			draw(...pos.vals, {animIdx:+(i == 2)})
			const nPos = pos.clone.add(AS*0.75, AS/4)
			spr.drawSnaggedClothing(+(i == 2), ratios[i], {...nPos,scale})
			pos.x += AS*1.2 + ((i+1)*GAP)
		}
	}
	{// Stake and Scrap
		const pos = vec2(AS*6.9, AS-TS/2)
		spr.drawSnaggedStake({scale,...pos,isRipped:true})
	}
	draw(ofst(4.00),  0, {isRipped: true,orient:U})
	draw(ofst(5.00),  0, {isRipped: true,orient:Dazed})
	draw(ofst(0.00), AS, {isMended: true})
	draw(ofst(1.00), AS, {isMended: true,animIdx:1})
	draw(ofst(2.25), AS, {isExposed:true})
	draw(ofst(4.25), AS, {isExposed:true,animIdx:1})
}

function draw() {
	Fg.save()
	Fg.clear()
	Fg.translate(GAP, GAP/2)
	drawGridLines()
	drawFruits()
	drawGhosts()
	drawPtsTable()
	drawPacman()
	drawAkabei()
	Fg.restore()
}
$(sizeRng).on('resize', draw)