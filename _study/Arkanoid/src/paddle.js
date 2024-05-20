import {Sound}     from '../snd/sound.js';
import {Ticker}    from '../lib/timer.js';
import {Confirm}   from '../lib/confirm.js';
import {hsl,rgba}  from '../lib/color.js';
import {cvs,ctx}   from './_canvas.js';
import {Game}      from './_main.js';
import {Field}     from './field.js';
import {Scene}     from './scene.js';
import {Lives}     from './lives.js';
import {ItemType}  from './item.js';
import {ExclTypes} from './item.js';
import {BrickG}    from './brick.js';
import {BallG}     from './ball.js';
import {Mouse}     from './mouse.js';

const cvsForPaddle = document.createElement('canvas');
const ctxForPaddle = cvsForPaddle.getContext('2d');
const Width        = cvs.width / 5;
const Height       = BrickG.RowHeight;
const StretchSpeed = 4;
const SparkColor   = rgba(0,255,255, .7);
const ShadowColor  = rgba(0,  0,  0, .4);
const FadeSpeed    = 500 / Ticker.Interval;

const BodyGrad = lineGradHSL(0,0,46);
const LineGrad = new Map()
	.set(undefined,      lineGradHSL( 15,100,40))
	.set(ItemType.Catch, lineGradHSL( 33,240,29))
	.set(ItemType.Laser, lineGradHSL(240, 33,29))
;
const SphereGrad = new Map()
	.set(undefined,      _=> sphereGradHSL(210,100,38))
	.set(ItemType.Catch, _=> sphereGradHSL(120,100,29))
	.set(ItemType.Laser, _=> sphereGradHSL(  0,100,29))
