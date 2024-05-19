export const cvs = document.getElementById('canvas');
export const ctx = cvs.getContext('2d');
export const FontSize = (fs=> {
	ctx.save();
	ctx.font = `${fs}px DragonQuestFC,monospace`;
	const textWidth = ctx.measureText('　').width;
	ctx.restore();
	return fs * (fs/textWidth);
})(20);
ctx.font = `${FontSize}px DragonQuestFC,monospace`;
ctx.strokeStyle = ctx.fillStyle = 'white';