
var jsdom = require("jsdom");
var fs = require("fs");
var Iconv  = require('iconv').Iconv;
var codes = require('codes');
var jquery = fs.readFileSync("./js/jquery.js", "utf-8");
var dias_semana = [
   'domingo',
   'segunda',
   'terça',
   'quarta',
   'quinta',
   'sexta',
   'sabado'
];

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/if-on-time.sqlite');

db.run("DELETE FROM horarios");

jsdom.env({
   file: "/tmp/42cbf71450aba61935b1640e5698b811",
   src: [jquery],
   config: { encoding: 'binary' },
   done: function (errors, window) {
      var $ = window.$;
      
      /*var horario = $("table[border='1'] tbody tr:eq(1) td:eq(0) div font").children().html();
      console.log(horario);*/
      //$("head").remove("meta");
      //$("head").append('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">')
      //console.log($("head meta").attr("content"));
      //var iconv = new Iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE');
      
      // disciplinas
      var num_linhas_dis = $("table[align='center'][cellspacing='4'] tbody tr").length;
      var disciplinas = [];
      for (var i = 1; i < num_linhas_dis; i++) {
         var abr_disc = $("table[align='center'][cellspacing='4'] tbody tr:eq("+i+") td a:eq(0)").html().split(" - ")[0];
         var disciplina = $("table[align='center'][cellspacing='4'] tbody tr:eq("+i+") td a:eq(2)").html().split(" - ")[0];
         var prof = $("table[align='center'][cellspacing='4'] tbody tr:eq("+i+") td a:eq(3)").html();
         //var ascii = codes.convert(disciplina, 'UTF-8', 'ISO-8859');
         disciplinas.push({
            abr_disc  : abr_disc,
            disc      : disciplina,
            prof      : prof
         });
      }
      console.dir(disciplinas);
      return;
      
      var num_linhas_hor = $("table[border='1'] tbody tr").length;
      var hash = (parseInt(Math.random() * 1000000)).toString(36);
      // linha 0 representa o cabeçalho da tabela
      for (var i = 1; i < num_linhas_hor; i++) {
         var hor = $("table[border='1'] tbody tr:eq("+i+") td:eq(0) div font strong").html();
         array = hor.split("~");
         var horario_inicio = array[0],
            horario_fim = array[1];
         //console.log("hor ini: " + array[0] + ", hor fim: " + array[1]);
         
         // obter dados das aulas do horario
         // 5 representa os dias da semana
         for (var j = 1; j < 6; j++) {
            var abr_disc = $("table[border='1'] tbody tr:eq("+i+") td:eq("+j+") div font div:eq(0)").html();
            var index = getDisciplina(disciplinas, abr_disc);
            if (index === -1) { continue; }
            
            var sala = $("table[border='1'] tbody tr:eq("+i+") td:eq("+j+") div font div:eq(1)").html();
            var codigo = $("table[border='1'] tbody tr:eq("+i+") td:eq("+j+") div font div:eq(2)").html();
            
            //console.log("\tDisciplina: " + abr_disc + ", sala: " + sala + ", codigo: " + codigo);
            var sql = "INSERT INTO horarios (disciplina, horario_inicio, " +
               "horario_fim, sala, professor, dia_da_semana, hash) VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            var params = [
               disciplinas[index].disc,
               horario_inicio,
               horario_fim,
               sala,
               disciplinas[index].prof,
               j, // dia da semana
               hash
            ];
               
            db.run(sql, params);
         }
      }
      db.close();
   }
});

function getDisciplina(disciplinas, abr_disc) {
   for (var i = 0; i < disciplinas.length; i++) {
      if (disciplinas[i].abr_disc === abr_disc) {
         return i;
      }
   }
   return -1;
}
