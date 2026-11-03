import {sizeRng,brightRng,resetBtn,onResize} from './_constants.js'

const SETTINGS_KEY = 'anopac-atlas'

$('input').on({input:saveData})

function triggerInputs() {
	$('input[type=range]').trigger('input')
}

function saveData() {
	const data = Object.create(null)
	document.querySelectorAll('input').forEach(i=> {
		if (i.type == 'range') data[i.id] = i.value
	})
	localStorage[SETTINGS_KEY] = JSON.stringify(data)
}

function restoreData() {
	if (!localStorage[SETTINGS_KEY]) return
	const data = JSON.parse(localStorage[SETTINGS_KEY])
	document.querySelectorAll('input').forEach(i=> {
		if (i.type == 'range') i.value = data[i.id]
	})
	triggerInputs()
}

function onLoad() {
	restoreData()
	document.body.style.opacity = '1'
}

function onReset() {
	Array.from(document.forms, f=> f.reset())
	triggerInputs()
}

function onChangeBrightness() {
	const {value:v}= brightRng
	Fg.canvas.style.backgroundColor = `rgb(${v}% ${v}% ${v}%)`
}

$(onLoad)
$(resetBtn) .on({click:onReset})
$(sizeRng)  .on({input:onResize})
$(brightRng).on({input:onChangeBrightness})