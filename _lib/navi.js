const Toggle  = document.createElement('button')
const Header  = dqs('header')
const NavRoot = dqs('header > nav')
const NavToc  = dqs('header > nav > .toc')

// ビューポートの高さに応じてヘッダーの高さを調整
Header && $on('resize', ()=> {
	if (Toggle.offsetHeight) {
		Header.style.height = ''
		return;
	}
	const offsetTop = document.body.offsetTop;
	Header.style.height = `calc(${innerHeight-offsetTop}px - 3em)`
}).trigger('resize')

// ナビゲーションのトグルボタン
!function() {
	if (!Header) return
	const prif   = 'ナビゲーションを'
	const suff   = ['隠す','表示']
	Toggle.id    = 'nav-toggle'
	Toggle.title = prif+suff[1]
	Toggle.textContent = Toggle.title
	Toggle.addEventListener('click', ()=> {
		const data   = NavRoot.dataset.hidden
		const hidden = !data || data == 'true'
		Toggle.textContent = Toggle.title
		Toggle.title = prif+suff[+!hidden]
		Header.dataset.hidden  = !hidden
		NavRoot.dataset.hidden = !hidden
	})
	Header.prepend(Toggle)
	$on('click', e=> {
		(e.target != Toggle) && !e.target.closest('header > nav')
			&& (NavRoot.dataset.hidden = true)
			&& (Toggle.title = prif+suff[1])
	})
}()

// スクロールに応じて目次のアンカーを強調
;(()=> {
	const dRoot  = document.documentElement
	const secs   = document.querySelectorAll('#main-content,section[id]')
	const navMap =  /**@type {Map<HTMLElement,HTMLAnchorElement>}*/(new Map)
	const emToPx = (/**@type {number}*/em)=> em * parseFloat(getComputedStyle(dRoot).fontSize)

	const navEntry = /** @type {[HTMLElement,HTMLAnchorElement][]}*/([])
	secs.forEach(sec=> {
		const target = sec.querySelector('h1,h2,h3') || sec
		const a = Header.querySelector(`[href="#${sec.id}"]`)
		a && navEntry.push([target,a])
		a && navMap.set(target,a)
	})

	/** @type {?HTMLAnchorElement} */
	let currentA = dqs('.to-top > a[href]')
	    currentA?.classList.add('current')

	const updateHighlight = anchor=> {
		if (!anchor || anchor === currentA) return
		currentA?.classList.remove('current')
		anchor.classList.add('current')
		currentA = anchor
		anchor.scrollIntoView({behavior:'auto',block:'nearest'})
	}

	const observer = new IntersectionObserver(entries=> {
		const
		visibleEntry = entries.find(e=> e.isIntersecting)
		visibleEntry && updateHighlight(navMap.get(visibleEntry.target))
	}, {
		rootMargin: `-${emToPx(1)}px 0px -95% 0px`,
		threshold: [0, 1.0]
	})

	navMap.forEach((_, target)=> observer.observe(target))
	Header.addEventListener('click', e=> {
		/** @type {HTMLAnchorElement} */
		const a = e.target.closest('a')
		a?.hash && updateHighlight(a)
	})
	let scrollTimeout = 0
	function onScroll() {
		clearTimeout(scrollTimeout)
		scrollTimeout = setTimeout(syncNavigation, 100)
	}
	function syncNavigation() {
		// 最下部判定
		if ((window.innerHeight+window.scrollY) >= dRoot.scrollHeight-2) {
			updateHighlight(navEntry[navEntry.length-1][1])
			return
		}
		// 現在位置の再計算
		const topMargin = emToPx(1)
		const currentTarget = navEntry.find(([target])=> {
			const  rect = target.getBoundingClientRect()
			return rect.top <= topMargin+10 && rect.bottom >= topMargin
		})
		currentTarget
			? updateHighlight(navMap.get(currentTarget))
			: window.scrollY === 0 && updateHighlight(navEntry[0][1])
	}
	addEventListener('scroll', onScroll, {passive:true})
})()

// 見出し位置へスクロール
$('header').on('click', 'a[href^="#"]', e=> {
	const a = /**@type {?HTMLAnchorElement}*/(e.target)
	const h = $(a.hash).get(0)
	if (h) {
		e.preventDefault()
		history.replaceState(null,'',a.hash);
		h.scrollIntoView()
	}
})

// フォーカスされたらナビ表示
$('header').on('focus', 'a[href]', ()=> {
	NavRoot.dataset.hidden = 'false'
})

// 見出しへのリンクをコピー
$('a[href^="#"].fragment').on('click', e=> {
	const a = /**@type {?HTMLAnchorElement}*/(e.target)
	if (!document.execCommand) return
	e.preventDefault()
	e.target.scrollIntoView()
	const href  = a.href
	const style = 'style="position:absolute;left:-1000px;top:-1000px"'
	const input = $(`<input type="text" value="${href}" ${style}>`).get(0)
	document.body.appendChild(input)
	input.select();document.execCommand('copy')
	input.remove()
});