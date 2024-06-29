import {Vec2}     from '../lib/vec2.js';
import {Ticker}   from '../lib/timer.js';
import {hsl,rgba} from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {Game}     from './_main.js';
import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';
import {Score}    from './score.js';
import {Paddle}   from './paddle.js';
import {BallMgr}  from './ball.js';
import {BrickMgr} from './brick.js';
import {Rect}     from './rect.js';

const Width  = BrickMgr.ColWidth;
const Height = BrickMgr.RowHeight * 1.25;

export const ItemType = freeze({
	PlayerExtend: 0,
	Catch:        1,
	Disruption:   2,
	Expand:       3,
	Laser:        4,
	SpeedDown:    5,
	Max:          6,
});
const ColorTable = freeze([
	{hue:220,sat: 0,textColor:rgba(0,255,255)}, // PlayerExtend
	{hue:120,sat:91}, // Catch
	{hue:206,sat:91}, // Disruption
	{hue:240,sat:91}, // Expand
	{hue:  0,sat:91}, // Laser
	{hue: 16,sat:91}, // SpeedDown
]);
const ExclTypeSet = new Set([
	ItemType.Catch,
	ItemType.Disruption,
	ItemType.Expand,
	ItemType.Laser,
]);
const ItemSet = new Set();

export const ItemMgr = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({Respawn: ()=> ItemMgr.#extendCnt = 0});
		$(ItemMgr).on({Obtained: ItemMgr.#onObtained});
	}
	get Current()     {return ItemSet.values().next().value}
	get ItemApeared() {return ItemSet.size > 0 || BallMgr.count > 1}
	get Type()        {return ItemType}
	get ExclTypeSet() {return ExclTypeSet}

	#lastItemType = -1;
	#extendCnt    =  0;
	#speedDownCnt =  0;
	init() {
		ItemSet.clear();
		this.#lastItemType  = -1;
		this.#extendCnt     =  0;
		this.#speedDownCnt  =  0;
	}
	appear({x, y}) {
		if (this.ItemApeared) {
			return;
		}
		if (randInt(0,2) != 0) {
			return;
		}
		const type = this.#choice();
		ItemSet.add( new Item(type, {x, y}, ColorTable[type]) );
	}
	#choice() {
		let type = randInt(0, ItemType.Max-1);
		if (type === this.#lastItemType
		 || type === ItemType.SpeedDown && this.#speedDownCnt > 2
		 || type === ItemType.PlayerExtend && (randInt(0,1) || this.#extendCnt)
		) {
			return this.#choice();
		}

		if (ExclTypeSet.has(type) && type === Paddle.ExclType) {
			type = randChoice([...ExclTypeSet]
				.filter(i=> i != this.#lastItemType && i != type));
		}
		return (this.#lastItemType = type);
	}
	#onObtained(_, type) {
		type == ItemType.SpeedDown    && this.#speedDownCnt++;
		type == ItemType.PlayerExtend && this.#extendCnt++;
	}
	update() {
		this.Current?.update();
	}
	draw() {
		this.Current?.draw();
	}
};
class Item extends Rect {
	Speed      = cvs.height / 175;
	#animIdex  = 0;
	#textScale = 0;
	#scaleTbl  = integers(30).map(n=> n>15 ? 30-n : n);

	get centerX() {return this.Pos.x + Width/2}

	constructor(type, pos, {hue,sat,textColor}={}) {
		super(pos, Width, Height);
		this.Type = type;
		this.Text = keys(ItemType)[type][0];
		this.Pos  = Vec2(pos).xFreeze();
		this.Grad = ctx.createLinearGradient(Width,0,Width,Height);
		this.Grad.addColorStop(0.0, hsl(hue,sat,36));
		this.Grad.addColorStop(0.2, hsl(hue,sat,80));
		this.Grad.addColorStop(0.3, hsl(hue,sat,36));
		this.Grad.addColorStop(1.0, hsl(hue,sat,50));
		this.TextColor = textColor ?? rgba(255,204,0);
		this.OutlineColor = hsl(hue, (sat == 0 ? 0:40), 40);
	}
	update() {
		if (Ticker.count % 2 == 0) {
			++this.#animIdex;
		}
		if (!Game.isPlayScene) {
			ItemSet.clear();
			return;
		}

		const len = this.#scaleTbl.length;
		const idx = this.#animIdex = this.#animIdex % len;
		this.#textScale = this.#scaleTbl[idx] / (len/2);
		this.Pos.y += this.Speed;

		if (Paddle.collisionRect(this)) {
			Score.add(1000);
			Sound.play('item');
			$(ItemMgr).trigger('Obtained', this.Type);
			ItemSet.clear();
		}
		if (this.Pos.y > cvs.height) {
			ItemSet.clear();
		}
	}
	draw() {
		if (!Game.isPlayScene) {
			return;
		}
		const {x,y,Width:w,Height:h}= this;
		const offsetH  = h * (this.#animIdex/this.#scaleTbl.length);
		const cornerR  = h / 3;
		const fontSize = h;

		// Item shadow
		ctx.save();
		ctx.translate(x+h/3, y+h/3);
		fillRoundRect(ctx, 0,0, w,h, cornerR, rgba(0,0,0, 0.4));
		ctx.restore();

		// Item itself
		ctx.save();
		ctx.translate(x, y);
		ctx.lineWidth = int(cvs.width / 200);
		fillRoundRect  (ctx, 0,0, w,h, cornerR, this.Grad);
		strokeRoundRect(ctx, 0,0, w,h, cornerR, this.OutlineColor)
		ctx.restore();

		// Logo text
		ctx.save();
		ctx.translate(x+1, y + offsetH);
		ctx.scale(1, this.#textScale * 0.8);
		ctx.globalAlpha   = 0.8;
		ctx.shadowColor   = rgba(0,0,0, 0.7);
		ctx.shadowOffsetX = fontSize * 0.1;
		ctx.shadowOffsetY = fontSize * 0.1;
		ctx.font      = `${fontSize}px Atari`;
		ctx.textAlign = 'center';
		ctx.fillStyle = this.TextColor;
		ctx.fillText(this.Text, w/2+1, h/2 - fontSize/6);
		ctx.restore();
	}
}