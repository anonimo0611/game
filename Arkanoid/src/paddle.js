import {Sound}     from '../snd/sound.js';
import {Ticker}    from '../lib/timer.js';
import {Confirm}   from '../lib/confirm.js';
import {hsl,rgba}  from '../lib/color.js';
import {cvs,ctx}   from './_canvas.js';
import {Game}      from './_main.js';
import {Demo}      from './demo.js';
import {Field}     from './field.js';
import {Scene}     from './scene.js';
import {Lives}     from './lives.js';
import {ItemMgr}   from './item.js';
import {ItemType}  from './item.js';
import {BallMgr}   from './ball.js';
import {BrickMgr}  from './brick.js';
import {Rect}      from './rect.js';
import {MouseX}    from './mouse.js';

const Width  = cvs.width / 5;
const Height = BrickMgr.RowHeight;

const StretchMax   = Width * 1.5;
const StretchSpeed = (StretchMax-Width)/(300/Ticker.Interval);
const FadeDuration = 500 / Ticker.Interval;
const SparkColor   = rgba(0,255,255, 0.7);
const ShadowColor  = rgba(0,  0,  0, 0.4);
const [$cvs,$ctx]  = canvas2D(null, Width*1.5, Height*1.5).vals;

export const Paddle = freeze(new class extends Rect {
	static {$ready(this.#setup)}
	static #setup() {
		$on({Dropped:   Paddle.#onDropped});
		$on({Resume:    Paddle.#onResume});
		$on({mousedown: Paddle.#onLaunch});
		$on({mousedown: Paddle.#onRelease});
		$(Demo)   .on({Release:  Paddle.#onRelease});
		$(BallMgr).on({Cought:   Paddle.#onCatch});
		$(ItemMgr).on({Obtained: Paddle.#onPowerUp});
	}
	#alpha    = 0;
	#blink    = 0;
	#catchX   = 0;
	#exclType = null;
	#launched = false;
	#width    = Width;
	#targetW  = Width;
	InitWidth = Width;
	Height    = Height;

	// Launch angle at the beginning of the stage or at respawn
	LaunchVelocity  = Vec2.fromDegrees(90+25).inverse;

	// Ball rebound angle based on distance from paddle center
	ReboundAngleMax = toRadians(60); // -60 to +60 degrees

	constructor() {
		super(vec2(cvs.width/2, cvs.height - Height*3), Width, Height);
		this.Pos.yFreeze();
	}
	get alpha()    {return this.#alpha}
	get blink()    {return this.#blink}
	get launched() {return this.#launched}
	get Width()    {return this.#width}
	get catchX()   {return this.#catchX}
	get centerX()  {return this.x+this.Width/2}
	get clampedX() {return clamp(this.x, this.MoveMin, this.MoveMax)}
	get MoveMin()  {return Field.Left}
	get MoveMax()  {return Field.Right-this.Width}

	// Exclutive item
	get ExclType()       {return this.#exclType}
	get CatchEnabled()   {return this.ExclType == ItemType.Catch}
	get ExpandEnabled()  {return this.ExclType == ItemType.Expand}
	get LaserEnabled()   {return this.ExclType == ItemType.Laser}
	get DisruptEnabled() {return this.ExclType == ItemType.Disruption}

	get controllable() {
		return Scene.isInGame && this.alpha == 1 && AutoMoveToCursorX.reached;
	}
	get canCatch() {
		if (!this.CatchEnabled || this.catchX)
			return false;
		if (this.Width != this.#targetW)
			return false;
		return true;
	}
	get ReboundVelocity() {
		const {x,centerX:cx,Width:w}= this;
		const ballX = clamp(BallMgr.Ball.x, x, x+w);
		const angle = PI/2 + ((ballX - cx) / w) * this.ReboundAngleMax*2;
		return Vec2.fromRadians(angle).inverse;
	}
	get CaughtBallPos() {
		const x = this.catchX? (this.clampedX+this.catchX) : this.centerX;
		return vec2(x, this.y - BallMgr.Radius);
	}
	init() {
		Paddle.#blink    = 0;
		Paddle.#catchX   = 0;
		Paddle.#alpha    = 0;
		Paddle.#launched = false;
		if (Game.respawned && Paddle.DisruptEnabled) {
			Paddle.#exclType = null;
		}
		if (!Game.respawned) {
			Paddle.#width    = Width;
			Paddle.#targetW  = Width;
			Paddle.#exclType = null;
		}
		Paddle.Pos.x = (cvs.width - Paddle.Width) / 2;
		Paddle.#updateCache(Lives.context, Width);
		Paddle.#updateCache($ctx);
	}
	update() {
		Paddle.#blink += PI/120;
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
			Paddle.#alpha = min(Paddle.#alpha+1/FadeDuration, 1);
	}
	#inDemo() {
		if (Ticker.elapsed >= 50)
			Paddle.#launched ||= true;
		if (Ticker.elapsed < 200)
			return;

		Demo.autoPlay();
		Paddle.#moveCaughtBall();
		Paddle.#setWidth();
		Paddle.#restrictRangeOfMove();
	}
	#inGame() {
		if (Ticker.elapsed < 50)
			return;

		if (AutoMoveToCursorX.setPosition()) {
			Paddle.Pos.x = MouseX - (Paddle.Width/2);
			Paddle.#setWidth();
			Paddle.#restrictRangeOfMove();
			Paddle.#moveCaughtBall();
		}
		if (!Paddle.launched)
			BallMgr.Ball.Pos.x = Paddle.catchX
				? Paddle.clampedX + Paddle.catchX
				: Paddle.clampedX + Paddle.Width/2;
	}
	#restrictRangeOfMove() {
		const {Pos,MoveMin,MoveMax}= Paddle;
		Pos.x = clamp(Pos.x, MoveMin, MoveMax);
	}
	#moveCaughtBall() {
		if (Paddle.catchX > 0)
			BallMgr.Ball.Pos.x = Paddle.CaughtBallPos.x;
	}
	#destory() {
		if (BallMgr.count <= 0 && Ticker.count > 8)
			Paddle.#alpha = max(Paddle.#alpha-1/FadeDuration, 0);
	}
	#onLaunch(e) {
		if (!Game.acceptEventInGame(e))
			return;
		if (!AutoMoveToCursorX.reached || Paddle.launched)
			return;

		Paddle.#launched = true;
		Sound.play('se0');
	}
	#onCatch(_, ball) {
		const {x,y}= Paddle.Pos;
		ball.Pos.x = clamp(ball.x, x+1, x+Paddle.Width-1);
		ball.Pos.y = y - ball.Radius;
		Paddle.#catchX = ball.x - Paddle.x;
	}
	#onRelease(e) {
		if (!Paddle.catchX)
			return;
		if (!Scene.isInDemo && !Game.acceptEventInGame(e))
			return;

		Sound.play('se0');
		Paddle.#catchX = 0;
	}
	#onResume() {
		Paddle.catchX && (Paddle.#launched = false);
	}
	#onPowerUp(_, type) {
		switch (type) {
		case ItemType.Catch:
		case ItemType.Disruption:
		case ItemType.Expand:
		case ItemType.Laser:
			Paddle.#exclType = type;
			Paddle.#targetW  = type == ItemType.Expand ? StretchMax : Width;
			Paddle.#updateCache($ctx);
			break;
		}
		if (ItemMgr.ExclTypeSet.has(type))
			Paddle.#catchX = 0;
	}
	#onDropped() {
		Paddle.#updateCache($ctx);
		Sound.play('destroy');
	}
	#setWidth() {
		if (Paddle.#targetW > Paddle.#width) {
			Paddle.#width = min(Paddle.#width+StretchSpeed, Paddle.#targetW);
			Paddle.#updateCache($ctx);
		}
		if (Paddle.#targetW < Paddle.#width) {
			Paddle.#width = max(Paddle.#width-StretchSpeed, Width);
			Paddle.#updateCache($ctx);
		}
	}
	#getPaddleType(ctx) {
		if (ctx != $ctx)
			return;
		switch (Paddle.ExclType) {
		case ItemType.Catch:
		case ItemType.Laser:
			return Paddle.ExclType;
		}
	}
	#updateCache(ctx, w=Paddle.Width) {
		ctx.clear();
		Paddle.#cache(ctx, w, ShadowColor); // shadow
		Paddle.#cache(ctx, w);
	}
	#cache(ctx, w, shadowColor) {
		const type  = Paddle.#getPaddleType(ctx) ?? undefined;
		const lineW = Width*0.05, r = Height/2;

		ctx.save();
		if (shadowColor)
			ctx.translate(r, r);
		if (BallMgr.count <= 0)
			ctx.filter = 'grayscale(100%)';

		// Both side spheres
		for (let i=0; i<2; i++) {
			ctx.save();
			ctx.translate((!i ? r*2 - r : w-r*2 + r), r);
			ctx.beginPath();
				ctx.fillStyle = shadowColor ?? Grad.SphereMap.get(type)()[i];
				ctx.arc(0,0, r, PI/2,-PI/2, !!i);
				ctx.lineTo((!i ? r-lineW : -r+lineW), -r);
				ctx.lineTo((!i ? r-lineW : -r+lineW), +r);
			ctx.fill();
			ctx.restore();
		}
		// Both side vertical lines
		ctx.fillStyle = shadowColor ?? Grad.LineMap.get(type);
		for (let i=0; i<2; i++)
			ctx.fillRect(!i ? (r*2 - lineW) : (w - r*2), 0, lineW, Height);

		// Horizontal bar
		ctx.fillStyle = shadowColor ?? Grad.Body;
		ctx.fillRect(r*2, 0, w-r*4, Height);

		ctx.restore();
	}
	draw() {
		const {x, y}= Paddle;
		ctx.save();
		ctx.globalAlpha = Paddle.alpha;
		ctx.translate(x, y);
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
		Paddle.#spark();
	}
	#spark() {
		if (Ticker.paused || !Game.isReadyScene)
			return;
		if (Paddle.alpha == 0 || Paddle.alpha == 1)
			return;

		for (let i=0; i<=15; i++) {
			const {Width,Height,Pos}= Paddle;
			const stPos = [randInt(0, Width), randInt(0, Height*1.1)];
			const edVec = stPos.map(c=> c+randChoice(-15, +15));
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
});

const AutoMoveToCursorX = freeze(new class {
	static {
		$on('InGame Respawn Resume',
			()=> AutoMoveToCursorX.#reached = false);
	}
	#reached = false;
	get reached() {
		return this.#reached;
	}
	setPosition() {
		if (this.reached) return true;
		for (let i=0; i<int(cvs.width/30); i++)
			if (this.#move()) return true;
		return this.reached;
	}
	#move() {
		const {MoveMin,MoveMax,Pos}= Paddle;
		if (Paddle.centerX > MouseX) {
			Pos.x = max(Pos.x-1, MoveMin);
			if (Paddle.centerX < MouseX || Pos.x == MoveMin)
				return this.#reached = true;
		} else {
			Pos.x = min(Pos.x+1, MoveMax);
			if (Paddle.centerX > MouseX || Pos.x == MoveMax)
				return this.#reached = true;
		}
	}
});

const Grad = freeze(new class {
	Body = this.#lineHSL(0, 0, 46);
	LineMap = new Map()
		.set(undefined,      this.#lineHSL( 15, 100, 40))
		.set(ItemType.Catch, this.#lineHSL( 33, 240, 29))
		.set(ItemType.Laser, this.#lineHSL(240,  33, 29))
	;
	SphereMap = new Map()
		.set(undefined,      ()=> this.#sphereHSL(210, 100, 38))
		.set(ItemType.Catch, ()=> this.#sphereHSL(120, 100, 29))
		.set(ItemType.Laser, ()=> this.#sphereHSL(  0, 100, 29))
	;
	#lineHSL(h=0,s=0,l=100) {
		const
		g = $ctx.createLinearGradient(Width,0,Width,Height);
		g.addColorStop(0.0, hsl(h,s,l));
		g.addColorStop(0.3, hsl(h,s,90));
		g.addColorStop(0.4, hsl(h,s,l));
		g.addColorStop(1.0, hsl(h,s,l*1.1));
		return g;
	}
	#sphereHSL(h=0,s=0,l=100) {
		const radius = Height/2;
		const lightness = max(abs(sin(Paddle.blink))*(l*1.4), l);
		return [0,1].map((_,i)=> { // Both sides
			const sx = (!i ? radius : -radius) / 4;
			const
			g = $ctx.createRadialGradient(sx,-radius/2,0, 0,0,radius);
			g.addColorStop(0.0, hsl(h,s,90));
			g.addColorStop(0.5, hsl(h,s,lightness));
			g.addColorStop(1.0, hsl(h,s,lightness));
			return g;
		});
	}
});