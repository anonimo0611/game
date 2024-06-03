export const {cvs,ctx}= canvas2D('canvas');
export const [cvsBrick, ctxBrick] = canvas2D(null, cvs).vals;
export const [cvsShadow,ctxShadow]= canvas2D(null, cvs).vals;