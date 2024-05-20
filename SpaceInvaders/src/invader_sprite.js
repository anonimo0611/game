const dirs = [-1, 1];

function drawOctpus(ctx, a, {Width,Height,Color}) {	
	ctx.save();
	ctx.strokeStyle = Color;
	ctx.fillStyle   = Color;
	ctx.lineCap     = 'round';
	ctx.lineWidth   = .08;
	ctx.translate(Width/2,Height/2);
	ctx.scale(Width,Height);

	// Arms
	if (a < 0)
		for (const d of dirs) {
			ctx.beginPath();
				ctx.moveTo(-.2*d, -.1);
				ctx.quadraticCurveTo(-.2*d, .4, -.4*d, .4);
			ctx.stroke();
			ctx.beginPath();
				ctx.moveTo(0, -.1);
				ctx.quadraticCurveTo(-.1*d, .4, -.2*d, .4);
			ctx.stroke();
		}
	else
		for (const d of dirs) {
			ctx.beginPath();
				ctx.moveTo(-.2*d, -.1);
				ctx.quadraticCurveTo(-.3*d, .2, -.2*d, .4);
			ctx.stroke();
			ctx.beginPath();
				ctx.moveTo(-.25*d, -.1);
				ctx.quadraticCurveTo(.05*d, .4, -.1*d, .4);
			ctx.stroke();
		}

	// Body
	ctx.beginPath();
		ctx.arc(0,.1, .48, 0, PI, true);
		ctx.moveTo(-.48, .05);
		ctx.quadraticCurveTo(0, .35, .48, .05);
	ctx.closePath();
	ctx.fill();

	// Eyes
	for (const d of dirs) {
		const [w, h] = [.24, .15];
		ctx.save();
		ctx.scale(d, 1);
		ctx.translate(-w/2,-h/2);
		ctx.rotate(PI/6);
		ctx.fillStyle = 'black';
		ctx.fillRect(-.22,.05, w,h);
		ctx.restore();
	}

	ctx.restore();
}
function drawCrab(ctx, a, {Width,Height,Color}) {
	ctx.save();
	ctx.strokeStyle = Color;
	ctx.fillStyle   = Color;
	ctx.lineCap     = 'round';
	ctx.lineWidth   = .09;
	ctx.translate(Width/2,Height/2);
	ctx.scale(Width,Height);

	// Antennae
	for (const d of dirs) {
		ctx.save();
		ctx.lineWidth = .08;
		ctx.beginPath();
			ctx.moveTo(.2*d, -.3);
			ctx.quadraticCurveTo(.2*d, -.4, .3*d, -.48);
		ctx.stroke();
		ctx.restore();
	}
	// Claws
	for (const d of dirs) {
		ctx.save();
		ctx.lineWidth = .1;
		ctx.beginPath();
			ctx.moveTo(.4*d, 0);
			ctx.quadraticCurveTo(.45*d, 0, .48*d, -.39*a);
		ctx.stroke();
		ctx.restore();
	}
	// Legs
	if (a < 0)
		for (const d of dirs) {
			ctx.beginPath();
				ctx.moveTo(.3*d, 0);
				ctx.quadraticCurveTo(.2*d, .4, .1*d, .48);
			ctx.stroke();
		}
	else
		for (const d of dirs) {
			ctx.beginPath();
				ctx.moveTo(.3*d, 0);
				ctx.quadraticCurveTo(.2*d, .4, .4*d, .48);
			ctx.stroke();
		}

	// Body
	ctx.beginPath();
	roundedPoly(ctx, [
	    [-.30, -.29],
	    [+.30, -.29],
	    [+.49, +.23],
	    [-.49, +.23]], .2);
	ctx.fill();

	// Eyes
	for (const d of dirs) {
		const [w, h] = [.18, .1];
		ctx.save();
		ctx.scale(d, 1);
		ctx.translate(-w/2,-h/2);
		ctx.rotate(PI/4);
		ctx.fillStyle = 'black';
		ctx.fillRect(-.14,.1, w,h);
		ctx.restore();
	}

	ctx.restore();
}
function drawSquid(ctx, a, {Width,Height,Color}) {
	ctx.save();
	ctx.strokeStyle = Color;
	ctx.fillStyle   = Color;
	ctx.lineCap     = 'round';
	ctx.lineWidth   = .08;
	ctx.translate(Width/2,Height/2);
	ctx.scale(Width,Height);

	// Arms
	if (a < 0)
		for (const d of dirs) {
			ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.quadraticCurveTo(.3*d, .4, .5*d, .4);
			ctx.stroke();
			ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.quadraticCurveTo(-.1*d, .4, -.2*d, .4);
			ctx.stroke();
		}
	else
		for (const d of dirs) {
			ctx.beginPath();
				ctx.moveTo(.05*d, 0);
				ctx.quadraticCurveTo(.4*d, .1, .2*d, .4);
			ctx.stroke();
			ctx.beginPath();
				ctx.moveTo(-.25*d, 0);
				ctx.quadraticCurveTo(.05*d, .4, -.1*d, .4);
			ctx.stroke();
		}

	// Body
	ctx.beginPath();
	roundedPoly(ctx, [
	    [   0, -.47],
	    [-.45, +.03],
	    [-.10, +.15],
	    [+.10, +.15],
	    [+.45, +.03]], .06);
	ctx.fill();

	// Eyes
	for (const d of dirs) {
		const [w, h] = [.2, .075];
		ctx.save();
		ctx.scale(d, 1);
		ctx.translate(-w/2,-h/2);
		ctx.rotate(PI/6);
		ctx.fillStyle = 'black';
		ctx.fillRect(-.13,0, w,h);
		ctx.restore();
	}
	
	ctx.restore();
}
function drawUfo(ctx, a, {Width:w,Height:h,Color}) {
	ctx.save();
	ctx.translate(w/2,h/2);
	{// Hull
		ctx.save();
		ctx.scale(w,h);
		ctx.beginPath();
			ctx.moveTo(-.48,.10);
			ctx.quadraticCurveTo(0, -1.2, .48, .1);
			ctx.lineTo(+.50,.20);
			ctx.lineTo(+.42,.25);
			ctx.quadraticCurveTo(.30, .7, .18, .25);
			ctx.lineTo(+.13,.25);
			ctx.lineTo(+.03,.40);
			ctx.lineTo(-.03,.40);
			ctx.lineTo(-.13,.25);
			ctx.lineTo(-.18,.25);
			ctx.quadraticCurveTo(-.30, .7, -.42, .25);
			ctx.lineTo(-.50,.20);
		ctx.closePath();
		ctx.fillStyle = Color;
		ctx.fill();
		ctx.restore();
	}
	{// Windows
		const size = .15;
		ctx.save();
		ctx.scale(h,h);
		ctx.translate(-size/2,-size/2);
		ctx.fillStyle = 'black';
		ctx.fillRect(-.68, -.03, size, size);
		ctx.fillRect(-.22, +.05, size, size);
		ctx.fillRect(+.22, +.05, size, size);
		ctx.fillRect(+.68, -.03, size, size);
		ctx.restore();
	}
	ctx.restore();
}
const InvaderType   = freeze({Octpus:0, Crab:1, Squid:2, Ufo:3, Max:4});
const functions     = [drawOctpus,drawCrab,drawSquid,drawUfo];
const Canvases      = Array(InvaderType.Max).fill().map(_=> Array(2).fill());
const InvaderColors = Array(InvaderType.Max).fill('#FFFFFF');
function setup(...Classes) {
	for (const cls of Classes) {
		const type = InvaderType[cls.name];
		const {Width,Height,Color}= new cls;
		InvaderColors[type] = Color;
		for (const cvsIdx of Canvases[type].keys()) {
			const cvs  = document.createElement('canvas');
			const ctx  = cvs.getContext('2d');
			cvs.width  = Width;
			cvs.height = Height;
			functions[type](ctx, dirs[cvsIdx], {Width,Height,Color});
			Canvases[type][cvsIdx] = cvs;
		}
	}
	freeze(InvaderColors);
}
export {InvaderType,InvaderColors,setup};
export function draw(ctx, type, i=0) {
	ctx.drawImage(Canvases[type][i], 0,0);
}
export function getSize(type) {
	const {width,height}= Canvases[type][0];
	return {x:width,y:height};
}