import {Ctx} from './_canvas.js'
function cherry(ctx=Ctx) {
	function fruit(x,y, idx) {
		ctx.save()
		ctx.translate(x,y)

		// red fruit
		cvsFillCircle(ctx)(2.5, 2.5, 3, '#F00')
		ctx.save()
 		ctx.globalCompositeOperation = 'destination-out'
		ctx.beginPath()
	  	ctx.arc(2.5, 2.5, 3, (idx? 0 : PI/4), PI*2)
		ctx.lineWidth = 0.5
		ctx.stroke()
		ctx.restore()

		// white shine
		ctx.lineCap = 'round'
		ctx.beginPath()
		ctx.moveTo(1.1, 2.9)
		ctx.lineTo(2.1, 3.9)
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
	ctx.bezierCurveTo(3,-4, 1,0, 1,2)
	ctx.strokeStyle = '#F90'
	ctx.lineCap = ctx.lineJoin ='round'
	ctx.stroke()
}

function strawberry(ctx=Ctx) {
	ctx.lineCap = ctx.lineJoin = 'round'
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
	ctx.fillStyle = '#FFF'
	;[[-4,-1],[-3,2],[-2, 0],[-1,4],[0, 2],
	  [ 0, 0],[ 2,4],[ 2,-1],[ 3,1],[4,-2],
	].forEach(s=> cvsFillCircle(ctx)(...s, .55, 0,PI*2))

	// green leaf
	cvsSetNewLinePath(ctx)(
	[0,-4],[-3,-4],[0,-4],[-2,-3],[-1,-3],[0,-4],
 	[0,-2],[ 0,-4],[1,-3],[ 2,-3],[ 0,-4],[3,-4])
	ctx.closePath()
	ctx.strokeStyle = '#0F0'
	ctx.stroke()

	// stem
	ctx.beginPath()
	ctx.moveTo(0,-4)
	ctx.lineTo(0,-5)
	ctx.strokeStyle = '#FFF'
	ctx.stroke()
}

function orange(ctx=Ctx) {
	ctx.lineCap = ctx.lineJoin = 'round'
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
	ctx.lineCap = 'round'
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
	ctx.quadraticCurveTo(0, -4, 0, -3)
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
	cvsFillCircle(ctx)(0, 2, 5.3, '#7BF331')
	ctx.lineCap = ctx.lineJoin = 'round'

	// draw stem
	ctx.beginPath()
	ctx.moveTo(0, -3)
	ctx.lineTo(0, -5)
	ctx.moveTo(2, -5)
	ctx.quadraticCurveTo(-3, -5, -3, -6)
	ctx.strokeStyle = '#69B4AF'
	ctx.stroke()

	// dark lines
	ctx.beginPath()
	cvsSetLinePath(ctx)([.5,-2],[-4, 2],[0, 6])
	cvsSetLinePath(ctx)([-3,-1],[-1, 1])
	cvsSetLinePath(ctx)([-2, 6],[ 2, 2])
	cvsSetLinePath(ctx)([ 1, 7],[ 3, 5],[0, 2],[3,-1])
	cvsSetLinePath(ctx)([ 1,-1],[ 4, 2])
	ctx.lineWidth = 0.3
	ctx.strokeStyle = '#5B8F8C'
	ctx.stroke()

	// white spots
	ctx.fillStyle = '#FFF'
	;[[ 0.0,-2.3],[-2,-1.2],[-4, 0.8],[-3.6, 3.2],[1, 0],
	  [-1.3, 2.0],[-1, 4.5],[ 3, 2.5],[ 1.0, 4.5]
	].forEach(s=> cvsFillCircle(ctx)(...s, 0.5))
}

function bossGalaxian(ctx=Ctx) {
	// yellow body
	cvsSetNewLinePath(ctx,'#F8FF00')([0.0,-2.6],
	[ 4.9,-2.4],[ 4.6,-0.5],[ 2.0, 1.6],[ 1.1, 0.5],
	[-1.1, 0.5],[-2.0, 1.6],[-4.6,-0.5],[-4.8,-2.4])
	ctx.lineWidth   = 1.2
	ctx.lineCap     = 'round'
	ctx.strokeStyle = '#F8FF00'
	cvsStrokeLine(ctx)(0, 0.28, 0, 6)

	// red arrow head
	ctx.beginPath()
	cvsSetLinePath(ctx)([0,-5.2],[3.8,-2.2],[3.0,-1.2],[1.3,-2.3])
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

	// blue wings
	const wingPath = [[5,-4.8],[6,-4.5],[6,.6],[1.6,4],[1.6,2],[4.6,-.6]]
	cvsSetNewLinePath(ctx,'#0AF')(...wingPath)
	cvsSetNewLinePath(ctx,'#0AF')(...wingPath.map(([x,y])=>([-x,y])))
}

function bell(ctx=Ctx) {
	// bell body
	ctx.beginPath()
	cvsSetLinePath(ctx)([0.0, -6.3],[1.3, -6.3],[1.3, -6.0])
	ctx.quadraticCurveTo(5.0, -5.0, 5.5, 1.6)
	cvsSetLineTo(ctx)(
	[+6.1, 2.2],[+6.1, 4.7],[ 5.4, 5.3],
	[-5.4, 5.3],[-6.1, 4.7],[-6.1, 2.2],[-5.5, 1.6])
	ctx.quadraticCurveTo(-5.0, -5.0, -1.3, -6.0)
	ctx.lineTo(-1.3, -6.3)
	ctx.fillStyle = '#F8FF00'
	ctx.fill()

	// marks
	ctx.beginPath()
	ctx.lineCap 	= 'round'
	ctx.lineWidth	= 0.9
	ctx.strokeStyle = '#000'
	ctx.moveTo(-3.9,  1.9)
	ctx.lineTo(-3.8,  0.8)
	ctx.moveTo(-3.2, -1.1)
	ctx.quadraticCurveTo(-3.0, -3.7, -1.7, -3.7)
	ctx.stroke()
	ctx.moveTo(-0.5, -5.2)
	ctx.lineTo(+0.5, -5.2)
	ctx.stroke()

	// bell bottom
	ctx.beginPath()
	ctx.ellipse(0, 5.2, 4.8, 1, 0, 0, PI*2)
	ctx.fillStyle = '#53A8FB'
	ctx.fill()
	cvsFillCircle(ctx)(1.3, 5.5, 1.3, '#FFF')
}

function key(ctx=Ctx) {
	ctx.lineWidth   = 1
	ctx.lineJoin    = 'round'
	ctx.strokeStyle = '#FFF'
	// key metal
	ctx.beginPath()
	cvsSetLinePath(ctx)([-1, -1.5],[-1.0,+5.5],[0,6.5],[1,5.5],[1,2.8])
	cvsSetLinePath(ctx)([+1, +1.8],[+1.0,-1.5])
	cvsSetLinePath(ctx)([+1, +0.6],[+2.9,+0.6])
	cvsSetLinePath(ctx)([+1, +3.9],[+2.9,+3.9])
	ctx.stroke()

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
	ctx.lineCap = 'round'
	ctx.globalCompositeOperation = 'destination-out'
	cvsStrokeLine(ctx)(-1.2, -4.5, +1.2, -4.5)
	ctx.restore()
}

const functions = freeze([
	cherry,strawberry,orange,apple,melon,bossGalaxian,bell,key
])
{ // Create a sprite sheet
	const T = parseInt($('#LevelMenu').css('--t'))
	const {cvs,ctx}=canvas2D(null, T*8, T)
	functions.forEach((fn,i)=> {
		ctx.save()
		ctx.translate(T/2+T*i, T/2)
		ctx.scale(T/16*1.05, T/16*1.05)
		fn(ctx)
		ctx.restore()
	})
	$('#LevelMenu').css('--url',`url(${cvs.toDataURL()})`)
}
export default functions