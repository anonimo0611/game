const ClickEv = window.ontouchstart? 'touchend' : 'click'
const Toggle  = document.createElement('button')
const Header  = dqs('header')
const NavRoot = dqs('header > nav')
const NavToc  = dqs('header > nav > .toc')

// ナビゲーションのトグルボタン
!function() {
	if (!Header) return
	const prif = 'ナビゲーションを'
	const suff = ['隠す','表示']
	Toggle.id     = 'nav-toggle'
	Toggle.title  = prif+suff[1]
	Toggle.textContent = Toggle.title
	Toggle.addEventListener(ClickEv, ()=> {
		const data   = NavRoot.dataset.hidden
		const hidden = !data || data == 'true'
		Toggle.textContent = Toggle.title
		Toggle.title = prif+suff[+!hidden]
		Header.dataset.hidden  = !hidden
		NavRoot.dataset.hidden = !hidden
	})
	Header.prepend(Toggle)
	$on(ClickEv, e=> {
		(e.target != Toggle) && !e.target.closest('header > nav')
			&& (NavRoot.dataset.hidden = true)
			&& (Toggle.title = prif+suff[1])
	})
}()

// スクロール位置の見出しに対応する目次項目の強調
// および目次項目のクリックで見出しジャンプ
!function() {
	if (!Header) return
	const elements  = [...dqsAll('main,section')].reverse().flatMap(s=> {
		const  a = s.id && Header.querySelector(`[href="#${s.id}"]`) || null
		return a ? {s,a}:[]
	})
	let lstA = dRoot.scrollTop > 0
		? null
		: $(NavToc).find('.to-top [href]').addClass('current').get(0)

	if (elements.length > 1) {
		const isNearly  = el=> el.s.offsetTop <= dRoot.scrollTop
		const highlight = ()=> {
			const el = (dRoot.scrollTop >= dRoot.scrollHeight-innerHeight-5)
				? elements[0]
				: elements.find(isNearly)
			if (!el || el.a == lstA)
				return
			if (Header.offsetHeight < Header.scrollHeight)
				Header.scroll(0, el.a.parentNode.offsetTop)
			el.a.classList.add('current')
			lstA && lstA.classList.remove('current')
			lstA = el.a
		}
		$on('scroll resize', highlight)
		highlight()
	}
	// 見出し位置へスクロール
	$('header').on(ClickEv, '[href^="#"]', e=> {
		const h = $('#'+e.target.href.split('#')[1]).get(0)
		if (h) {
			e.preventDefault()
			h.scrollIntoView()
		}
	})
	// フォーカスされたらナビ表示
	$('header').on('focus', 'a[href]', ()=> {
		NavRoot.dataset.hidden = 'false'
	})
}()

// ビューポートの高さに応じて高さを指定
Header && $on('resize', ()=> {
	if (Toggle.offsetHeight) {
		Header.style.height = ''
		return;
	}
	const offsetTop = Header.parentNode.offsetTop;
	Header.style.height = `calc(${innerHeight-offsetTop}px - 3em)`
}).trigger('resize')

// 見出しへのリンクをコピー
$('[href^="#"].fragment').on(ClickEv, e=> {
	if (!document.execCommand) return
	e.preventDefault()
	e.target.scrollIntoView()
	const href  = e.target.href
	const style = 'style="position:absolute;left:-1000px;top:-1000px"'
	const input = $(`<input type="text" value="${href}" ${style}>`).get(0)
	document.body.appendChild(input)
	input.select();document.execCommand('copy')
	input.remove()
});