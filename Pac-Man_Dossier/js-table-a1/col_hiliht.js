﻿/** @type {HTMLTableElement} Tbl */
const Tbl = dqs('#table-a1');
const Trs = [...Tbl.getElementsByTagName('tr')]
const mouseover = (e, x)=> {
	removeClasses()
	const target = e.target
	/** @type {HTMLTableElement} table */
	const table  = target.closest('table')
	const thead  = table.querySelector('thead')
	table.querySelectorAll('col')[x].classList.add('hlight')
	table.tHead.querySelectorAll('th')[x].classList.add('hlight')
	if (thead)
		for (const row of thead.querySelectorAll('tr'))
			if (row.cells[x])
				row.cells[x].classList.add('hlight')
}
const removeClasses = ()=> {
	if ($('#balloon').length)
		$('#balloon').hide()

	const hilightedThs  = dqsAll('thead td.hlight, th.hlight')
	const hilightedCols = dqsAll('col.hlight');
	for (const ths of hilightedThs)  ths.classList.remove('hlight')
	for (const col of hilightedCols) col.classList.remove('hlight')
}
/*Trs[0].querySelectorAll('th').forEach(()=>
	Tbl.insertBefore(document.createElement('col'), Tbl.firstChild)
)*/
Trs.forEach((row, y)=>
	Array.from(row.cells).forEach((cell, x)=>
		cell.addEventListener('mouseover', e=> mouseover(e, x, y))
	)
)
Tbl.addEventListener('mouseout', removeClasses)