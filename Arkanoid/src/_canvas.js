export const [cvs,ctx] = canvas2D('canvas').vals;
export const [cvsForBrick, ctxForBrick] = canvas2D(null, cvs.width, cvs.height).vals;
export const [cvsForShadow,ctxForShadow]= canvas2D(null, cvs.width, cvs.height).vals;