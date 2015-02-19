//Modulos
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var WebTorrent = require('webtorrent');
var fs = require('fs');
var http = require('http');

var app = express();
var client = new WebTorrent();

var port= 3000;
//Configurar torrent cliente

function onTorrent(torrent){
  console.log("Descargando un nuevo torrent: " + torrent.name);
  torrent.files.forEach(function (file) {
    // Stream each file to the disk
    var source = file.createReadStream();
    fs.mkdir("./files/"+ torrent.name, function(){
      var destination = fs.createWriteStream("./files/"+ torrent.name + "/" + file.name);
      source.pipe(destination);
    });
  });
  console.log("Progreso: empezando...");
  torrent.on('download', function(){
    var progress = (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1);
    logReplace('Progreso: ' + progress + '% -- download speed: ' + prettysize(torrent.swarm.downloadSpeed()));
  });
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Obtener pagina principal
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Post de la pagina principal
app.post('/',function(req, res, next){
  if(req.body.newTorrentLink){
    client.add(req.body.newTorrentLink, onTorrent);
  }
  res.render('index',{title:'Express'});
});
server = http.createServer(app);
server.listen(port);
server.on('listening', function(){
  console.log("Servidor escuchando en el puerto " + port);
});
