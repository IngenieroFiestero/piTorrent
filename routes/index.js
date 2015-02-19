var express = require('express');
var router = express.Router();
var filePath = "../files/"
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/',function(req, res, next){
  if(req.body.newTorrentLink && req.body.torrentName){
    var file = fs.createWriteStream(filePath + req.body.torrentName + ".torrent");
    var request = http.get(newTorrentLink, function(response) {
      response.pipe(file);
    });
  }
  res.render('index',{title:'Express'});
});

module.exports = router;
