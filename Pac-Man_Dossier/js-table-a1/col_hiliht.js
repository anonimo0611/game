const table = dqs('#table-a1');
const mouseover = (e, x, y)=> {
	removeClasses();
	const target = e.target;
	const table  = target.closest('table');
	const thead  = table.qs('thead');
	table.find('colgroup')[x].addClass('hlight');
	if (thead)
		for (const row of thead.find('tr'))
			if (row.cells[x]) row.cells[x].addClass('hlight');
}
const removeClasses = ()=> {
	if ($('#balloon').length)
		$('#balloon').hide();

	const hilightedThs  = dqsAll('thead td.hlight, th.hlight');
	const hilightedCols = dqsAll('colgroup.hlight');
	for (const ths of hilightedThs)  ths.removeClass('hlight');
	for (const col of hilightedCols) col.classList.remove('hlight');
}
Array.from(table.rows[0].cells).forEach(()=> 
	table.insertBefore(makeElm('colgroup'), table.firstChild)
);
Array.from(table.rows).forEach((row, y)=> 
	Array.from(row.cells).forEach((cell, x)=> 
		cell.addEventListener('mouseover', e=>mouseover(e, x, y))
	)
);
table.addEventListener('mouseout', removeClasses);