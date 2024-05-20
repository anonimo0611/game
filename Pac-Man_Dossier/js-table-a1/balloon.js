const _click = !window.ontouchstart ? 'mousedown' : 'touchend';
const table  = document.querySelector('#table-a1');
const bal    = $('<div id="a1-balloon" class="balloon"></div>').hide().get(0);
function balloon(e) {
	const cell     = e.target.closest('td');
	const cellIdx  = cell.cellIndex;
	const left     = cell.offsetLeft;
	const top      = table.offsetTop + cell.offsetTop;
	const tableW   = table.offsetWidth;
	const firstTR  = table.tBodies[0].rows[0];
	const colCell  = table.tHead.rows[0].cells[cellIdx];
	const rowCell  = cell.parentNode.cells[0];
	const cellHW   = cell.offsetWidth / 2;
	const rowTxt   = rowCell.innerText;
	const colTxt   = colCell.innerText;
	const taleSize = getComputedStyle(bal).getPropertyValue('--tale');

	$(bal).attr('data-side', rowTxt == '1' ? 'bottom' : 'top').show();
	$(bal).text(`Lv.${rowTxt}` + (cellIdx > 0 ? ` ${colTxt}` : ''));

	const h = (rowCell.parentNode == firstTR)
		? `${cell.offsetHeight}px + ${taleSize}`
		: `${-bal.offsetHeight}px - ${taleSize}`;

	bal.css('top', `calc(${top}px + ${h})`);
	if (tableW < left + bal.offsetWidth + cell.offsetHeight) {
		const offsetLeft = left - (tableW - bal.offsetWidth) + cellHW - 2;
		bal
		.css('--taleOffsetLeft',`calc(${offsetLeft}px - ${taleSize})`)
		.css('left', 'auto')
		.css('right', '0px');
	} else {
		bal
		.css('--taleOffsetLeft',`calc(${cellHW - 2}px - ${taleSize})`)
		.css('left', `${left}px`)
		.css('right', 'auto');
	}
}
function hide(e) {
	if (!e.target.closest(`#${table.id} td`)) {
		$(bal).hide();
	}
}
table.parentNode.insertBefore(bal, table.nextSibling);
$(table, 'td').on(_click, balloon);
$(window).on(_click, hide);