const s=18,lw=s/6,[e,c]=canvas2D(0,s).vals
c.lineWidth=lw
c.lineCap='round'
c.strokeStyle='#FFF'
for(let i=0;i<3;i++){
    let y=s/9+s/8*i+s/3.5*i
    cvsStrokeLine(c)(lw/2,y,s-lw/2,y)
}$('#cfgBtn').empty().append(e)