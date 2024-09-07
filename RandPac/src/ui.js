import {Scene}     from './scene.js';
import {Maze}      from './maze.js';
import {Container} from './_main.js';
import {updateMap} from './_constants.js';

export let isLoading = true;

const [board,lnkAnchor,copyTemp,infoBox,seedInput,helpBtn]=
	byIds('board|link|copyTemp|infoBox|seedInput|helpBtn');

const loadingToggle = bool=> {
	$('#loading').toggle();
	dBody.dataset.loaded = !(isLoading=bool);
};
$ready(_=> {
	$('.sizeBtn').on('click', resizeGrid);
	$('#sizeBtn'+MAZE_IDX).prop({disabled:true});
	loadingToggle(false);
})
.on('resize', _=> { // Fit to the viewport
	const w = $(window).width()  / board.offsetWidth;
	const h = $(window).height() / board.offsetHeight;
	const s = min(w, h) * 0.98;
	$(board).css('--scale', min(s, 1));
})
.trigger('resize');

export const InfoBox = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$(Scene) .on({change: InfoBox.#onChangeScene});
		lnkAnchor.on({click:  InfoBox.#copyURL});
		seedInput.on({blur:   InfoBox.#restoreSeedVal});
		seedInput.on({keydown:InfoBox.#restrictInput});
	}
	#displayed = false;
	get displayed() {
		return InfoBox.#displayed;
	}
	#setSeed(e) {
		const url = location.href.replace(/[^/]+$/,'')
			+`?seed=${seedInput.value=Maze.Seed}&size=${MAZE_IDX}`;
		lnkAnchor.href = copyTemp.value = url;
		setTimeout(_=> seedInput.select(), 200);
	}
	#copyURL(e) {
		e.preventDefault();
		const [lnk, cls]= [lnkAnchor, 'copied'];
		$(copyTemp).focus().select();
		if (lnk.classList.contains(cls) == false) {
			lnk.classList.add(cls);
			document.execCommand('copy');
			setTimeout(_=> $(lnk).removeClass(cls).focus(), 1000);
		}
	}
	#onChangeScene() {
		$off('.INFO');
		if (Scene.isTitle) {
			$on('click.INFO',  InfoBox.#onClick);
			$on('keydown.INFO',InfoBox.#onKeydown);
		}
	}
	#showToggle() {
		 infoBox.classList.toggle('show');
		(InfoBox.#displayed = !InfoBox.displayed)
			? InfoBox.#setSeed()
			: Container.focus();
	}
	#onKeydown(e) {
		if (e.key != 'Escape') return;
		!InfoBox.displayed && dqs('.ctrl:focus')
			? Container.focus()
			: InfoBox.#showToggle();
	}
	#onClick(e) {
		if (e.target == helpBtn
		 || InfoBox.displayed && !e.target.closest('#infoBox'))
			InfoBox.#showToggle();
	}
	#restoreSeedVal() {
		seedInput.value === '' && (seedInput.value = Maze.Seed);
	}
	#restrictInput(e) {
		/^Arrow(Up|Down)$/.test(e.key)
			&& e.preventDefault();
		!e.ctrlKey && !e.metaKey && /^[\x20-\x2F\x3A-\x7E]$/.test(e.key)
			&& e.preventDefault();
	}
};
const resizeGrid = function() {
	if (isLoading || !Scene.isTitle) return;
	loadingToggle(true);
	dqs('.sizeBtn:disabled').disabled = !(this.disabled=true);
	updateMap(+this.dataset.idx).trigger('Resize');
	setTimeout(_=> loadingToggle(false), 200);
};