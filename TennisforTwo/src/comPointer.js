import {cvs,ctx} from './canvas.js';
import {Scene}   from './scene.js';
import {Score}   from './score.js';
import {Color}   from './colors.js';
import {Court}   from './court.js';
import {Player}  from './player.js';
import {Ball}    from './ball.js';

export class ComPointer {
	static {$ready(this.#setup.bind(this))}
	static #clsid = Symbol();
	static #setup() {
		this.Items = freeze([
			new ComPointer1UP(this.#clsid, Player.Side.One),
			new ComPointer2UP(this.#clsid, Player.Side.Two),
		]);
		freeze(this);
	}
	static draw()      {this.Items.forEach(i=> i.draw())}
	static update()    {this.Items.forEach(i=> i.update())}
	static reset(...a) {this.Items.forEach(i=> i.#reset(...a))}

	#x = 0;
	get x()    {return this.#x}
	get xPct() {return this.#x/(cvs.width/2) * 100}
	get shotAlready() {return this.side^1 == Player.nextTurn}

	constructor(clsid, side) {
		if (clsid != ComPointer.#clsid)
			throw TypeError('The constructor is not visible');
		this.side = side;
		this.y = Court.GroundY + Court.LineWidth;
		this.w = int(cvs.width/2 * 0.04);
		freeze(this);
	}
	#setCenterX(x) {
		this.#x = x - this.w/4;
	}
	#reset(server, serveX) {
		serveX = this.side != server
			? cvs.width/4 : (serveX - cvs.width/2);
		this.#setCenterX(serveX);
	}
	update() {
		if (Player.serving || Score.waiting || this.shotAlready) return;
		let speed = abs(Ball.Velocity.x) * 0.998;
		if (Ball.Velocity.magnitude < 3) speed = 3;
		if (this.ballX < this.x) this.#x -= speed;
		if (this.ballX > this.x) this.#x += speed;
		this.#x = max(0, this.x);
	}
	draw(scaleX=1, color=Color.PinkRGBA) {
		const {x,y,w}= this;
		ctx.save();
		ctx.translate(cvs.width/2, y);
		ctx.scale(scaleX, 1);
		ctx.fillStyle = color;
		ctx.fillRect(x, 0, w/2, w/1.5);
		ctx.restore();
	}
}
class ComPointer1UP extends ComPointer {
	get ballX() {
		return cvs.width/2 - Ball.Pos.x;
	}
	update() {
		Scene.isTitle && super.update();
	}
	draw() {
		Scene.isTitle && super.draw(-1, Color.LimeRGBA);
	}
}
class ComPointer2UP extends ComPointer {
	get ballX() {
		return Ball.Pos.x - cvs.width/2;
	}
	draw() {super.draw()}
}