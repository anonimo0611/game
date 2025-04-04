function cherry(ctx=Ctx) {
	function fruit(x,y, idx) {
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
	}
	// both fruits
	fruit(-6,-1, 0)
	fruit(-1,+1, 1)

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

	// white spots
	;[[-4,-1],[-3,2],[-2, 0],[-1,4],[0, 2],
	  [ 0, 0],[ 2,4],[ 2,-1],[ 3,1],[4,-2],
	].forEach(s=> ctx.fillCircle(...s, .55, '#FFF'))

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

	// white spots
	;[[ 0.0,-2.3],[-2,-1.2],[-4, 0.8],[-3.6, 3.2],[1, 0],
	  [-1.3, 2.0],[-1, 4.5],[ 3, 2.5],[ 1.0, 4.5]
	].forEach(s=> ctx.fillCircle(...s, 0.5, '#FFF'))
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
	ctx.newLinePath([0,-5],[3.8,-2.2],[3.0,-1.2],[1.3,-2.3])
	ctx.quadraticCurveTo(+0.7, -2.7, 0.6, -1.4)
	ctx.lineTo(+0.4, -0.6)
	ctx.quadraticCurveTo(+0.0, +0.0, -0.4, -0.6)
	ctx.lineTo(-0.4, -0.6)
	ctx.lineTo(-0.6, -1.4)
	ctx.quadraticCurveTo(-0.7, -2.7, -1.3, -2.2)
	ctx.lineTo(-1.3, -2.3)
	ctx.lineTo(-3.0, -1.2)
	ctx.lineTo(-3.8, -2.2)
	ctx.fillStyle = '#FF3401'
	ctx.fill()
}
function bell(ctx=Ctx) {
	// bell body
	ctx.newLinePath([0, -6.3],[1.3, -6.3],[1.3, -6])
	ctx.quadraticCurveTo(5.0, -5.0, 5.5, 1.6)
	ctx.addLinePath([ 6.1,2.2],[ 6.1,4.7],[ 5.4,5.3])
	ctx.addLinePath([-5.4,5.3],[-6.1,4.7],[-6.1,2.2],[-5.5,1.6])
	ctx.quadraticCurveTo(-5, -5, -1.3, -6)
	ctx.lineTo(-1.3, -6.3)
	ctx.fillStyle = '#F8FF00'
	ctx.fill()

	// marks
	ctx.beginPath()
	ctx.lineWidth	= 0.9
	ctx.strokeStyle = '#000'
	ctx.strokeLine(-3.9, 1.9, -3.8,0.8)
	ctx.moveTo(-3.2, -1.1)
	ctx.quadraticCurveTo(-3.0,-3.7,-1.7,-3.7)
	ctx.stroke()
	ctx.strokeLine(-0.5,-5.2, 0.5,-5.2)

	// bell bottom
	ctx.beginPath()
	ctx.ellipse(0, 5.2, 4.8, 1, 0, 0, PI*2)
	ctx.fillStyle = '#53A8FB'
	ctx.fill()
	ctx.fillCircle(1.3, 5.5, 1.3, '#FFF')
}
function key(ctx=Ctx) {
	// key metal
	ctx.newLinePath([-1,-1.5],[-1.0, 5.5],[0,6.5],[1,5.5],[1,2.8])
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
	ctx.save()
	ctx.globalCompositeOperation = 'destination-out'
	ctx.strokeLine(-1.2, -4.5, +1.2, -4.5)
	ctx.restore()
}
const Fns = freeze([cherry,strawberry,orange,apple,melon,gala,bell,key])

export function draw(ctx=Ctx, idx=0, x=T,y=T, scale=T/8) {
	const ratio = 1.05
	ctx.save()
	ctx.lineWidth = 1
	ctx.lineCap = ctx.lineJoin = 'round'
	ctx.translate(x, y)
	ctx.scale(scale*ratio, scale*ratio)
	Fns[idx](ctx)
	ctx.restore()
}
export const [cachedCvs,cache]= function() {
	const {cvs,ctx}= canvas2D(null,T*2)
	/** @param {number} fruitIdx */
	function cache(fruitIdx) {
		ctx.clear()
		draw(ctx, fruitIdx)
	}
	return [cvs,cache]
}()
{ // Create a sprite sheet for menu icons
	const Menu = $byId('LevelMenu')
	const size = +Menu.css('--scale') * T
	const {ctx}= canvas2D(null, size*8, size)
	for (const i of Fns.keys())
		draw(ctx, i, size/2+size*i, size/2, size/16)
	Menu.css('--url',`url(${ctx.canvas.toDataURL()})`)
}