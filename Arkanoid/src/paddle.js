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
import {Item}      from './item.js';
import {Mouse}     from './mouse.js';

const Width  = cvs.width / 5;
const Height = BrickG.RowHeight;

const StretchMax = Width * 1.5;
const StretchSpd = (StretchMax-Width)/(300/Ticker.Interval);
const FadeSpeed  = 500 / Ticker.Interval;

const SparkColor  = rgba(0,255,255, 0.7);
const ShadowColor = rgba(0,  0,  0, 0.4);

const [$cvs,$ctx] = canvas2D(null, Width*1.5, Height*1.5).vals;

const BodyGrad = lineGradHSL(0, 0, 46);
const LineGrad = new Map()
	.set(undefined,      lineGradHSL( 15, 100, 40))
	.set(ItemType.Catch, lineGradHSL( 33, 240, 29))
	.set(ItemType.Laser, lineGradHSL(240,  33, 29))
;
const SphereGrad = new Map()
	.set(undefined,      _=> sphereGradHSL(210, 100, 38))
	.set(ItemType.Catch, _=> sphereGradHSL(120, 100, 29))
	.set(ItemType.Laser, _=> sphereGradHSL(  0, 100, 29))
;
function lineGradHSL(h=0,s=0,l=100) {
	const 
	gr = $ctx.createLinearGradient(Width,0,Width,Height);
	gr.addColorStop(0.0, hsl(h,s,l));
	gr.addColorStop(0.3, hsl(h,s,90));
	gr.addColorStop(0.4, hsl(h,s,l));
	gr.addColorStop(1.0, hsl(h,s,l*1.1));
	return gr;
}
function sphereGradHSL(h=0,s=0,l=100) {
	const radius = Height/2;
	const lightness = max(abs(sin(Paddle.blink))*(l*1.4), l);
	return [0,1].map((_,i)=> { // Both sides
		const sx = (!i ? radius : -radius) / 4;
		const
		gr = $ctx.createRadialGradient(sx,-radius/2,0, 0,0,radius);
		gr.addColorStop(0.0, hsl(h,s,90));
		gr.addColorStop(0.5, hsl(h,s,lightness));
		gr.addColorStop(1.0, hsl(h,s,lightness));
		return gr;
	});
}

