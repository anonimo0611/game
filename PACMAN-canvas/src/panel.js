import {State} from './_state.js'

function show(btn) {
	$('.panel').toggle()
	$(btn).toggleClass('active',!!$(btn.value).height())
}
function hide(btn, e) {
	if (!State.isTitle
	 || e.target == btn
	 || e.target.closest?.(btn.value))
		return
	$(btn.value).hide() && $(btn).removeClass('active')
}

$on('load Start', ()=> $('.panel').hide())
$('.panelBtn').each((_,btn)=> {
	$on('click',      e=> hide(btn,e))
	$(btn).on('click',e=> show(btn,e))
})