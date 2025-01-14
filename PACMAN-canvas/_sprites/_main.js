import '../_lib/mouse.js'
import {Vec2}              from '../_lib/vec2.js'
import {U,R,D,L}           from '../_lib/direction.js'
import {Color,TileSize}    from '../src/_constants.js'
import {Cvs,Ctx}           from '../src/_canvas.js'
import fruitsSprites       from '../src/fruits_sprite.js'
import pointsSprites       from '../src/points_sprite.js'
import PacSprite           from '../src/pacman/pac_sprite.js'
import {MouthMin,MouthMid} from '../src/pacman/pac_sprite.js'
import {ColMax,RowMax,T,S} from './_constants.js'
import {Gap,ghost,cbAkabei}from './_constants.js'

const ofst = (idx,x=S)=> (x*idx+Gap*idx)
export function drawSprites() {
	Ctx.save()
	Ctx.clearRect(0,0, Cvs.width, Cvs.height)
	//drawGridLines()
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
	Ctx.lineWidth = 2
	Ctx.strokeStyle = Color.Grid
	const line = (...args)=> cvsStrokeLine(Ctx)(...args)
	for (let y=1; y<ColMax; y++) line(ofst(y), 0, ofst(y), RowMax*S)
	for (let x=0; x<RowMax; x++) line(0, x*S, ColMax*S, x*S)
	Ctx.restore()
}
function drawFruits() {
	for (const [i,fn] of fruitsSprites.entries()) {
		Ctx.save()
		Ctx.translate(ofst(i)+S/2, S/2)
		Ctx.scale(S/16*1.05, S/16*1.05)
		fn(Ctx)
		Ctx.restore()
	}
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
function drawGhost(col, row) {
	const [x,y]= [ofst(col), row*S]
	const dirs = [U,U,L,L,D,D,R,R]
	if (row < 5) {
		ghost.sprite.draw({
			...ghost,x,y,
			idx:   row-1,
			aIdx:  col % 2 != 0,
			orient:dirs[col],
		})
		return
	}
	const orient = [R,R,R,R,U,L,D,R][col]
	ghost.sprite.draw({
		...ghost,x,y,orient,
		aIdx:       (col % 2 != 0),
		frightened: (col <= 3),
		escaping:   (col >= 4),
		spriteIdx: +(col >= 2),
	})
}
function drawPoints() {
	const draw = (pts, x, y)=> {
		Ctx.save()
		Ctx.translate(x, y)
		Ctx.scale(S/16, S/16)
		pointsSprites(0, 0, pts)
		Ctx.restore()
	}
	const pts1 = (pts,i)=> {draw(pts, ofst(i)+T, S*6+T)}
	const pts2 = (pts,i)=> {draw(pts, ofst(i,S*1.4)+S/9+T, S*7+S/2)}
	;[200,400,800,1600,100,300,500,700].forEach(pts1)
	;[1000,2000,3000,5000].forEach(pts2)
}
function drawPacman() {
	const dirs = [U,U,L,L,D,D,R,R]
	for (let i=-1; i<=8; i++) {
		const cfg = {
			orient: dirs[i-1],
			Radius: S/2*0.96,
			mouthRad:i>0 ? [MouthMin,MouthMid][i%2] : null,
		}
		new PacSprite(cfg).draw(Ctx, Vec2(T+ofst(i), S*8.5))
	}
}
function drawAkabei() {
	const aka = cbAkabei
	function draw(pos, cfg) {
		Ctx.save()
		aka.sprite.draw({...aka, ...pos, ...cfg})
		Ctx.restore()
	}
	Ctx.translate(S/4, S*9+S/4)
	{ // Expand clothes
		const pos = Vec2.Zero, rates = [0.3, 0.5 ,1]
		for (let i=0,ofst=0; i<3; i++) {
			draw(pos, {aIdx:+(i==2)})
			const nPos = Vec2(pos).add(S*0.75, S/4)
			aka.cbSprite.expandClothes({...nPos,size:S}, +(i==2), rates[i])
			pos.x += S*1.2 + (++ofst * Gap)
		}
	}
	{ // Stake and offcut
		const s = T/TileSize
		const [sx,sy]= Vec2(aka.cbSprite.stake.size).mul(s).vals
		// Stake
		Ctx.save()
		Ctx.translate(S*6.8, S-S/4-sy-3*s)
		Ctx.scale(s, s)
		aka.cbSprite.drawStake(Vec2.Zero)
		Ctx.restore()
		// Offcut
		Ctx.save()
		Ctx.translate(S*6.8+sx, S-S/4-3*s)
		Ctx.scale(s, s)
		aka.cbSprite.drawOffcut(Vec2.Zero)
		Ctx.restore()
	}
	draw(Vec2(ofst(4),  0),{ripped:true,orient:U})
	draw(Vec2(ofst(5),  0),{ripped:true,orient:'LowerR'})
	draw(Vec2(0,        S),{repaired:true})
	draw(Vec2(S+Gap,    S),{repaired:true,aIdx:1})
	draw(Vec2(ofst(2.0),S),{isHadake:true})
	draw(Vec2(ofst(3.3),S),{isHadake:true,aIdx:1})
}
drawSprites()

$('#brightRng').on('input', function() {
	const v = this.value
	Cvs.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
})
$('#restBtn').on('click', ()=> {
	[...document.forms].forEach(f=> f.reset())
	$('[type=range]').trigger('input')
})
$load(()=> document.body.style.opacity = 1)