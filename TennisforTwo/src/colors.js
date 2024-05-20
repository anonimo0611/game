export const Color = freeze(new class {
	Cyan = [  0,255,255].join('\x20');
	Lime = [  0,255,  0].join('\x20');
	Pink = [227,101,203].join('\x20');
	CyanRGBA   =`rgba(${this.Cyan} /.8)`;
	LimeRGBA   =`rgba(${this.Lime} /.8)`;
	PinkRGBA   =`rgba(${this.Pink} /.8)`;
	BtnDefault = this.CyanRGBA;
	BtnHover   = this.PinkRGBA;
	BtnActive  = this.LimeRGBA;
});