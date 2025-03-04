export const [GlowCvs,ctx,w,h]= canvas2D(null, T*5).vals
ctx.filter = `blur(${T*0.6}px)`
cvsFillCircle(ctx)(w/2, h/2, T, '#F00')