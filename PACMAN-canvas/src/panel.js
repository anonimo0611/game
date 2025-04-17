import {State} from './state.js'

function show(button) {
	$('.panel').toggle()
	$(button).toggleClass('active',$(button.value).is(':visible'))
}
function hide(button, e) {
	if (!State.isTitle
	 || e.target == button
	 || e.target.closest?.(button.value))
		return
	$(button.value).hide()
	$(button).removeClass('active')
}
$on({load_Start:()=> $('.panel').hide()})
$('.panelBtn').each((_,button)=> {
	$(window).on({pointerdown:e=> hide(button,e)})
	$(button).on({pointerdown:e=> show(button,e)})
})