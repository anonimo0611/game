import {Itr}     from '../lib/iter.js';
import {Vec2}    from '../lib/vec2.js';
import {Rect}    from '../lib/rect.js';
import {cvs,ctx} from './canvas.js';
import {Pause}   from './pause.js';
import {Scene}   from './scene.js';
import {Color}   from './colors.js';
import {Court}   from './court.js';
import {Pointer} from './pointer.js';

const ButtonMap     = new Map();
const FontSize      = cvs.height/18;
const BorderWidth   = Court.LineWidth/2;
const VolBtnSize    = FontSize * 0.8;
const SpeakerMargin = FontSize + FontSize*0.3;

export class Button {
	static FontSize = FontSize;
	static get(Class) {
		return ButtonMap.get(Class);
	}
	static set(Class) {
		if (ButtonMap.has(Class)) return;
		const btn = new Class();
		if (!(btn instanceof Button))
			throw TypeError('Class is not a subclass of the Button');
		ButtonMap.set(Class, btn);
		return this;
	}
	static delete(Class) {
		ButtonMap.delete(Class);
		return this;
	}
	static draw() {
		ButtonMap.forEach(btn=> btn.draw());
	}
	static get hover() {
		return Itr.some(ButtonMap.values())(btn=> btn.hover);
	}
	#color;
	#disabled = false;
	get hover()     {return this.Rect.contains(Pointer.Pos)}
	get focused()   {return this.elm == document.activeElement}
	get color()     {return this.#color}
	get disabled()  {return this.#disabled}
	set disabled(b) {isBool(b) && (this.elm.disabled = this.#disabled = b)}

	constructor({
		elmId, text=null, isCenter=false, func,
		top=0, left=0, right, bottom,
		fontFamily='VectorBold', fontSize=20,
		border=BorderWidth, borderR=0.3, padding=0.15
	}) {
		this.elm       = byId(elmId) ?? {};
		this.func      = func;
		this.text      = text ?? '';
		this.border    = border;
		this.fontSize  = fontSize;
		this.isCenter  = isCenter;
		this.borderR   = borderR *= fontSize;
		this.padding   = padding *= fontSize;
		this.fontProp  =`${this.fontSize}px ${fontFamily}`;
		this.txtWidth  = textWidth(ctx)(text,this.fontProp) || fontSize;
		this.txtHeight = fontSize*1.125;
		this.width     = this.txtWidth + padding*4 + border*2
		this.height    = this.txtHeight+ padding*2;
		this.#setEvents();
		this.#setPositionAndRect({top,left,right,bottom});
		freeze(this);
	}
	#setEvents() {
		this.elm.on({
			blur:   this.#setColor.bind(this),
			keydown:this.#onKeydown.bind(this),
			keyup:  this.#onUp.bind(this),
		});
		$on({
			mouseup:    this.#setColor.bind(this),
			mousemove:  this.#setColor.bind(this),
			touchend:   this.#onUp.bind(this),
			pointerdown:this.#onDown.bind(this),
		});
	}
	#setPositionAndRect({top,left,right,bottom}) {
		const {border:b,padding:p,width:w,height:h,txtWidth:tw}=this;
		const centerX = (cvs.width - tw)/2;
		const [x, y]= (()=> {
			let x = isNum(right) ? (cvs.width  - right)  : left;
			let y = isNum(bottom)? (cvs.height - bottom) : top;
			this.isCenter && (x=centerX);
			return [x|0, y|0];
		})();
		this.Pos  = Vec2(x, y);
		this.Rect = new Rect(x-b-p*2, y-b, w, h);
		this.centerPos = Vec2(x+tw/2, y+FontSize/2).freeze();
	}
	#setColor() {
		if (Pointer.isTouchDevice) return;
		this.#color = !this.hover || this.disabled
			? Color.BtnDefault
			: Color.BtnHover;
	}
	#setDisabledStyle() {
		ctx.globalAlpha = this.disabled? 0.5 : 1;
		this.disabled && this.#setColor();
	}
	#onDown(e) {
		if (this.disabled) return;
		Pointer.setPosition(e);
		if (this.hover) {
			this.#color = Color.BtnActive;
			this.func?.();
		}
	}
	#onKeydown(e) {
		if (e.originalEvent.repeat) return;
		if (e.key == '\x20' || e.key == 'Enter') {
			this.#color = Color.BtnActive;
			this.func?.(e);
		}
	}
	#onUp() {
		if (this.disabled) return;
		this.#color = Color.BtnDefault;
	}
	#setOctagonPath({
		borderR:r, padding:pd, txtWidth:tw, txtHeight:th, fontSize:fs
	}) {
		const bw = tw + pd + (!this.text? 0 : r);
		const bh = th + pd - r/2;
		ctx.save();
		ctx.translate(...!this.text? [0,0]:[-r/2, -pd/2+r/2]);
		polygonPath(ctx)(
		-pd,   r,   -pd+r, 0,
		 bw-r, 0,    bw,   r,
		 bw,   bh-r, bw-r, bh,
		-pd+r, bh,  -pd,   bh-r);
		ctx.restore();
	}
	draw() {
		ctx.save();
		ctx.translate(...this.Pos.vals);
		this.#setDisabledStyle();
		this.#drawText();
		this.drawBorder();
		ctx.restore();
	}
	drawBorder() {
		if (!this.border) return;
		this.#setOctagonPath(this);
		ctx.lineWidth   = this.border + int(this.focused)*1.2;
		ctx.strokeStyle = this.#color;
		ctx.stroke();
	}
	#drawText() {
		const {fontSize,text}= this;
		ctx.font      = this.fontProp;
		ctx.fillStyle = this.#color;
		ctx.fillText(text, 0, fontSize);
	}
}

export class PauseBtn extends Button {
	constructor() {
		super({
			text:     null,
			elmId:   'pauseBtn',
			func:     Pause.pause,
			padding:  0.1,
			fontSize: FontSize,
			left:     FontSize*0.5,
			bottom:   FontSize*1.5,
		});
	}
	draw() {
		this.disabled = !Scene.isInGame;
		if (this.disabled) return;
		const lw = this.border/FontSize;
		super.draw();
		ctx.save();
		ctx.translate(...this.centerPos.vals);
		ctx.scale(FontSize, FontSize);
		ctx.lineWidth   = lw;
		ctx.strokeStyle = this.color;
		if (Pause.paused) {
			polygonPath(ctx)(
			-0.20, -0.3+lw/2,
			-0.20, +0.3+lw/2,
			+0.33, +0.0+lw/2);
			ctx.stroke();
		} else {
			const [w,h]= [0.15, 0.5];
			const [ofstX,ofstY]= [w-lw, lw/2];
			ctx.strokeRect(-0.18-ofstX, -0.2-ofstY, w,h);
			ctx.strokeRect(+0.18-ofstX, -0.2-ofstY, w,h);
		}
		ctx.restore();
	}
}
class ResetBtn extends Button {
	constructor() {
		super({
			text:    'RESET',
			elmId:   'resetBtn',
			func:()=> $trigger('Reset'),
			isCenter: true,
			fontSize: FontSize,
			top:      cvs.height * 0.87,
		});
	}
}
freeze(Button).set(PauseBtn).set(ResetBtn);