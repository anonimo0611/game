import {State} from './_state.js'

function show(button) {
	$('.panel').toggle()
	$(button).toggleClass('active',!!$(button.value).height())
}
function hide(button, e) {
	if (!State.isTitle
	 || e.target == button
	 || e.target.closest?.(button.value))
		return
	$(button.value).hide() && $(button).removeClass('active')
}

$on('load Start', ()=> $('.panel').hide())
$('.panelBtn').each((_,button)=> {
	$(window).on('click',e=> hide(button,e))
	$(button).on('click',e=> show(button,e))
})