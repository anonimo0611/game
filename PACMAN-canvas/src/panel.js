import {State} from './_state.js'
new class {
    constructor() {
        $on('load Start', ()=> $('.panel').hide())
        $('.panelBtn').each((_,btn)=> {
            $on('click',      e=> this.hide(btn,e))
            $(btn).on('click',e=> this.show(btn,e))
        })
    }
    show(btn) {
        $('.panel').toggle()
        $(btn).toggleClass('active',$(btn.value).is(':visible'))
    }
    hide(btn, e) {
        if (!State.isTitle
         || e.target == btn
         || e.target.closest(btn.value))
            return
        $(btn.value).hide() && $(btn).removeClass('active')
    }
}