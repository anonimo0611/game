import {State} from './_state.js'

function show(btn) {
	$('.panel').toggle()
	$(btn).toggleClass('active',$(btn.value).is(':visible'))
}
function hide(btn, e) {
	if (!State.isTitle
	 || e.target == btn
	 || e.target.closest(btn.value))
		return
	$(btn.value).hide() && $(btn).removeClass('active')
}

$on('DOMContentLoaded Start', ()=> $('.panel').hide())
$('.panelBtn').each((_,btn)=> {
	$on('click',      e=> hide(btn,e))
	$(btn).on('click',e=> show(btn,e))
})