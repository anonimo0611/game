import {Ticker}  from '../lib/timer.js';
import {State}   from '../lib/state.js';
import {Grid}    from './_grid.js';
import {Game}    from './_main.js';
import {ctx}     from './_canvas.js';
import {Phase}   from './phase.js';
import {Pointer} from './pointer.js';

const MatchesMin = 3;

const FadeSpeed =  1/30;
const RotateSpd = PI/10;
const FallSpeed = Grid.Size/8;

let   comboColorIdx =  0;
const ComboScaleMin =  1;
const ComboScaleMax = 10;
const ComboColorLst = freeze('#00F|#F00|#0F0|#00F|#F0F|#0FF'.split('|'));

const Radius  = Grid.Size*.95/2;
const OrbType = freeze({
	None:  -1,
	Red:    0,
	Yellow: 1,
	Green:  2,
	Blue:   3,
	Purple: 4,
	Pink:   5,
	Max:    6,
});
const OrbColorLst = freeze([
	'#FF0033', // Red
	'#FB7537', // Yellow
	'#339933', // Green
	'#0085DE', // Blue
	'#6600FF', // Purple
	'#FD07C3', // Pink
]);

const
EdgeGrad = ctx.createRadialGradient(0,0,0, 0,0,Radius);
EdgeGrad.addColorStop(0.00, 'transparent');
EdgeGrad.addColorStop(0.89, 'transparent');
EdgeGrad.addColorStop(0.90, '#666');
EdgeGrad.addColorStop(1.00, '#FFF');

const OrbGrads = integers(OrbType.Max).map(i=> {
	const
	g = ctx.createRadialGradient(-Grid.Size/6,-Grid.Size/6,0, 0,0,Radius);
	g.addColorStop(0.00, '#EEE');
	g.addColorStop(0.89,  OrbColorLst[i]);
	g.addColorStop(1.00, '#FFF');
	return g;
});

const Directions = freeze([
	Vec2.Up,
	Vec2.Left,
	Vec2.Down,
	Vec2.Right]);

const isInBoard = ({x, y})=>
	between(x, 0, Grid.Cols-1) &&
	between(y, 0, Grid.Rows-1);

