import {Vec2}     from '../lib/vec2.js';
import {Sound}    from '../snd/sound.js';
import {Ticker}   from '../lib/timer.js';
import {Confirm}  from '../lib/confirm.js';
import {hsl,rgba} from '../lib/color.js';
import {cvs,ctx}  from './_canvas.js';
import {Game}     from './_main.js';
import {Mouse}    from './mouse.js';
import {Demo}     from './demo.js';
import {Field}    from './field.js';
import {Scene}    from './scene.js';
import {Lives}    from './lives.js';
import {ItemMgr}  from './item.js';
import {ItemType} from './item.js';
import {BallMgr}  from './ball.js';
import {BrickMgr} from './brick.js';
import {Rect}     from './rect.js';

const Width  = cvs.width / 5;
const Height = BrickMgr.RowHeight;
const Radius = Height / 2;

const StretchMax   = Width * 1.5;
const StretchSpeed = (StretchMax-Width)/(300/Ticker.Interval);
const FadeDuration = 500 / Ticker.Interval;
const SparkColor   = rgba(0,255,255, 0.7);
const ShadowColor  = rgba(0,  0,  0, 0.4);
const [$cvs,$ctx]  = canvas2D(null, StretchMax+Radius, Height*1.5).vals;

export const Paddle = freeze(new class extends Rect {
	static {$ready(this.#setup)}
	static #setup() {
		$on({Dropped:   Paddle.#onDropped});
		$on({Resume:    Paddle.#onResume});
		$on({mousedown: Paddle.#onLaunch});
		$on({mousedown: Paddle.#onRelease});
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
	LaunchVelocity = Vec2.fromDegrees(-90+25);

	// Ball bounce angle based on distance from paddle center
	BounceAngleMax = toRadians(60); // -60 to +60 degrees

	constructor() {
		super(Vec2(cvs.width/2, cvs.height - Height*3), Width, Height);
		this.Pos.yFreeze();
	}
	get alpha()    {return this.#alpha}
	get blink()    {return this.#blink}
	get launched() {return this.#launched}
	get Width()    {return this.#width}
	get catchX()   {return this.#catchX}
	get centerX()  {return this.x + this.Width/2}
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
		return Scene.isInGame && this.alpha == 1 && AutoMove.reached;
	}
	get canCatch() {
		return this.Width == this.InitWidth && this.CatchEnabled;
	}
	get BounceVelocity() {
		const {x,centerX:cx,Width:w}= this;
		const ballX = clamp(BallMgr.Ball.x, x, x+w);
		const angle = PI/2 + ((ballX-cx) / w) * this.BounceAngleMax*2;
		return Vec2.fromRadians(angle).inverse;
	}
	get CaughtBallPos() {
		const x = this.catchX? (this.clampedX+this.catchX) : this.centerX;
		return Vec2(x, this.y - BallMgr.Radius);
	}
	init() {
		this.#blink    = 0;
		this.#catchX   = 0;
		this.#alpha    = 0;
		this.#launched = false;
		if (Game.respawned && this.DisruptEnabled) {
			this.#exclType = null;
		}
		if (!Game.respawned) {
			this.#width    = Width;
			this.#targetW  = Width;
			this.#exclType = null;
		}
		this.Pos.x = (cvs.width - this.Width) / 2;
		View.updateCache(Lives.context, Width);
		View.updateCache($ctx);
	}
	update() {
		this.#blink += PI/60;
		View.updateCache($ctx);
		switch (Scene.current) {
		case Scene.Enum.Reset:
		case Scene.Enum.Ready:  return this.#ready();
		case Scene.Enum.InDemo: return this.#demo();
		case Scene.Enum.InGame: return this.#playing();
		default: this.#destory();
		}
	}
	#ready() {
		if (Ticker.elapsed < 500) {return}
		this.#alpha = min(this.#alpha+1/FadeDuration, 1);
	}
	#demo() {
		if (Ticker.elapsed < 200) {return}
		this.#launched ||= true;
		Demo.autoPlay();
		this.#moveCaughtBall();
		this.#setWidth();
		this.#constrain();
	}
	#playing() {
		if (AutoMove.setPosition()) {
			this.Pos.x = Mouse.x - (this.Width/2);
			this.#setWidth();
			this.#moveCaughtBall();
			this.#constrain();
		}
		if (!this.launched)
			BallMgr.Ball.Pos.x = this.catchX
				? this.clampedX + this.catchX
				: this.clampedX + this.Width/2;
	}
	#destory() {
		if (Game.isDemoScene) {return}
		if (BallMgr.count <= 0 && Ticker.count > 8) {
			this.#alpha = max(this.#alpha-1/FadeDuration, 0);
		}
	}
	#constrain() {
		this.Pos.x = clamp(this.Pos.x, this.MoveMin, this.MoveMax);
	}
	#moveCaughtBall() {
		if (!this.catchX) {return}
		BallMgr.Ball.Pos.x = this.CaughtBallPos.x;
	}
	#onLaunch(e) {
		if (Paddle.alpha < 1 || Paddle.launched) {return}
		if (AutoMove.reached && Mouse.acceptEvent(e)) {
			Sound.play('se0');
			Paddle.#launched = true;
		}
	}
	#onCatch(_, ball) {
		const {x,y}= Paddle.Pos;
		ball.Pos.x = clamp(ball.x, x+1, x+Paddle.Width-1);
		ball.Pos.y = y - ball.Radius;
		Paddle.#catchX = ball.x - Paddle.x;
	}
	#onRelease(e, isDemo) {
		if (!Paddle.catchX || !Mouse.acceptEvent(e)) {return}
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
			Paddle.#targetW  = Paddle.ExpandEnabled? StretchMax : Width;
			View.updateCache($ctx);
		}
		if (ItemMgr.ExclTypeSet.has(type)) {
			Paddle.#catchX = 0;
		}
	}
	#onDropped() {
		View.updateCache($ctx);
		Sound.play('destroy');
	}
	#setWidth() {
		if (this.#targetW > this.#width) {
			this.#width = min(this.#width+StretchSpeed, this.#targetW);
			View.updateCache($ctx);
		}
		if (this.#targetW < this.#width) {
			this.#width = max(this.#width-StretchSpeed, Width);
			View.updateCache($ctx);
		}
	}
	draw() {
		const {x, y}= this;
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.translate(x, y);
		ctx.drawImage($cvs, 0,0);
		ctx.restore();
		View.drawSpark();
	}
});

const AutoMove = freeze(new class {
	static {
		$on('InGame Respawn Resume', ()=> AutoMove.#reached = false);
	}
	#reached = false;
	get reached() {return this.#reached}

	setPosition() {
		if (this.reached) {return true}
		for (let i=0; i<cvs.width/30; i++) {
			if (this.#move()) {return true}
		}
		return false;
	}
	#move() {
		const {centerX,MoveMin,MoveMax,Pos}= Paddle;
		const step = centerX > Mouse.x ? -1 : +1;
		Pos.x += step;
		if (step < 0 && (centerX-step < Mouse.x || Pos.x == MoveMin)
		 || step > 0 && (centerX+step > Mouse.x || Pos.x == MoveMax)) {
			return this.#reached = true;
		}
	}
});

const View = freeze(new class {
	BodyStyle = this.getLineStyle(0, 0, 46);
	LineStyleMap = new Map()
		.set(ItemType.None,  this.getLineStyle( 15, 100, 40))
		.set(ItemType.Catch, this.getLineStyle( 33, 240, 29))
		.set(ItemType.Laser, this.getLineStyle(240,  33, 29))
	;
	SphereStyleMap = new Map()
		.set(ItemType.None,  ()=> this.getSphereStyle(210, 100, 38))
		.set(ItemType.Catch, ()=> this.getSphereStyle(120, 100, 29))
		.set(ItemType.Laser, ()=> this.getSphereStyle(  0, 100, 29))
	;
	getLineStyle(h,s,l) {
		const
		g = $ctx.createLinearGradient(Width,0,Width,Height);
		g.addColorStop(0.0, hsl(h,s,l));
		g.addColorStop(0.3, hsl(h,s,90));
		g.addColorStop(0.4, hsl(h,s,l));
		g.addColorStop(1.0, hsl(h,s,l*1.1));
		return g;
	}
	getSphereStyle(h,s,l) {
		l = lerp(l, l*1.4, max(0, sin(Paddle.blink)));
		return [0,1].map(i=> { // Both sides
			const sx = (i == 0 ? Radius : -Radius) / 4;
			const
			g = $ctx.createRadialGradient(sx,-Radius/2,0, 0,0,Radius);
			g.addColorStop(0.0, hsl(h,s,90));
			g.addColorStop(0.5, hsl(h,s,l));
			g.addColorStop(1.0, hsl(h,s,l));
			return g;
		});
	}
	getColorType(ctx) {
		if (ctx == Lives.context) {return ItemType.None}
		return (Paddle.LaserEnabled || Paddle.CatchEnabled)
			? Paddle.ExclType : ItemType.None;
	}
	updateCache(ctx, w=Paddle.Width) {
		ctx.clear();
		this.cache(ctx, w, ShadowColor);
		this.cache(ctx, w);
	}
	cache(ctx, w, shadow) {
		const type   = this.getColorType(ctx);
		const lineW  = Width*0.05, r = Radius;
		const offset = shadow ? r : 0;

		ctx.save();
		ctx.translate(offset, offset);
		ctx.filter = (BallMgr.count <= 0) ? 'grayscale(100%)' : '';

		// Both side spheres
		for (let i=0; i<2; i++) {
			ctx.save();
			ctx.translate((!i ? r*2 - r : w-r*2 + r), r);
			ctx.beginPath();
				ctx.fillStyle = shadow ?? this.SphereStyleMap.get(type)()[i];
				ctx.arc(0,0, r, PI/2,-PI/2, !!i);
				ctx.lineTo(lineW+(!i ? r : -r), -r);
				ctx.lineTo(lineW+(!i ? r : -r), +r);
			ctx.fill();
			ctx.restore();
		}
		// Both side vertical lines
		ctx.fillStyle = shadow ?? this.LineStyleMap.get(type);
		for (let i=0; i<2; i++) {
			ctx.fillRect(!i ? (r*2 - lineW) : (w - r*2), 0, lineW, Height);
		}
		// Horizontal bar
		ctx.fillStyle = shadow ?? this.BodyStyle;
		ctx.fillRect(r*2, 0, w-r*4, Height);

		ctx.restore();
	}
	drawSpark() {
		if (Ticker.paused || !Game.isReadyScene) {return}
		if (Number.isInteger(Paddle.alpha)) {return}

		const {Width,Height,Pos}= Paddle;
		const radius = int(Width/12);
		const config = {color:SparkColor, width:cvs.width/230};
		for (let i=0; i<=15; i++) {
			const stPos = [randInt(0, Width), randInt(0, Height*1.1)];
			const edVec = stPos.map(c=> c+randChoice(-radius, radius));
			ctx.save();
			ctx.translate(...Pos.vals);
			drawLine(ctx, config)(...stPos, ...edVec);
			ctx.restore();
		}
	}
});