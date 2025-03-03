if (document.body.id == 'appendix-a1') {
	const dWrap = byId('a1-wrapper');
	const fitViewport = ()=> {
		const s = Math.min(
			innerWidth  / dWrap.offsetWidth,
			innerHeight / dWrap.offsetHeight);
		dWrap.style.transform = `scale(${s * .98})`;
	}
	fitViewport();
	window.addEventListener('resize', fitViewport);
}