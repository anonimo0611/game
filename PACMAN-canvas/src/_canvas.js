import {TileSize,CvsWidth,CvsHeight} from './_constants.js'
export const [Cvs,Ctx]    =canvas2D('cvs',CvsWidth,CvsHeight).vals
export const [BgCvs,BgCtx]=canvas2D('bgC',CvsWidth,CvsHeight).vals
setCanvasSize('speakerCvs')(TileSize*1.5|0)