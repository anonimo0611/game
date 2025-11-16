const Fns = freeze([cherry,strawberry,orange,apple,melon,gala,bell,key])
/**
 @param {ExtendedContext2D} ctx
 @param {number} fruitIdx
*/
export function draw(ctx, fruitIdx, x=T,y=T-2, scale=T/8) {
	const Scale = 1.05
	ctx.save()
	ctx.lineWidth = 1
	ctx.lineCap = ctx.lineJoin = 'round'
	ctx.translate(x, y)
	ctx.scale(scale*Scale, scale*Scale)
	Fns[fruitIdx](ctx)
	ctx.restore()
}
export const [current,cache]= function() {
	const {cvs,ctx}= canvas2D(null,T*2)
	function cache(/**@type {number}*/idx) {
		ctx.clear()
		draw(ctx, idx)
	}
	return [cvs,cache]
}()

{// Create a sprite sheet for menu icons
	const Menu = $byId('LevelMenu')
	const size = +Menu.css('--scale') * T
	const {ctx}= canvas2D(null, size*8, size)
	for (const i of Fns.keys())
		draw(ctx, i, size/2+size*i, size/2, size/16)
	Menu.css('--url',`url(${ctx.canvas.toDataURL()})`)
}

function cherry(ctx=Ctx) {
	// both fruits
	[[-6,-1],[-1,1]].forEach(([x,y],idx)=> {
		ctx.save()
		ctx.translate(x,y)

		// red fruit
		ctx.fillCircle(2.5, 2.5, 3, '#F00')
		ctx.save()
 		ctx.globalCompositeOperation = 'destination-out'
		ctx.beginPath()
	  	ctx.arc(2.5, 2.5, 3, (idx? 0 : PI/4), PI*2)
		ctx.lineWidth = 0.5
		ctx.stroke()
		ctx.restore()

		// white shine
		ctx.newLinePath([1.1,2.9],[2.1,3.9])
		ctx.lineCap = 'round'
		ctx.lineWidth = 1.05
		ctx.strokeStyle = '#FFF'
		ctx.stroke()
		ctx.restore()
	})
	// stems
	ctx.beginPath()
	ctx.moveTo(-3,0)
	ctx.bezierCurveTo(-1,-2, 2,-4, 5,-5)
	ctx.lineTo(5,-4)
	ctx.bezierCurveTo(3,-4, 1, 0, 1, 2)
	ctx.strokeStyle = '#F90'
	ctx.stroke()
}

function strawberry(ctx=Ctx) {
	// red body
	ctx.beginPath()
	ctx.moveTo(-1,-4)
	ctx.bezierCurveTo(-3,-4,-5,-3,-5, -1)
	ctx.bezierCurveTo(-5, 3,-2, 5, 0,  6)
	ctx.bezierCurveTo( 3, 5, 5, 2, 5,  0)
	ctx.bezierCurveTo( 5,-3, 3,-4, 0, -4)
	ctx.fillStyle = ctx.strokeStyle = '#F00'
	ctx.fill()
	ctx.stroke()

	;[//white spots
		[-4,-1],[-3,2],[-2, 0],[-1,4],[0, 2],
		[ 0, 0],[ 2,4],[ 2,-1],[ 3,1],[4,-2]
	].forEach(([x,y])=> ctx.fillCircle(x,y, .55, '#FFF'))

	// green leaf
	ctx.newLinePath([0,-4],[-3,-4],[0,-4],[-2,-3],[-1,-3],[0,-4])
	ctx.addLinePath([0,-2],[ 0,-4],[1,-3],[ 2,-3],[ 0,-4],[3,-4])
	ctx.closePath()
	ctx.strokeStyle = '#0F0'
	ctx.stroke()

	// stem
	ctx.strokeStyle = '#FFF'
	ctx.strokeLine(0,-4, 0,-5)
}

