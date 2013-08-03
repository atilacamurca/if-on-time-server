
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/if-on-time.sqlite', sqlite3.OPEN_READONLY);

var rs = db.get("select hash from horarios where hash = ?",
   ['dc1o'],
   function(err, row) {
      console.dir(row);
   }
);
console.dir(rs);


db.close();