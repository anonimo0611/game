let b=byId('cfgBtn'),s=b.offsetWidth,{cvs,ctx}=canvas2D(0,s)
ctx.lineWidth=s/6;ctx.strokeStyle='#FFF'
for(let i=0;i<3;i++)cvsStrokeLine(ctx)(0,s/8+s/8*i+s/4*i,s,s/8+s/8*i+s/4*i)
$(b).css('--url',`url(${cvs.toDataURL()})`)