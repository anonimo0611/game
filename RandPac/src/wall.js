import {Timer} from './_lib/timer.js';
import {Vec2}  from './_lib/vec2.js';
import {Dirs}  from './_lib/direction.js';
import {BgCtx} from './_main.js';
import {Scene} from './scene.js';
import {Color,Pen,Maze,WallMap,hasWall} from './maze.js';

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
  		Wall.setDoor({close:true});
	}
	onClear(e) {
		let count = 0;
		function setColor() { // flashing
			if (++count > 8) return;
			Wall.drawTiles(e, {fill:[, Color.Clear][count % 2]});
			Timer.set(250, setColor);
		}
		Timer.set(1000, setColor);
 		Wall.setDoor({close:false});
	}
	setDoor({close:c=false}={}) {
		const {Frame:f,Rect}= Pen;
		const [x,y]= [(CVS_SIZE-A)/2, Rect.y+(T-f)/2];
		c? fillRect(BgCtx)(x, y+0, A, f+0, Color.Door)
		 : fillRect(BgCtx)(x, y-f, A, f*3, null);
	}
	drawGhostPen() {
		const {Frame:f}= Pen;
		const {x,y,Width:w,Height:h}= Pen.Rect;
		const xywh = [x+T/3-f/4, y+T/2, w+T/3+f/2, h+f];
		strokeRoundRect(BgCtx)(...xywh, T/3, {lw:f});
		Wall.setDoor({close:!Scene.isClear});
	}
	drawTiles(_, {fill=Color.Wall}={}) {
		const [cvs,ctx]= canvas2D(null, CVS_SIZE).vals;
		setCtxColors(BgCtx,ctx)({fill,stroke:fill});
		WallMap.forEach(tile=> Wall.drawTile(ctx, tile));
		BgCtx.clear(0,0, CVS_SIZE, CVS_SIZE-FOOTER_H);
		BgCtx.drawImage(cvs, 0, 0);
		Wall.drawGhostPen();
	}
	drawTile(ctx, tile) {
		if (Pen.isAround(tile)) return;
		const s = THICKNESS, [r,d]= [s/2, s*2];
		const [UW,RW,DW,LW]= Dirs.map(dir=> hasWall(Vec2[dir].add(tile)));
		ctx.save();
		ctx.translate(...Vec2.mul(tile,T).add((T-s)/4 |0).vals);
		fillCircle(ctx)(s, s, r);
		Maze.isInTunnel(tile)
		   && ctx.fillRect(-d, r, T+d, s);
		RW && ctx.fillRect( s, r, T+0, s);
		DW && ctx.fillRect( r, s, s+0, T);
		UW && LW && Wall.drawCorner(ctx, 0, 0, 0,  r, r, r);
		UW && RW && Wall.drawCorner(ctx, 1, d, 0, -r, r, r);
		DW && RW && Wall.drawCorner(ctx, 2, d, d, -r,-r, r);
		DW && LW && Wall.drawCorner(ctx, 3, 0, d,  r,-r, r);
		DW && RW && hasWall(Vec2.add(tile,1)) && ctx.fillRect(s,s,T,T);
		ctx.restore();
	}
	drawCorner(ctx, idx, tx,ty, sx,sy, r) {
		ctx.save();
		ctx.translate(tx,ty);
	    ctx.beginPath();
			ctx.moveTo(sx,sy);
			ctx.arc(0,0, r, idx*PI/2, idx*PI/2+PI/2);
		ctx.fill();
		ctx.restore();
	}
};