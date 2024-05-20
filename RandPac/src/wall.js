import {Timer} from './_lib/timer.js';
import {Vec2}  from './_lib/vec2.js';
import {Dirs}  from './_lib/direction.js';
import {Bg}    from './_main.js';
import {Scene} from './scene.js';
import {Color,Pen,WallMap,hasWall} from './maze.js';

const Wall = new class {
	static {$ready(this.setup)}
	static setup() {
		$on({
			Title: Wall.onTitle,
			Clear: Wall.onClear,
			Reset: Wall.drawTiles,
		});
	}
	onTitle() {
  		Wall.door({close:true});
	}
	onClear(e) {
		let count = 0;
		function setColor() { // flashing
			if (++count > 8) return;
			Wall.drawTiles(e, {fill:[, Color.Clear][count % 2]});
			Timer.set(250, setColor);
		}
		Timer.set(1000, setColor);
 		Wall.door({close:false});
	}
	drawTiles(_, {fill=Color.Wall}={}) {
		const [cvs,ctx]= canvas2D(null, CVS_SIZE).vals;
		setCtxColors(Bg,ctx)({fill,stroke:fill});
		WallMap.forEach(tile=> Wall.tile(ctx, tile));
		Bg.clear(0,0, CVS_SIZE, CVS_SIZE - FOOTER_H);
		Bg.drawImage(cvs, 0, 0);
		Wall.ghostPen();
	}
	ghostPen() {
		const {Frame:f}= Pen;
		const {x,y,Width:w,Height:h}= Pen.Rect;
		const xywh = [x+T/3 - f/4, y+T/2, w+T/3 + f/2, h+f];
		strokeRoundRect(Bg)(...xywh, T/3, {lw:f});
		Wall.door({close:!Scene.isClear});
	}
	door({close:c=false}={}) {
		const {Frame:f,Rect}= Pen;
		const [x,y]= [(CVS_SIZE-A)/2, Rect.y+(T-f)/2];
		c? fillRect(Bg)(x, y+0, A, f+0, Color.Door)
		 : fillRect(Bg)(x, y-f, A, f*3, null);
	}
	tile(ctx, tile) {
		if (Pen.isAround(tile)) return;
		const s=THICKNESS, r=s/2, d=s*2;
		const [UW,RW,DW,LW]= Dirs.map(dir=> hasWall(Vec2[dir].add(tile)));
		ctx.save();
		ctx.translate(...Vec2.mul(tile,T).add((T-s)/4 |0).vals);
		fillCircle(ctx)(s, s, r);
		(!tile.x || tile.x == GRID-1) // Side tunnel
		   && ctx.fillRect(-d, r, T+d, s);
		RW && ctx.fillRect( s, r, T+0, s);
		DW && ctx.fillRect( r, s, s+0, T);
		UW && LW && Wall.corner(ctx, 0, 0, 0,  r, r, r);
		UW && RW && Wall.corner(ctx, 1, d, 0, -r, r, r);
		DW && RW && Wall.corner(ctx, 2, d, d, -r,-r, r);
		DW && LW && Wall.corner(ctx, 3, 0, d,  r,-r, r);
		DW && RW && hasWall(Vec2.add(tile,1)) && ctx.fillRect(s,s,T,T);
		ctx.restore();
	}
	corner(ctx, idx, tx,ty, sx,sy, r) {
		ctx.save();
		ctx.translate(tx,ty);
	    ctx.beginPath();
			ctx.moveTo(sx,sy);
			ctx.arc(0,0, r, idx*PI/2, idx*PI/2+PI/2);
		ctx.fill();
		ctx.restore();
	}
};