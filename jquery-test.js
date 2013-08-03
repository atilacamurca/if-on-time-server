
var $ = require('jquery'),
   jsdom = require('jsdom'),
   fs = require('fs');

//fs.readFile('/home/atila/horario.html', {encoding: 'utf-8'}, function(err, data){
jsdom.env('/home/atila/horario.html', function(err, window){
   if (err) throw err;
   
   var html = $.create(window);
   var horario = $("table[border='1'] tbody tr:eq(1) td:eq(0) div font").children().html();
   console.log(horario);
});