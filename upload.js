
var fs = require("fs"),
   util = require("util"),
   jsdom = require("jsdom"),
   jquery = fs.readFileSync("./js/jquery.js", "utf-8"),
   formidable = require("formidable"),
   sh = require('execSync'),
   jquery = fs.readFileSync("./js/jquery.js", "utf-8"),
   swig = require('swig');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/if-on-time.sqlite', sqlite3.OPEN_READWRITE);

/*
 * Handle file upload
 */
exports.upload_file = function (req, res) {
   var hash = (parseInt(Math.random() * 1000000)).toString(36);
   db.get("select hash from horarios where hash = ?", [hash], function(err, row) {
      if (row) {
         res.writeHead(500, {'content-type': 'text/html; charset=UTF-8'});
         res.end("Erro ao carregar página, tente outra vez.");
         return;
      }
   });
   
   // parse a file upload
   var form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, files) {
      var utf8_file = files.upload.path + '-utf8';
      var cmd = 'iconv -f iso-8859-1 -t utf-8 ' + files.upload.path
         + '> ' + utf8_file;
      sh.run(cmd);
      
      res.writeHead(200, {'content-type': 'text/html; charset=UTF-8'});
      try {
         save_to_database(utf8_file, hash);
         fs.unlinkSync(files.upload.path);
         fs.unlinkSync(utf8_file);
         var template  = require('swig');
         var tmpl = swig.compileFile(process.cwd() + '/result.html');
         var result = tmpl.render({
             codigo: hash
         });
         
         res.end(result);
      } catch (error) {
         res.write("Ocorreu um erro inesperado!\n\n");
         res.end(error.toString());
      }
   });
}

function save_to_database(file, hash) {
   // ler arquivo HTML submetido
   jsdom.env({
      file: file,
      src: [jquery],
      config: { encoding: 'binary' },
      done: function (errors, window) {
         var $ = window.$;
         
         // obtem o número de disciplinas e cria um array de disciplinas
         var num_linhas_dis = $("table[align='center'][cellspacing='4'] tbody tr").length;
         var disciplinas = [];
         for (var i = 1; i < num_linhas_dis; i++) {
            var abr_disc = $("table[align='center'][cellspacing='4'] tbody tr:eq("+i+") td a:eq(0)").html().split(" - ")[0];
            var disciplina = $("table[align='center'][cellspacing='4'] tbody tr:eq("+i+") td a:eq(2)").html().split(" - ")[0];
            var prof = $("table[align='center'][cellspacing='4'] tbody tr:eq("+i+") td a:eq(3)").html();
            disciplinas.push({
               abr_disc  : abr_disc,
               disc      : disciplina,
               prof      : prof
            });
         }
         
         // linhas referentes aos horários
         var num_linhas_hor = $("table[border='1'] tbody tr").length;
         // linha 0 representa o cabeçalho da tabela
         for (var i = 1; i < num_linhas_hor; i++) {
            var hor = $("table[border='1'] tbody tr:eq("+i+") td:eq(0) div font strong").html();
            array = hor.split("~");
            var horario_inicio = array[0],
               horario_fim = array[1];
            
            // obter dados das aulas do horario
            // 5 representa os dias da semana
            for (var j = 1; j < 6; j++) {
               var abr_disc = $("table[border='1'] tbody tr:eq("+i+") td:eq("+j+") div font div:eq(0)").html();
               var index = get_disciplina(disciplinas, abr_disc);
               if (index === -1) { continue; }
               
               var sala = $("table[border='1'] tbody tr:eq("+i+") td:eq("+j+") div font div:eq(1)").html();
               var codigo = $("table[border='1'] tbody tr:eq("+i+") td:eq("+j+") div font div:eq(2)").html();
               
               // insere o horario no banco de dados sqlite
               var sql = "INSERT INTO horarios (disciplina, horario_inicio, " +
                  "horario_fim, sala, professor, dia_da_semana, hash) " +
                  "VALUES (?, ?, ?, ?, ?, ?, ?)";
               
               var params = [
                  disciplinas[index].disc,
                  horario_inicio,
                  horario_fim,
                  sala,
                  disciplinas[index].prof,
                  j, // dia da semana
                  hash
               ];
                  
               db.run(sql, params, function(err) {
                  if (err) { throw err; }
               });
            }
         }
      }
   });
}

/**
 * Retorna o indice da abreviação da disciplina (abr_disc) ou -1 caso não encontre.
 */
function get_disciplina(disciplinas, abr_disc) {
   for (var i = 0; i < disciplinas.length; i++) {
      if (disciplinas[i].abr_disc === abr_disc) {
         return i;
      }
   }
   return -1;
}

function exists_hash(hash) {
   var exists = null;
   db.get("select hash from horarios where hash = ?", [hash], function(err, row) {
      if (!err) {
         exists = row.hash;
      }
   });
   return exists;
}