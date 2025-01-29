const s=18,[e,c]=canvas2D(0,s).vals
c.lineWidth=s/6
c.lineCap='round'
c.strokeStyle='#FFF'
for(let i=0;i<3;i++)cvsStrokeLine(c)(s/12,s/9+s/8*i+s/3.5*i,s-s/12,s/9+s/8*i+s/3.5*i)
$('#cfgBtn').text('').append(e)