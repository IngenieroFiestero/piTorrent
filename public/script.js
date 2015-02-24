var socket = io();

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

function enviarTorrent(){
  socket.emit('newTorrent', $('#nTorrent').val());
  console.log($('#nTorrent').val());
  $('#nTorrent').val('');
}
function enviarIdioma(){
  if($('#leng').val() != ''){
    setCookie('idiom',$('#leng').val(), 100);
  }
}
function add_li(){
  var nuevoLi=document.getElementById("nuevo_li").value;
  if(nuevoLi.length>0){
    if(find_li(nuevoLi)){
      var li=document.createElement('li');
      li.id=nuevoLi;
      li.innerHTML="<span onclick='eliminar(this)'>X</span>"+nuevoLi;
      document.getElementById("listaDesordenada").appendChild(li);
    }
  }
  return false;
}
function find_li(contenido){
  var el = document.getElementById("listaDesordenada").getElementsByTagName("li");
  for (var i=0; i<el.length; i++){
    if(el[i].innerHTML==contenido)
      return false;
  }
  return true;
}

socket.on('torrentList', function(vec){
  console.log(vec);
  var vector = JSON.parse(vec);
  var list = document.createElement('ul');
  var v = [];
  for(var i = 0; i < vector.length; i++){
    var item = document.createElement('li');
    item.appendChild(document.createTextNode(vector[i]));
    list.appendChild(item);
  }
  var dlist = document.getElementById('list');
  $("#list").empty();
  dlist.appendChild(list);
});
