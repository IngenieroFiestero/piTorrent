//Modulos
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var WebTorrent = require('webtorrent');
var fs = require('fs');
var http = require('http');
var Torrent = require('./node_modules/webtorrent/lib/torrent');
var io = require('socket.io');

var idiom ={};
var app = express();
var client = new WebTorrent();

var port= 3000;
//Configurar torrent cliente
var vector = [];

function showTorrentList(){
  console.log("Lista de torrents: ");
  client.torrents.forEach(function(val,i){
    console.log(client.torrents[i].name + " -- Descargado: " + (100*client.torrents[i].downloaded / client.torrents[i].parsedTorrent.length).toFixed(1) +" %");
  });
  console.log("----------");
};
function generateVector(){
  vector = [];
  client.torrents.forEach(function(val,i){
    var porcentaje = (100*client.torrents[i].downloaded / client.torrents[i].parsedTorrent.length).toFixed(1);
    vector.push(client.torrents[i].name + " -- " + porcentaje + " %");
  });
};

function onTorrent(torrent){
  generateVector();
  websocket.emit('torrentList', JSON.stringify(vector));
  torrent.porcentaje = 0;
  console.log("Descargando un nuevo torrent: " + torrent.name);
  console.log("----------");
  showTorrentList();
  torrent.files.forEach(function (file) {
    var source = file.createReadStream();
    fs.mkdir("./files/"+ torrent.name, function(){
      var destination = fs.createWriteStream("./files/"+ torrent.name + "/" + file.name);
      source.pipe(destination);
    });
  });
  torrent.swarm.on('download', function(){
    generateVector();
    var progress = (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1);
    if(progress >= 100 && torrent.porcentaje < 100){
      showTorrentList();
      torrent.porcentaje = 100;
    }else if(progress >=25 && torrent.porcentaje < 25){
      showTorrentList();
      torrent.porcentaje = 25;
    }else if(progress >=50 && torrent.porcentaje < 50){
      showTorrentList();
      torrent.porcentaje = 50;
    }else if(progress >=75 && torrent.porcentaje < 75){
      showTorrentList();
      torrent.porcentaje = 75;
    };
    websocket.emit('torrentList', JSON.stringify(vector));
  });
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Obtener pagina principal
app.get('/', function(req, res, next) {
  if(req.cookies.idiom == 'es'){
    res.render('index', {'vector' : vector, 'idiom': idiom.es});
  }else if(req.cookies.idiom == 'en'){
    res.render('index', {'vector' : vector, 'idiom' : idiom.en});
  }else{
    res.render('index', {'vector' : vector, 'idiom' : idiom.en});
  }
});

//Post de la pagina principal
app.post('/',function(req, res, next){
  if(req.body.newTorrentLink){
    client.add(req.body.newTorrentLink, onTorrent);
  };
  var idiom = {};
  if(req.body.idiom == 'es'){
    idiom = 'es';
  }else if(req.body.idiom == 'es'){
    idiom = 'en';
  }
  var miliseconds = 60000000;
	res.cookie('idiom',idiom,{ maxAge: miliseconds });
  res.redirect('/');
});
loadConfig();
var webSocket;
function loadConfig(){
  fs.readFile("./idioms.json", function(error, data){
    if(error){
      console.log("Error leyendo los paquetes de idiomas");
    }else{
      idiom = JSON.parse(data);
      console.log("Paquetes de idiomas cargados");
      server = http.createServer(app);
      websocket = io.listen(server);
      server.listen(port);
      server.on('listening', function(){
        websocket.on('connection', function(socket){
          console.log("Nuevo usuario");
          socket.on('newTorrent', function(msg){
            client.add(msg, onTorrent);
          });
        });
        console.log("Servidor escuchando en el puerto " + port);

      });
    }
  });
}
