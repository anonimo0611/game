import {CvsWidth,CvsHeight} from './_constants.js'
export const [Cvs,Ctx]    =canvas2D('cvs',CvsWidth,CvsHeight).vals
export const [BgCvs,BgCtx]=canvas2D(null, CvsWidth,CvsHeight).vals