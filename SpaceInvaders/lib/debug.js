const debugField = byId('debug');
function putLog(...v) {
	debugField.textContent = v.map(v=> JSON.stringify(v)).join(', ');
}