function orange(ctx=Ctx) {
	// orange body
	ctx.beginPath()
	ctx.moveTo(-2,-2)
	ctx.bezierCurveTo(-3, -2,-5, -1,-5, 1)
	ctx.bezierCurveTo(-5,  4,-3.5,6, 0, 6)
	ctx.bezierCurveTo( 3.5,6, 5,  4, 5, 1)
	ctx.bezierCurveTo( 5, -1, 3, -2, 2,-2)
	ctx.closePath()
	ctx.fillStyle = ctx.strokeStyle = '#FCA95E'
	ctx.fill()
	ctx.stroke()

	// stem
	ctx.beginPath()
	ctx.moveTo(0,-1)
	ctx.quadraticCurveTo(0,-2,-1,-2)
	ctx.quadraticCurveTo(0,-2, 0,-4)
	ctx.quadraticCurveTo(0,-2, 1,-2)
	ctx.quadraticCurveTo(0,-2, 0,-1)
	ctx.strokeStyle = '#B88A3D'
	ctx.stroke()

	// green leaf
	ctx.beginPath()
	ctx.moveTo(0.5, -4)
	ctx.quadraticCurveTo(1,-5, 2,-5)
	ctx.bezierCurveTo(3,-5, 4,-4, 5,-4)
	ctx.bezierCurveTo(4,-4, 4,-3, 3,-3)
	ctx.bezierCurveTo(2,-3, 2,-4,.5,-4)
	ctx.strokeStyle = ctx.fillStyle = '#0F0'
	ctx.stroke()
	ctx.fill()
}

function apple(ctx=Ctx) {
	// red fruit
	ctx.beginPath()
	ctx.moveTo(-2, -3)
	ctx.bezierCurveTo(-2,-4,-3,-4,-4,-4)
	ctx.bezierCurveTo(-5,-4,-6,-3,-6, 0)
	ctx.bezierCurveTo(-6, 3,-4, 6,-2, 6)
	ctx.quadraticCurveTo(-.5, 6, -.5, 5)
	ctx.bezierCurveTo(-.9,6,.2, 6, 1, 6)
	ctx.bezierCurveTo( 3, 6, 5, 3, 5, 0)
	ctx.bezierCurveTo( 5,-3, 3,-4, 2,-4)
	ctx.quadraticCurveTo(0,-4, 0,-3)
	ctx.closePath()
	ctx.fillStyle = '#F00'
	ctx.fill()

	// stem
	ctx.beginPath()
	ctx.moveTo(-1,-3)
	ctx.quadraticCurveTo(-1,-5, 0,-5)
	ctx.strokeStyle = '#F90'
	ctx.stroke()

	// shine
	ctx.beginPath()
	ctx.moveTo(2,3)
	ctx.quadraticCurveTo(3, 3, 3, 1)
	ctx.strokeStyle = '#FFF'
	ctx.stroke()
}

function melon(ctx=Ctx) {
	// draw body
	ctx.fillCircle(0, 1.5, 5.2, '#7BF331')

	// draw stem
	ctx.newLinePath([0,-3],[0,-5])
	ctx.moveTo(2, -5)
	ctx.quadraticCurveTo(-3,-5,-3,-6)
	ctx.strokeStyle = '#69B4AF'
	ctx.stroke()

	// dark lines
	ctx.translate(0, -0.5)
	ctx.newLinePath([.5,-2],[-4, 2],[0, 6])
	ctx.setLinePath([-3,-1],[-1, 1])
	ctx.setLinePath([-2, 6],[ 2, 2])
	ctx.setLinePath([ 1, 7],[ 3, 5],[0, 2],[3,-1])
	ctx.setLinePath([ 1,-1],[ 4, 2])
	ctx.lineWidth = 0.3
	ctx.strokeStyle = '#5B8F8C'
	ctx.stroke()

	;[//white spots
		[ 0.0,-2.3],[-2,-1.2],[-4, 0.8],[-3.6, 3.2],[1, 0],
	  	[-1.3, 2.0],[-1, 4.5],[ 3, 2.5],[ 1.0, 4.5]
	].forEach(([x,y])=> ctx.fillCircle(x,y, 0.5, '#FFF'))
}

