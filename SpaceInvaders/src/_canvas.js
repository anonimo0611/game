export const {cvs,ctx}= canvas2D('canvas');
export const {cvs:cvsForBunker}= canvas2D(null, cvs);
export const {cvs:cvsForGround}= canvas2D(null, cvs.width, 3);

ctx.font = `${26}px Vector`;