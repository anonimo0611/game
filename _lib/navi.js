'use strict';
{
	const _click   = !window.ontouchstart ? 'click' : 'touchend';
	const [$w,$d]  = [$(window),$(document)];
	const rootElem = document.documentElement;
	const toggle   = document.createElement('button');
	const dqs      = sel=> document.querySelector(sel);
	const dqsAll   = sel=> document.querySelectorAll(sel);
	const header   = dqs('header');
	const navRoot  = dqs('header > nav');
	const navToc   = dqs('header > nav > .toc');

	(function() { // ナビゲーションのトグルボタン
		if (!header) return
		const ttlPrif = 'ナビゲーションを';
		const ttlSuff = '隠す|表示'.split('|');
		toggle.id     = 'nav-toggle';
		toggle.title  = ttlPrif + ttlSuff[1];
		toggle.textContent = toggle.title;
		toggle.addEventListener(_click, function() {
			const data   = navRoot.dataset.hidden;
			const hidden = !data || data == 'true';
			toggle.textContent = toggle.title;
			toggle.title = ttlPrif + ttlSuff[Number(!hidden)];
			header.dataset.hidden = hidden ? false : true;
			navRoot.dataset.hidden = hidden ? false : true;
		});
		header.prepend(toggle);
		$w.on(_click, e=> {
			(e.target != toggle) && !e.target.closest('header > nav')
				&& (navRoot.dataset.hidden = true)
				&& (toggle.title = ttlPrif + ttlSuff[1]);
		})
	})();

	// スクロール位置の見出しセクションに対応する目次項目を強調する
	(function() {
		if (!header) return;
		const getScrTop = _=> rootElem.scrollTop;
		const isNearly  = e=> e.s.offsetTop <= getScrTop();
		const elements  = [...dqsAll('main,section')].reverse().flatMap(s=> {
				const  a = s.id && header.querySelector(`[href="#${s.id}"]`) || null;
				return a ? {s,a} : [];
			});
		let lstA = null;
		function highlight() {
			const e = (getScrTop() >= rootElem.scrollHeight-innerHeight - 5)
				? elements[0]
				: elements.find(isNearly);
			if (e && e.a != lstA) {
				lstA && lstA.classList.remove('current');
				if (header.offsetHeight < header.scrollHeight)
					header.scroll(0, e.a.parentNode.offsetTop);
				e.a.classList.add('current');
				lstA = e.a;
			}
		}
		$('header').on(_click, 'a[href^="#"]', function(e) { // 見出し位置へスクロール
			const h = $('#'+this.href.split('#')[1]).get(0);
			if (!h) return;
			e.preventDefault();
			h.scrollIntoView();
		});
		$('header').on('focus', 'a[href]', function(e) { // フォーカスされたらナビ表示
			navRoot.dataset.hidden = 'false';
		});
		if (elements.length == 1) return;
		if (rootElem.scrollTop == 0) {
			lstA = $(navToc).find('.to-top a').addClass('current').get(0);
		}
		$d.on('scroll', highlight);
		$w.on('resize', highlight).trigger('resize');
	})();

	// ビューポートの高さに応じて高さを指定
	if (header) {
		const onResize = ()=> {
			if (toggle.offsetHeight) {
				header.style.height = '';
				return;
			}
			const offsetTop = header.parentNode.offsetTop;
			header.style.height = `calc(${innerHeight - offsetTop}px - 3em)`;
		}
		$w.on('resize', onResize).trigger('resize');
	}

	// 見出し位置へのリンクをコピー
	$w.on(_click, e=> {
		if (!document.execCommand || e.target.tagName != 'A') return;
		if (!e.target.matches('[href^="#"].fragment')) return;
		e.preventDefault();
		e.target.scrollIntoView();
		const input = $(`<input type="text" value="${e.target.href}"
			style="position:absolute;left:-1000px;top:-1000px">`).get(0);
		document.body.appendChild(input);
		input.select();document.execCommand('copy');
		input.remove();
	});
}