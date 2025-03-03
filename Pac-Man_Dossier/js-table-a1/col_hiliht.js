const Tbl = dqs('#table-a1');
const mouseover = (e, x)=> {
	removeClasses()
	const target = e.target
	const table  = target.closest('table')
	const thead  = table.querySelector('thead')
	table.querySelectorAll('colgroup')[x].classList.add('hlight')
	if (thead)
		for (const row of thead.querySelectorAll('tr'))
			if (row.cells[x])
				row.cells[x].classList.add('hlight')
}
const removeClasses = ()=> {
	if ($('#balloon').length)
		$('#balloon').hide()

	const hilightedThs  = dqsAll('thead td.hlight, th.hlight')
	const hilightedCols = dqsAll('colgroup.hlight');
	for (const ths of hilightedThs)  ths.classList.remove('hlight')
	for (const col of hilightedCols) col.classList.remove('hlight')
}
Array.from(Tbl.rows[0].cells).forEach(()=>
	Tbl.insertBefore(document.createElement('colgroup'), Tbl.firstChild)
)
Array.from(Tbl.rows).forEach((row, y)=>
	Array.from(row.cells).forEach((cell, x)=>
		cell.addEventListener('mouseover', e=> mouseover(e, x, y))
	)
)
Tbl.addEventListener('mouseout', removeClasses)