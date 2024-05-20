import {Vec2}    from '../lib/vec2.js';
import {cvs,ctx} from './canvas.js';

const {cross}   = Vec2;
const NEARLY_0  = 0.000001;
const GroundY   = int(cvs.height * 3/4);
const NetHeight = int(cvs.height / 7.2);
const LineWidth = int(cvs.height / 120);
const DashSize  = int(LineWidth  * 1.4);

const CenterX    = cvs.width/2;
const NetTopY    = GroundY - NetHeight;
const NetLine    = freeze([CenterX, NetTopY, CenterX, GroundY]);
const CenterLine = freeze([CenterX, NetTopY, CenterX, 0]);
const GroundLine = freeze([0, GroundY, cvs.width, GroundY]);

export const Court = freeze(new class {
	GroundY   = GroundY;
	NetTopY   = NetTopY;
	ServeOneX = NetHeight*1.5;
	ServeTwoX = cvs.width - NetHeight*1.5;
	LineWidth = LineWidth;
	draw() {
		this.#drawCenterLine();
		this.#drawGround_Net();
	}
	#drawGround_Net() {
		drawLine(ctx)(...GroundLine);
		drawLine(ctx)(...NetLine);
	}
	#drawCenterLine() {
		ctx.save();
		ctx.lineWidth = Court.LineWidth/2.5;
		ctx.setLineDash([DashSize,DashSize]);
		drawLine(ctx)(...CenterLine);
		ctx.restore();
	}
	intersectNet(v1st, v1ed) {
		const v2st = Vec2(CenterX, cvs.height);
		const v2ed = Vec2(CenterX, NetTopY);
		const [v1ed_v1st,v2ed_v2st]=[Vec2.sub(v1ed,v1st),Vec2.sub(v2ed,v2st)];
		const [v2st_v1ed,v2ed_v1ed]=[Vec2.sub(v2st,v1ed),Vec2.sub(v2ed,v1ed)];
		const [v1st_v2st,v1ed_v2st]=[Vec2.sub(v1st,v2st),Vec2.sub(v1ed,v2st)];
		return (
			cross(v1ed_v1st,v2st_v1ed) * cross(v1ed_v1st,v2ed_v1ed) < NEARLY_0 &&
			cross(v2ed_v2st,v1st_v2st) * cross(v2ed_v2st,v1ed_v2st) < NEARLY_0
		);
	}
});