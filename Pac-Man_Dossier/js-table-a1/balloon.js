/** @type {HTMLTableElement} Tbl */
const Tbl = document.querySelector('#table-a1')
/** @type {HTMLDivElement} Bal */
const Bal = $('<div id="a1-balloon" class="balloon"></div>').hide().get(0)

function balloon(e) {
	/** @type {HTMLTableCellElement} Tbl */
	const cell     = e.target.closest('td')
	const cellIdx  = cell.cellIndex
	const rowCell  = cell.parentNode.cells[0]
	const colCell  = Tbl.tHead.rows[0].cells[cellIdx]
	const firstTR  = Tbl.tBodies[0].rows[0]
	const tableW   = Tbl.offsetWidth
	const top      = Tbl.offsetTop + cell.offsetTop
	const left     = cell.offsetLeft
	const cellHW   = cell.offsetWidth/2
	const rowTxt   = rowCell.innerText
	const colTxt   = colCell.innerText
	const taleSize = getComputedStyle(Bal).getPropertyValue('--tale')

	$(Bal).attr('data-side', rowTxt == '1' ? 'bottom' : 'top').show()
	$(Bal).text(`Lv.${rowTxt}` + (cellIdx > 0 ? ` ${colTxt}` : ''))

	const h = (rowCell.parentNode == firstTR)
		? `${cell.offsetHeight}px + ${taleSize}`
		: `${-Bal.offsetHeight}px - ${taleSize}`

	$(Bal).css('top', `calc(${top}px + ${h})`);
	if (tableW < left + Bal.offsetWidth + cell.offsetHeight) {
		const ofstLeft = left - (tableW - Bal.offsetWidth) + cellHW - 2;
		$(Bal)
		.css('--taleOffsetLeft',`calc(${ofstLeft}px - ${taleSize})`)
		.css('left', 'auto')
		.css('right','0px')
	} else {
		$(Bal)
		.css('--taleOffsetLeft',`calc(${cellHW - 2}px - ${taleSize})`)
		.css('left', `${left}px`)
		.css('right','auto')
	}
}
{
	const ClickEv = window.ontouchstart? 'touchend' : 'mousedown'
	const hide = e=> {
		!e.target.closest(`#${Tbl.id} td`) && $(Bal).hide()
	}
	Tbl.parentNode.insertBefore(Bal, Tbl.nextSibling)
	$(Tbl, 'td').on(ClickEv, balloon)
	$(window).on(ClickEv, hide)
}