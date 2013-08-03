if-on-time project
================

jQuery selectors
--------------

Obter número de linhas correspondentes aos horários:

`$("table[border='1'] tbody tr").length - 1`

Obter horário inicial e final

1. `$("table[border='1'] tbody tr:eq(1) td:eq(0) div font strong").html()`
2. `$("table[border='1'] tbody tr:eq(2) td:eq(0) div font strong").html()`

Assim por diante.

Obter disciplina abreviada

`$("table[border='1'] tbody tr:eq(1) td:eq(1) div font div:eq(0)").html()`

Obter sala

`$("table[border='1'] tbody tr:eq(1) td:eq(1) div font div:eq(1)").html()`

Obter código

`$("table[border='1'] tbody tr:eq(1) td:eq(1) div font div:eq(2)").html()`

-----------------------------------------------------------------------

Obter disciplina abreviada para comparar

`$("table[align='center'][cellspacing='4'] tbody tr:eq(1) td a:eq(0)").html()`

Ao comparar obter nome real da disciplina

`$("table[align='center'][cellspacing='4'] tbody tr:eq(1) td a:eq(2)").html()`

Obter nome do professor

`$("table[align='center'][cellspacing='4'] tbody tr:eq(1) td a:eq(3)").html()`

Obter número de cadeiras

`$("table[align='center'][cellspacing='4'] tbody tr").length - 1`