;
export const Paddle = freeze(new class {
	static {
		$on('load', _=> Paddle.#setup());
	}
	#setup() {
		$on('Dropped',  Paddle.#onDropped);
		$on('GotItem',  Paddle.#onPowerUp);
		$on('mousedown',Paddle.#onLaunch);
		$on('mousedown',Paddle.#onRelease);
	}
	#alpha    = 0;
	#blink    = 0;
	#catchX   = 0;
	#demoRad  = 0;
	#width    = Width;
	#targetW  = Width;
	DefaultW  = Width;
	Height    = Height;
	#exclItem = null;
	#launched = false;
	Pos = vec2(0, cvs.height-this.Height*3.2);

	get alpha()    {return this.#alpha}
	get blink()    {return this.#blink}
	get Width()    {return this.#width}
	get catchX()   {return this.#catchX}
	get launched() {return this.#launched}
	get centerX()  {return this.Pos.x+this.Width/2}
	get clampedX() {return clamp(this.Pos.x, this.movMin, this.movMax)}
	get movMin()   {return Field.Left}
	get movMax()   {return Field.Right-this.Width}

	// Exclutive item
	get exclItem()          {return this.#exclItem}
	get catchEnabeld()      {return this.exclItem == ItemType.Catch}
	get expandEnabeld()     {return this.exclItem == ItemType.Expand}
	get laserEnabeld()      {return this.exclItem == ItemType.Laser}
	get disruptionEnabeld() {return this.exclItem == ItemType.Disruption}

	init() {
		Paddle.#blink    = 0;
		Paddle.#catchX   = 0;
		Paddle.#alpha    = 0;
		Paddle.#launched = false;
		if (Scene.isInDemo) {
			Paddle.#launched = true;
		}
		if (Game.respawned && Paddle.disruptionEnabeld) {
			Paddle.#exclItem = null;
		}
		if (!Game.respawned) {
			Paddle.#width    = Width;
			Paddle.#targetW  = Width;
			Paddle.#exclItem = null;
		}
		Paddle.Pos.x = (cvs.width - Paddle.Width) / 2;
		Paddle.#updateCache(Lives.context, Width);
		Paddle.#updateCache(ctxForPaddle);
	}
	update() {
		if (BallG.count <= 0 && Ticker.count > 8)
			this.#alpha = max(this.#alpha-=1/FadeSpeed, 0);
		else if (Ticker.elapsed > Game.ReadyTime - 1000)
			this.#alpha = min(this.#alpha+=1/FadeSpeed, 1);

		if (Ticker.count % 5 == 0) {
			this.#blink += 1/4;
			Paddle.#updateCache(ctxForPaddle);
		}
		if (Scene.isInDemo) {
			Paddle.#demo();
			return;
		}
		if (!Scene.isInGame)
			return;

		if (AutoMoveAtStart.setPosition()) {
			const x = Mouse.x - (Paddle.Width/2);
			Paddle.#setWidth();
			Paddle.Pos.x = clamp(x, this.movMin, this.movMax);
			if (Paddle.catchX > 0)
				BallG.ball.Pos.x = Paddle.clampedX + Paddle.catchX;
		}
		if (!Paddle.launched)
			BallG.ball.Pos.x = round(Paddle.Pos.x + Paddle.Width/2);
	}
	catch(ball) {
		if (!Paddle.catchEnabeld || Paddle.catchX)
			return;
		const {x,y}= Paddle.Pos;
		ball.Pos.x = clamp(ball.Pos.x, x+1, x+Paddle.Width-1);
		ball.Pos.y = y - ball.Radius-1; 
		Paddle.#catchX = round(ball.Pos.x - Paddle.Pos.x);
	}
	#onLaunch(e) {
		if (!Game.acceptEventInGame(e))
			return;
		if (!AutoMoveAtStart.reached || Paddle.launched)
			return;
		Paddle.#launched = true;
		Sound.play('se0');
	}
	#onRelease(e) {
		if (!Game.acceptEventInGame(e) || !Paddle.catchX)
			return;
		Sound.play('se0');
		Paddle.#catchX = 0;
	}
	#onPowerUp(_, type) {
		switch (type) {
		case ItemType.Extend:
			$trigger('Extend');
			break;
		case ItemType.Catch:
		case ItemType.Disruption:
		case ItemType.Expand:
		case ItemType.Laser:
			Paddle.#exclItem = type;
			Paddle.#targetW  = type == ItemType.Expand ? Width*1.5 : Width;
			Paddle.#updateCache(ctxForPaddle);
		}
		if (ExclTypes.includes(type))
			Paddle.#catchX = 0;
	}
	#onDropped() {
		Paddle.#updateCache(ctxForPaddle);
		Sound.play('destroy');
	}
	#setWidth() {
		if (this.#targetW > this.#width) {
			this.#width = min(this.#width+=StretchSpeed, this.#targetW);
			Paddle.#updateCache(ctxForPaddle);
		}
		if (this.#targetW < this.#width) {
			this.#width = max(this.#width-=StretchSpeed, Width);
			Paddle.#updateCache(ctxForPaddle);
		}
	}
	#demo() {
		const rate = 1+(sin(Paddle.#demoRad+=(PI/94)+randFloat(-.01,.01))/10);
		const x = (BallG.ball.Pos.x - (Paddle.Width/2))*rate;
		Paddle.Pos.x = clamp(x, this.movMin, this.movMax);
	}
	#getPaddleType(ctx) {
		if (ctx != ctxForPaddle)
			return;
		switch (Paddle.exclItem) {
		case ItemType.Catch:
		case ItemType.Laser:
			return Paddle.exclItem;
		}
	}
	#updateCache(ctx, w=Paddle.Width) {
		ctx.clearRect(0,0,cvs.width,cvs.height);
		Paddle.#cache(ctx, w, ShadowColor); // shadow
		Paddle.#cache(ctx, w);
	}
	#cache(ctx, w, shadowColor) {
		const {Height:h}= Paddle, r = Height/2;
		const type = Paddle.#getPaddleType(ctx) ?? undefined;
		ctx.save();
		if (shadowColor)
			ctx.translate(r, r);
		if (BallG.count <= 0)
			ctx.filter = 'grayscale(100%)';

		// Both side spheres
		for (let i=0; i<2; i++) {
			ctx.save();
			ctx.translate((!i ? r*2 - r : w-r*2 + r), r);
			ctx.beginPath();
				ctx.arc(0,0, r, PI/2,-PI/2, !!i);
				ctx.lineTo((!i ? r-4 : -r+4), -r);
				ctx.lineTo((!i ? r-4 : -r+4), +r);
			ctx.fillStyle = shadowColor ?? SphereGrad.get(type)()[i];
			ctx.fill();
			ctx.restore();
		}
		// Both side vertical lines
		ctx.fillStyle = shadowColor ?? LineGrad.get(type);
		for (let i=0; i<2; i++)
			ctx.fillRect(!i ? (r*2 - 4) : (w - r*2), 0, 4, h);

		// Horizontal bar
		ctx.fillStyle = shadowColor ?? BodyGrad;
		ctx.fillRect(r*2, 0, w-(r*4), h);
		ctx.restore();
	}
	draw() {
		const {x, y}= Paddle.Pos;
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(round(x), round(y));
		ctx.drawImage(cvsForPaddle, 0,0);
		ctx.restore();
		spark();
	}
});
const AutoMoveAtStart = freeze(new class {
	static {
		$on('InGame Resume',_=> AutoMoveAtStart.#reached = false);
	}
	MoveSpeed = 10;
	#reached  = false;
	get reached() {
		return this.#reached;
	}
	setPosition() {
		if (this.reached)
			return true;
		for (let i=0; i<30; i++) {
			const {movMin,movMax,Pos}= Paddle;
			if (Paddle.centerX > Mouse.x) {
				Pos.x = max(Pos.x-this.MoveSpeed/30, movMin);
				if (Paddle.centerX < Mouse.x || Pos.x == movMin)
					this.#reached = true;
			} else {
				Pos.x = min(Pos.x+this.MoveSpeed/30, movMax);
				if (Paddle.centerX > Mouse.x || Pos.x == movMax)
					this.#reached = true;
			}
		}
		return this.reached;
	}
});
function lineGradHSL(h=0,s=0,l=100) {
	const gr = ctxForPaddle.createLinearGradient(Width,0,Width,Height);
	gr.addColorStop(0.00, hsl(h,s,l));
	gr.addColorStop(0.30, hsl(h,s,90));
	gr.addColorStop(0.40, hsl(h,s,l));
	gr.addColorStop(1.00, hsl(h,s,l*1.1));
	return gr;
}
function sphereGradHSL(h=0,s=0,l=100) {
	const radius    = Height / 2;
	const lightness = max(abs(sin(Paddle.blink))*(l*1.3), l);
	return [0,1].map((_,i)=> { // Both sides
		const sx = (!i ? radius : -radius) / 4;
		const gr = ctxForPaddle.createRadialGradient(sx,-radius/2,0, 0,0,radius);
		gr.addColorStop(0.00, hsl(h,s,90));
		gr.addColorStop(0.50, hsl(h,s,lightness));
		gr.addColorStop(1.00, hsl(h,s,lightness));
		return gr;
	});
}
function spark() {
	if (Confirm.opened || !Game.isReadyScene)
		return;
	if (Paddle.alpha == 0 || Paddle.alpha == 1)
		return;

	for (let i=0; i<=15; i++) {
		const {Width:w,Height:h,Pos}= Paddle;
		const stPos = [randInt(0, w),randInt(0, h+5)];
		const edVec = stPos.map(c=> c+randChoice([-15, 15]));
		ctx.save();
		ctx.translate(...Pos.vals);
		ctx.beginPath();
			ctx.moveTo(...stPos);
			ctx.lineTo(...edVec);
			ctx.lineWidth = 4;
			ctx.strokeStyle = SparkColor;
		ctx.stroke();
		ctx.restore();
	}
}