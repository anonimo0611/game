export function hsl(h,s,l,a=1) {
	return `hsl(${h} ${s}% ${l}% /${a})`;
}
export function rgba(r,g,b,a=1) {
	return `rgba(${r} ${g} ${b} /${a})`;
}
export function rgbaPct(r,g,b,a=1) {
	return `rgba(${r}% ${g}% ${b}% /${a})`;
}