export const Paddle = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Dropped: Paddle.#onDropped,
			GotItem: Paddle.#onPowerUp,
			Resume:  Paddle.#onResume,
		});
		$on({mousedown: Paddle.#onLaunch});
		$on({mousedown: Paddle.#onRelease});
	}
	#alpha    = 0;
	#blink    = 0;
	#demoRad  = 0;
	#CatchX   = 0;
	#ExclItem = null;
	#Launched = false;
	#Width    = Width;
	#TargetW  = Width;
	DefaultW  = Width;
	Height    = Height;
	Pos = vec2(0, cvs.height-this.Height*3.2);

	get alpha()    {return this.#alpha}
	get blink()    {return this.#blink}
	get Launched() {return this.#Launched}
	get Width()    {return this.#Width}
	get CatchX()   {return this.#CatchX}
	get CenterX()  {return this.Pos.x+this.Width/2}
	get ClampedX() {return clamp(this.Pos.x, this.MoveMin, this.MoveMax)}
	get MoveMin()  {return Field.Left}
	get MoveMax()  {return Field.Right-this.Width}

	// Exclutive item
	get ExclItem()          {return this.#ExclItem}
	get CatchEnabeld()      {return this.ExclItem == ItemType.Catch}
	get ExpandEnabeld()     {return this.ExclItem == ItemType.Expand}
	get LaserEnabeld()      {return this.ExclItem == ItemType.Laser}
	get DisruptionEnabeld() {return this.ExclItem == ItemType.Disruption}

	#posClamp() {
		Paddle.Pos.x = clamp(Paddle.Pos.x, this.MoveMin, this.MoveMax);
	}

	init() {
		Paddle.#blink    = 0;
		Paddle.#CatchX   = 0;
		Paddle.#alpha    = 0;
		Paddle.#Launched = false;
		if (Game.respawned && Paddle.DisruptionEnabeld) {
			Paddle.#ExclItem = null;
		}
		if (!Game.respawned) {
			Paddle.#Width    = Width;
			Paddle.#TargetW  = Width;
			Paddle.#ExclItem = null;
		}
		Paddle.Pos.x = (cvs.width - Paddle.Width) / 2;
		Paddle.#updateCache(Lives.context, Width);
		Paddle.#updateCache($ctx);
	}
	catch(ball) {
		if (!Paddle.CatchEnabeld || Paddle.CatchX)
			return;
		if (this.Width != this.#TargetW)
			return;
		const {x,y}= Paddle.Pos;
		ball.Pos.x = clamp(ball.Pos.x, x+1, x+Paddle.Width-1);
		ball.Pos.y = y - ball.Radius-1; 
		Paddle.#CatchX = ball.Pos.x - Paddle.Pos.x;
	}
	update() {
		this.#blink += PI/120;
		Paddle.#updateCache($ctx);
		switch (Scene.current) {
			case Scene.Enum.Reset:
			case Scene.Enum.Ready:
				Paddle.#ready();
				break;
			case Scene.Enum.InDemo:
				Paddle.#inDemo();
				return;
			case Scene.Enum.InGame:
				Paddle.#inGame();
				break;
			default:
				Paddle.#destory();
		}
	}
	#ready() {
		if (Ticker.elapsed > Game.ReadyTime - 1000)
			this.#alpha = min(this.#alpha+=1/FadeSpeed, 1);
	}
	#inDemo() {
		if (Ticker.elapsed >= 50)
			Paddle.#Launched ||= true;
		if (Ticker.elapsed < 200)
			return;
		Paddle.#comPlay();
		Paddle.#setWidth();
		Paddle.#posClamp();
	}
	#inGame() {
		if (Ticker.elapsed < 50)
			return;
		if (AutoMoveAtStart.setPosition()) {
			Paddle.Pos.x = Mouse.x - (Paddle.Width/2);
			Paddle.#setWidth();
			Paddle.#posClamp();
			if (Paddle.CatchX > 0)
				BallG.Ball.Pos.x = round(Paddle.ClampedX + Paddle.CatchX);
		}
		if (!Paddle.Launched)
			BallG.Ball.Pos.x = Paddle.CatchX
				? Paddle.ClampedX + Paddle.CatchX
				: Paddle.ClampedX + Paddle.Width/2;
	}
	#destory() {
		if (BallG.count <= 0 && Ticker.count > 8)
			this.#alpha = max(this.#alpha-=1/FadeSpeed, 0);
	}
	#onLaunch(e) {
		if (!Game.acceptEventInGame(e))
			return;
		if (!AutoMoveAtStart.reached || Paddle.Launched)
			return;
		Paddle.#Launched = true;
		Sound.play('se0');
	}
	#onRelease(e) {
		if (!Game.acceptEventInGame(e) || !Paddle.CatchX)
			return;
		Sound.play('se0');
		Paddle.#CatchX = 0;
	}
	#onResume() {
		Paddle.CatchX && (Paddle.#Launched = false);
	}
	#onPowerUp(_, type) {
		switch (type) {
		case ItemType.Extend:
			if (Scene.isInGame)
				$trigger('Extend');
			break;
		case ItemType.Catch:
		case ItemType.Disruption:
		case ItemType.Expand:
		case ItemType.Laser:
			Paddle.#ExclItem = type;
			Paddle.#TargetW  = type == ItemType.Expand ? StretchMax : Width;
			Paddle.#updateCache($ctx);
			break;
		}
		if (ExclTypes.includes(type))
			Paddle.#CatchX = 0;
	}
	#onDropped() {
		Paddle.#updateCache($ctx);
		Sound.play('destroy');
	}
	#comPlay() {
		const a = Paddle.#demoRad += PI/94 + randFloat(-0.01, +0.01);
		const x = BallG.NearlyBall.Pos.x * (sin(a)/10+1);
		const m = BallG.NearlyBall.Velocity.magnitude;
		if (Paddle.#comGoForItem(Item.Current)) return;
		for (let i=0; i<45; i++) {
			if (x < Paddle.CenterX) Paddle.Pos.x -= m/45;
			if (x > Paddle.CenterX) Paddle.Pos.x += m/45;
		}
	}
	#comGoForItem(item) {
		if (!item || BallG.NearlyBall.Velocity.y > 0) return false;
		if (Paddle.LaserEnabeld && item.Type == ItemType.Expand) return false;
		for (let i=0; i<45; i++) {
			if (item.CenterX < Paddle.CenterX) Paddle.Pos.x -= 15/45;
			if (item.CenterX > Paddle.CenterX) Paddle.Pos.x += 15/45;
		}
		return true;
	}
	#setWidth() {
		if (this.#TargetW > this.#Width) {
			this.#Width = min(this.#Width+StretchSpd, this.#TargetW);
			Paddle.#updateCache($ctx);
		}
		if (this.#TargetW < this.#Width) {
			this.#Width = max(this.#Width-StretchSpd, Width);
			Paddle.#updateCache($ctx);
		}
	}
	#getPaddleType(ctx) {
		if (ctx != $ctx)
			return;
		switch (Paddle.ExclItem) {
		case ItemType.Catch:
		case ItemType.Laser:
			return Paddle.ExclItem;
		}
	}
	#updateCache(ctx, w=Paddle.Width) {
		ctx.clear();
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
				ctx.fillStyle = shadowColor ?? SphereGrad.get(type)()[i];
				ctx.arc(0,0, r, PI/2,-PI/2, !!i);
				ctx.lineTo((!i ? r-4 : -r+4), -r);
				ctx.lineTo((!i ? r-4 : -r+4), +r);
			ctx.fill();
			ctx.restore();
		}
		// Both side vertical lines
		ctx.fillStyle = shadowColor ?? LineGrad.get(type);
		for (let i=0; i<2; i++)
			ctx.fillRect(!i ? (r*2 - 4) : (w - r*2), 0, 4, h);

		// Horizontal bar
		ctx.fillStyle = shadowColor ?? BodyGrad;
		ctx.fillRect(r*2, 0, w-r*4, h);

		ctx.restore();
	}
	draw() {
		const {x, y}= Paddle.Pos;
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(round(x), round(y));
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
		spark();
	}
});

