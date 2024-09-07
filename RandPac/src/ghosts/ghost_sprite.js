import {Glow}    from './glow.js';
import {Ghost}   from './ghost.js';
import {Ctx}     from '../_main.js';
import {U,R,D,L} from '../_lib/direction.js';

const PupilsColor       = '#33F';
const FrightBodyColors  = ['#36A','#FFF'];
const FrightFaceColors  = ['#F9F','#F00'];
const EyesIdxFromDirMap = new Map([[U,0],[D,1],[L,2],[R,2]]);

export class Sprite {
	#fadeOut   = null;
	#resurrect = null;
	get fadeOut()  {return this.#fadeOut}
	setFadeOut()   {this.#fadeOut ||= new FadeOut(400)}
	setResurrect() {this.#resurrect = new FadeIn (600)}

	draw({cvs,ctx,idx=0,x=0,y=0,Color='#E00',orient=L,
		angry=false,frightened=false,escaping=false,isInHouse=false}={})
	{
		ctx.clear();
		ctx.save();
		ctx.translate(A/2, A/2);
		ctx.scale(A/106, A/105);
		ctx.fillStyle = !frightened
			? Color
			: FrightBodyColors[Ghost.spriteIdx];

		if (!escaping) {
			ctx.save();
			this.#resurrect?.update(ctx);
			this.#angryGlow(x, y, angry);
			this.#body(ctx);
			frightened && this.#frightFace(ctx);
			ctx.restore();
		}
		!frightened &&
			[this.#eyesUp, this.#eyesDown, this.#eyesLR]
				[EyesIdxFromDirMap.get(orient)](ctx, orient);

		ctx.restore();

		// Draw on main canvas
		Ctx.translate(x+T/2, y+T/2);
		Ctx.drawImage(cvs, -A/2, -A/2);
	}
	#body(ctx) {
		ctx.beginPath();
		ctx.moveTo(+42, +26);
		ctx.lineTo(+42, +11);
		ctx.bezierCurveTo(+42,-60, -42,-60, -42,11);
		ctx.lineTo(-42, +26);
		Ghost.aIdx == 0
			? this.#feet0(ctx)
			: this.#feet1(ctx);
		ctx.fill();
	}
	#feet0(ctx) {
		ctx.lineTo(-42, 41);
		ctx.lineTo(-29, 27);
		ctx.quadraticCurveTo(-16, 41, -9, 42);
		ctx.arcTo( -9, 26, -6, 26, 4);
		ctx.arcTo( +9, 26, +9, 31, 4);
		ctx.lineTo(+9, 42);
		ctx.quadraticCurveTo(+16, 41, 29, 27);
		ctx.lineTo(+42, 41);
	}
	#feet1(ctx) {
		ctx.lineTo(-42, 36);
		ctx.bezierCurveTo(-41, 45, -29, 45, -26, 38);
		ctx.bezierCurveTo(-22, 28, -13, 27,  -9, 35);
		ctx.bezierCurveTo( -5, 45,  +5, 45,  +9, 35);
		ctx.bezierCurveTo(+13, 28, +22, 27, +26, 38);
		ctx.bezierCurveTo(+29, 45, +41, 45, +42, 26);
	}
	#eyesUp(ctx) {
		for (let i=0; i<2; i++) {
			ctx.beginPath(); // Eyeball
				ctx.fillStyle = '#FFF';
				ctx.ellipse(19.5*[-1,1][i], -17, 13,17,
					[8,-8][i]*PI/180, -3*PI/4, -PI/4, true);
			ctx.fill();
			ctx.beginPath(); // Pupil
				ctx.fillStyle = PupilsColor;
				ctx.arc(18.5*[-1,1][i], -26, 8.5, 0, PI*2);
			ctx.fill();
		}
	}
	#eyesDown(ctx) {
		for (let i=0; i<2; i++) {
			const x = 19 * [-1,1][i];
			ctx.beginPath(); // Eyeball
				ctx.fillStyle = '#FFF';
				ctx.ellipse(x, -3, 13,17,  0,  40*PI/180, 140*PI/180, true);
			ctx.fill();
			ctx.beginPath(); // Pupil
				ctx.fillStyle = PupilsColor;
				ctx.arc(x, 4, 8.5, 0, PI*2);
			ctx.fill();
		}
	}
	#eyesLR(ctx, dir) {
		ctx.save();
		ctx.scale(dir == L ? -1 : 1, 1);
		for (let i=0; i<2; i++) {
			ctx.beginPath(); // Eyeball
				ctx.fillStyle = '#FFF';
				ctx.ellipse([-16.5, 23][i], -11, 13,17, 0,0, PI*2);
			ctx.fill();
			ctx.beginPath(); // Pupil
				ctx.fillStyle = PupilsColor;
				ctx.arc([-9.5, 29][i], -8, 8.5, 0, PI*2);
			ctx.fill();
		}
		ctx.restore();
	}
	#frightFace(ctx) {
		ctx.fillStyle = ctx.strokeStyle =
			FrightFaceColors[Ghost.spriteIdx];

		// Eyes
		const eyeS = 11;
		ctx.fillRect(-15-eyeS/2, -11-eyeS/2, eyeS, eyeS);
		ctx.fillRect(+15-eyeS/2, -11-eyeS/2, eyeS, eyeS);

		// Mouth
		const mouthPath = [
			[-39,18],[-30,10],[-24,10],[-15,18],[-11,18],[-3,10],[-2,10],
			[ +3,10],[+11,18],[+15,18],[+24,10],[+30,10],[39,18]
		];
		ctx.beginPath();
			ctx.lineWidth = 5;
			ctx.moveTo(...mouthPath[0]);
			mouthPath.slice(1).forEach(p=> ctx.lineTo(...p));
		ctx.stroke();
	}
	#angryGlow(x, y, angry) {
		if (!angry) return;
		const W = Glow.cvs.width, S = W*1.2;
		Ctx.save();
		Ctx.globalAlpha = this.#resurrect?.alpha;
		Ctx.translate(x+T/2, y+T/2);
		Ctx.drawImage(Glow.cvs, 0,0, W,W, -S/2,-S/2, S,S);
		Ctx.restore();
	}
}