function gala(ctx=Ctx) {
	const yellow = '#F8FF00'
	for (const scaleX of [1,-1]) {
		// yellow body
		ctx.save()
		ctx.scale(scaleX, 1)
		ctx.fillPolygon(yellow,[0,-2.6],[4.9,-2.4],[4.6,-.5],[2,1.6],[1.1,.5],[0,.5])
		// blue wings
		ctx.fillPolygon('#0AF',[4.6,-4.8],[6,-4.5],[6,.6],[1.6,4],[1.6,2],[4.6,-.6])
		ctx.restore()
	}
	// yellow tail
	ctx.lineWidth   = 1.2
	ctx.strokeStyle = yellow
	ctx.strokeLine(0, 0, 0, 6)

	// red arrow head
	ctx.beginPath()
	for (const scaleX of [1,-1]) {
		ctx.scale(scaleX, 1)
		ctx.setLinePath([0,-4.9],[3.8,-2.2],[3.0,-1.2],[1.3,-2.3])
		ctx.quadraticCurveTo(0.7,-2.7, 0.7,-1.4)
		ctx.quadraticCurveTo(0.4, 0.0, 0.0, 0.0)
	}
	ctx.fillStyle = '#FF3401'
	ctx.fill()
}

function bell(ctx=Ctx) {
	// bell body
	ctx.beginPath()
	for (const s of [1,-1]) {
		ctx.addLinePath([0,-5.8],[1.3*s,-5.8],[1.5*s,-5.3])
		ctx.quadraticCurveTo(4.5*s, -4.2, 4.9*s, 1.2)
		ctx.addLinePath([5.5*s,2.1],[5.5*s,4.3],[4.9*s,4.9],[0,4.9])
	}
	ctx.fillStyle = '#F8FF00'
	ctx.fill()

	// marks
	ctx.beginPath()
	ctx.lineWidth	= 0.8
	ctx.strokeStyle = '#0'
	ctx.strokeLine(-3.5, 2.3, -3.4,1.1)
	ctx.moveTo(-3, -0.7)
	ctx.quadraticCurveTo(-2.7,-3.0,-1.8,-3.1)
	ctx.stroke()
	ctx.strokeLine(-0.5,-4.3, 0.5,-4.3)

	// bell bottom
	ctx.beginPath()
	ctx.ellipse(0, 4.9, 4.6, 1, 0, 0, PI*2)
	ctx.fillStyle = '#53A8FB'
	ctx.fill()
	ctx.fillCircle(1.2, 5.3, 1.4, '#FFF')
}

function key(ctx=Ctx) {
	// key metal
	ctx.newLinePath([-1,-1.5],[-1.0, 5.4],[0,6.4],[1,5.4],[1,2.8])
	ctx.setLinePath([ 1, 1.8],[ 1.0,-1.5])
	ctx.setLinePath([ 1, 0.6],[ 2.9, 0.6])
	ctx.setLinePath([ 1, 3.9],[ 2.9, 3.9])
	ctx.save()
	ctx.lineCap = 'butt'
	ctx.strokeStyle = '#FFF'
	ctx.stroke()
	ctx.restore()

	// key top
	ctx.beginPath()
	ctx.moveTo(-3.6, -4.3)
	ctx.bezierCurveTo(-3.5, -6.8, +3.5,-6.8, +3.6,-4.3)
	ctx.arcTo(+3.6, -1.3, +2.5, -1.3, 0.8)
	ctx.arcTo(-3.6, -1.3, -3.6, -2.5, 0.8)
	ctx.fillStyle = '#68B9FC'
	ctx.fill()

	// key hole
	ctx.globalCompositeOperation = 'destination-out'
	ctx.strokeLine(-1.2, -4.5, +1.2, -4.5)
}