const AutoMoveAtStart = freeze(new class {
	static {
		$on('InGame Resume', _=> AutoMoveAtStart.#reached = false);
	}
	MoveSpeed = 20;
	#reached  = false;
	get reached() {
		return this.#reached;
	}
	setPosition() {
		if (this.reached) return true;
		for (let i=0, stepMax=50; i<stepMax; i++) {
			const {MoveMin,MoveMax,Pos}= Paddle;
			if (Paddle.CenterX > Mouse.x) {
				Pos.x = max(Pos.x-this.MoveSpeed/stepMax, MoveMin);
				if (Paddle.CenterX < Mouse.x || Pos.x == MoveMin)
					return this.#reached = true;
			} else {
				Pos.x = min(Pos.x+this.MoveSpeed/stepMax, MoveMax);
				if (Paddle.CenterX > Mouse.x || Pos.x == MoveMax)
					return this.#reached = true;
			}
		} return this.reached;
	}
});

function spark() {
	if (Confirm.opened || !Game.isReadyScene)
		return;
	if (Paddle.alpha == 0 || Paddle.alpha == 1)
		return;

	for (let i=0; i<=15; i++) {
		const {Width,Height,Pos}= Paddle;
		const stPos = [randInt(0, Width),randInt(0, Height*1.1)];
		const edVec = stPos.map(c=> c+randChoice(-15,+15));
		ctx.save();
		ctx.translate(...Pos.vals);
		ctx.beginPath();
			ctx.lineWidth   = cvs.width / 230;
			ctx.strokeStyle = SparkColor;
			ctx.moveTo(...stPos);
			ctx.lineTo(...edVec);
		ctx.stroke();
		ctx.restore();
	}
}