export class Orb {
	type = randInt(0, OrbType.Max-1);
	rotCenter  = vec2();
	rotate     = 0;
	rotateMax  = 0;
	fadeOut    = 0;
	fallY      = 0;
	combo      = 0;
	comboScale = 0;
	constructor(x, y) {
		setReadonly(this, {x, y});
		$offon({Idle:()=> this.combo = 0});
	}
	static get({x=0, y=0}={}) {
		return Orbs[y][x];
	}
	static get isFalling() {
		return Orbs.flat().some(orb=> orb.fallY < 0);
	}
	static #swapType(orb1, orb2) {
		[orb1.type, orb2.type]=
		[orb2.type, orb1.type];
	}
	static update() {
		Phase.isRemove && Orb.#updateRemovePhase();
		Phase.isFall   && Orb.#updateFallPhase();
		Orbs.flat().forEach(orb=> orb.#update());
		if (Ticker.count % 3 == 0)
			comboColorIdx = ++comboColorIdx % ComboColorLst.length;
	}
	static #updateRemovePhase() {
		let removing = false;
		Orbs.flat().forEach(orb=> {
			if (orb.fadeOut <= 0) return;
			removing = true;
			orb.fadeOut -= FadeSpeed;
			if (orb.fadeOut < 0) {
				orb.fadeOut = 0;
				orb.type = OrbType.None;
			}
		});
		if (removing || Orb.setRemove()) return;
		Orb.#setFall();
		Phase.switchToFall();
	}
	static #updateFallPhase() {
		Orbs.flat().forEach(orb=> {
			if (orb.fallY >= 0) return;
			orb.fallY += FallSpeed;
			if (orb.fallY > 0)
				orb.fallY = 0;
		});
		if (!Orb.isFalling && !Orb.#setFall())
			Orb.setRemove()
				? Phase.switchToRemove()
				: Phase.switchToIdle();
	}
	static draggingWithPointer() {
		const swapSrc = Pointer.swappingPos;
		const swapDst = Vec2.divInt(Pointer.Pos, Grid.Size);
		const SrcOrb  = Orbs[swapSrc.y][swapSrc.x];
		const DstOrb  = Orbs[swapDst.y][swapDst.x];

		if (Pointer.swappingOrb != DstOrb && !Pointer.inCornerOfTile) {
			const srcCenter = vec2(swapSrc).add(.5).mul(Grid.Size);
			const dstCenter = vec2(swapDst).add(.5).mul(Grid.Size);

			const center = Vec2.add(srcCenter, dstCenter).div(2);
			SrcOrb.rotCenter =
			DstOrb.rotCenter = center;

			const centerToDst = Vec2.sub(dstCenter, center);
			SrcOrb.rotateMax = atan2(-centerToDst.y, centerToDst.x);
			SrcOrb.rotate    = SrcOrb.rotateMax - PI;
			DstOrb.rotate    = SrcOrb.rotateMax;
			DstOrb.rotateMax = DstOrb.rotate + PI;

			Orb.#swapType(SrcOrb, DstOrb);
			return swapDst;
		}
		return Pointer.swappingPos;
	}
	static #setFall() {
		let falling = false;
		for (let y=Grid.Rows-1; y>0; y--)
			for (let x=0; x<Grid.Cols; x++) {
				const orb = Orbs[y][x];
				if (orb.type == OrbType.None) {
					orb.fallY = -Grid.Size;
					Orb.#swapType(orb, Orbs[y-1][x]);
					falling = true;
				}
			}
		for (let x=0; x<Grid.Cols; x++)
			if (Orbs[0][x].type == OrbType.None) {
				Orbs[0][x].type  = randInt(0, OrbType.Max-1);
				Orbs[0][x].fallY = -Grid.Size;
				falling = true;
			}
		return falling;
	}
	static setRemove() {
		const map = Array(Grid.Rows*Grid.Cols).fill(false);
		Orbs.flat().forEach(orb=> orb.#mappingMatchedOrbs(map));
		for (let y=Grid.Rows-1; y>=0; y--)
			for (let x=0; x<Grid.Cols; x++) {
				if (!map[y*Grid.Cols+x]) continue;
				Orbs[y][x].#remove(map);
				return true;
			}
		return false;
	}
	static draw() {
		Orbs.flat().forEach(orb=> {
			orb.rotate >= orb.rotateMax
				? orb.#draw()
				: orb.#rotation();
		});
		Orbs.flat().forEach(orb=> {
			orb.#comboEffect()
		});
		if (Phase.isSwap)
			Pointer.swappingOrb?.#drawOrb(Pointer.Pos, {alpha:.8});
	}
	#update() {
		if (this.rotate < this.rotateMax)
			this.rotate += RotateSpd;
		if (this.comboScale > ComboScaleMin) {
			this.comboScale *= 0.92;
			if (this.comboScale < ComboScaleMin)
				this.comboScale = ComboScaleMin;
		}
	}
	#mappingMatchedOrbs(matchedMap) {
		this.fadeOut = 0;
		if (this.type == OrbType.None) return;
		for (const dir of Directions) {
			let count = 0;
			let pos = vec2(this);
			while (1) {
				count++;
				pos.add(dir);
				if (!isInBoard(pos) || Orbs[pos.y][pos.x].type != this.type)
					break;
			}
			if (count >= MatchesMin) {
				let pos = vec2(this);
				for (let i=0; i<count; i++) {
					matchedMap[pos.y*Grid.Cols+pos.x] = true;
					pos.add(dir);
				}
			}
		}
	}
	#remove(matchedMap) {
		Game.addComboCount();
		this.combo = Game.comboCount;
		this.comboScale = ComboScaleMax;
		const temp = [vec2(this)];
		while (temp.length) {
			Orbs[temp[0].y][temp[0].x].fadeOut = 1;
			for (const dir of Directions) {
				const pos = Vec2.add(temp[0],dir);
				if (!isInBoard(pos)
					|| !matchedMap[pos.y*Grid.Cols+pos.x]
					|| Orbs[pos.y][pos.x].type != this.type
					|| Orbs[pos.y][pos.x].fadeOut > 0
				) continue;
				temp.push(pos);
			}
			temp.shift();
		}
	}
	#rotation() {
		const alpha = Phase.isSwap && this == Pointer.swappingOrb ? .25 : 1;
		const pos   = vec2(this.rotCenter);
		const rotV  = vec2(-cos(this.rotate),sin(this.rotate)).mul(Grid.Size/2);
		this.#drawOrb(pos.add(rotV), {alpha});
	}
	#draw() {
		const alpha = (_=> {
			if (Phase.isSwap && this == Pointer.swappingOrb)
				return .25;
			if (Phase.isRemove && this.fadeOut > 0)
				return this.fadeOut;
			return 1;
		})();
		const pos = vec2(this).add(.5).mul(Grid.Size);
		if (Phase.isFall && this.fallY < 0)
			pos.y += this.fallY;
		this.#drawOrb(pos, {alpha});
	}
	#drawOrb({x, y}, {alpha=1,scale=1}={}) {
		if (this.type == OrbType.None) return;
		ctx.save();

		ctx.globalAlpha = alpha;
		ctx.translate(x, y);
		ctx.scale(scale, scale);

		// Outside
		ctx.beginPath();
			ctx.fillStyle = EdgeGrad;
			ctx.arc(0,0, Radius, 0, PI*2);
		ctx.fill();

		// Inner
		ctx.beginPath();
			ctx.fillStyle = OrbGrads[this.type];
			ctx.arc(0,0, Radius*.9, 0, PI*2);
		ctx.fill();

		ctx.restore();
	}
	#comboEffect() {
		if (this.combo < 2) return;
		const text = `Combo ${this.combo}`;
		const size = int(Grid.Size/8);
		ctx.save();
		ctx.translate(...vec2(this).add(.5).mul(Grid.Size).vals);
		ctx.scale(this.comboScale, this.comboScale);
		ctx.font = `${size}px Atari`;
		ctx.lineWidth   = 4;
		ctx.textAlign   = 'center';
		ctx.strokeStyle = 'rgba(40 40 40 /.7)';
		ctx.fillStyle   = ComboColorLst[comboColorIdx];
		ctx.strokeText(text, 0, size/2);
		ctx.fillText(text, 0, size/2);
		ctx.restore();
	}
} freeze(Orb);

const Orbs =
	integers(Grid.Rows).map(y=>
	integers(Grid.Cols).map(x=> new Orb(x, y)));