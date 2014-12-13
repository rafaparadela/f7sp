$(document).ready(function() {
    $.ajaxSetup({ cache: false });
    
    getReferencias();
    auth();   
    activaDatepicker();
    
    $('#modal_nick').on('shown.bs.modal', function () {
        $('#input_nick').focus();
    })
    
    $('#chivato').click(function(event) {
        $('#logout').click();
    });
});

var myFB='https://f7sp.firebaseio.com';
var FBRef;
var usuariosRef;
var userRef=false;
var quedadasRef;
var mensajesRef;
var connectedRef;
var usuario=false;

var semana=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];



function getReferencias () {
    FBRef= new Firebase(myFB);
	usuariosRef= FBRef.child('usuarios');
	quedadasRef= FBRef.child('quedadas');
	mensajesRef= FBRef.child('mensajes');
	connectedRef = FBRef.child('.info/connected');
}

function auth () {
    AuthRef= new Firebase(myFB);
    
    var auth = new FirebaseSimpleLogin(AuthRef, function(error, user) {
        if (error) console.log(error);
        else if (user) {
            
            usuario=user;
            
            auth.createUser(user.email,'123456', function(error, u) {
              if (!error){
                  newUser(user.id,user.displayName,user.email);
              }
              else{
                  console.log(error);
                  fillScreen();
              }
            });
            
            
            
            
            
            
        } else logoutstatus()
        
    });
    
    
    $('#login').click(function(event) {
        auth.login('facebook', { rememberMe: true, scope: 'email' });
    });
    
    $('#logout').click(function(event) {
        auth.logout();
        usuario=false;
        logoutstatus();
    });
    
}

function fillScreen () {
    rellenaDatosUsuario();
    rellenaDetallesGrupo();
    rellenaDetallesQuedadas();
    cargaChat();

    $('#page').css('background-size','contain');
    $('#contenido').fadeIn(200);
}

function newUser (id,nombre,email) {
    userRef = usuariosRef.child(id);
    userRef.set({id:id, nombre :nombre, email:email, foto:getFotoUrl(id) }, function(error) {
        console.log(error);
        fillScreen();
    });
}

function rellenaDatosUsuario () {
    if(usuario){
        
        console.log('usuario logado');
        if(!userRef) userRef=usuariosRef.child(usuario.id);
        
        userRef.once('value', function(snapshot) {
          if(snapshot.val() === null) {
              console.log('Usuario no encontrado');
              $('#logout').click();
          } 
          else {
              
              var nombre = snapshot.val().nombre;
              var email = snapshot.val().email;
              var foto = snapshot.val().foto;


              
              
              var auth_wrapper=$('#auth_wrapper');
              auth_wrapper.attr('data-id',usuario.id);
              auth_wrapper.attr('data-nombre',nombre);
              auth_wrapper.attr('data-email',email);
              $('#mifoto').attr('src',foto);
              $('#nombre_saludo').text(nombre);
              $('#login').fadeOut(function(){ $('#logout').fadeIn(); });
            
        
              var onlineRef = userRef.child('online');
              presencia(onlineRef);
            
            
              var nick = snapshot.val().nick;
              if(nick==undefined) $('#modal_nick').modal('show');
            
          }
        });
        
    }
    else logoutstatus();
}

function guardarNick (elemento) {
    var boton = $(elemento);
    boton.text('Guardando');
    var input_nick=$('#input_nick')
    var minick=input_nick.val();
    
    if(minick!=''){
        userRef.child('nick').set(minick);
        $('#modal_nick').modal('hide');
        boton.text('Guardar');
    }
    else{
        anima(input_nick,'tada'); 
        boton.text('Guardar');
    }
}

function logoutstatus () {
    var auth_wrapper=$('#auth_wrapper');
    
    auth_wrapper.attr('data-id','');
    auth_wrapper.attr('data-nombre','');
    auth_wrapper.attr('data-email','');
    
    $('#logout').add('#contenido').fadeOut(function(){
        $('#login').fadeIn();
        $('#mifoto').attr('src','');
        
        $('#tarjetas_wrapper').add('#quedadas_wrapper').add('#chat').empty();
        
    });
}

function presencia (onlineRef) {
    connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
        onlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        onlineRef.set(true);
      }
    });
}


// JUGADORES REGISTRADOS

function rellenaDetallesGrupo () {
    var tarjetas_wrapper=$('#tarjetas_wrapper');
    // tarjetas_wrapper.empty();
    
    if(usuario){
        
        usuariosRef.on('value', function(snapshot) {
            $.each(snapshot.val(), function(index, val) {
                creaTarjetaUsuario(val);
            });
        });
        
        usuariosRef.on('child_changed', function(childSnapshot, prevChildName) {
            redibujaTarjetaUsuario(childSnapshot.val());
        });
        
        usuariosRef.on('child_removed', function(oldChildSnapshot) {
            borraTarjetaUsuario(oldChildSnapshot.val());
        });
        
    }
    else logoutstatus();
}

function creaTarjetaUsuario (item) {
    var tarjetas_wrapper=$('#tarjetas_wrapper');
    
    var tarjeta=tarjetas_wrapper.find('.tarjeta[data-id="'+item.id+'"]');
    
    if(!tarjeta.length>0)
    {
        if(item.online==true) var clase_online='on';
        else var clase_online='off';
    
        var tarjeta=$('<div></div>').attr({'class':'tarjeta animated fadeInDown clearfix '+clase_online,'data-id':item.id});
        var foto=$('<img>').attr({'class':'foto','src':item.foto}); tarjeta.append(foto);
        var h4=$('<h4></h4>').text(item.nombre); tarjeta.append(h4);
    
        if(item.nick==undefined) var nick='';
        else var nick=item.nick;
        
        var p=$('<p></p>').html('<span class="glyphicon glyphicon-eye-open"></span> '+nick); tarjeta.append(p);
        
        var wait = window.setTimeout( function(){
            tarjeta.removeClass('animated').removeClass('fadeInDown');
        },1300);
    
        tarjetas_wrapper.append(tarjeta);
        // console.log('crea '+item.id);
    }
}

function redibujaTarjetaUsuario (item) {
    var tarjeta=$('#tarjetas_wrapper').find('.tarjeta[data-id="'+item.id+'"]');
    
    if(item.online==true) var clase_online='on';
    else var clase_online='off';
    
    tarjeta.removeClass('on').removeClass('off').addClass(clase_online);
    
    var nick=tarjeta.find('p');
    nick.html('<span class="glyphicon glyphicon-eye-open"></span> '+item.nick);

    anima(tarjeta,'tada');
}

function borraTarjetaUsuario (item) {
    var tarjeta=$('#tarjetas_wrapper').find('.tarjeta[data-id="'+item.id+'"]');
    tarjeta.html(item.nombre);
    anima(tarjeta,'fadeOutDown', function(){
        tarjeta.remove();
        if(item.id==usuario.id) $('#logout').click();
    });
}


// QUEDADAS ORGANIZADAS

function rellenaDetallesQuedadas () {
    var quedadas_wrapper=$('#quedadas_wrapper');
    
    if(usuario){
        
        quedadasRef.on('value', function(allquedadas) {
            creaBotonNuevaQuedada();
            allquedadas.forEach(function(unaquedada) {
                var name = unaquedada.name();
                var data = unaquedada.val();
                creaItemQuedada (name,data)
            });
            
        });
        
        quedadasRef.on('child_changed', function(childSnapshot, prevChildName) {
            redibujaQuedada(childSnapshot.name(),childSnapshot.val());
        });
        
        quedadasRef.on('child_removed', function(oldChildSnapshot) {
            borraQuedada(oldChildSnapshot.name(), oldChildSnapshot.val());
        });
        
    }
    else logoutstatus();
}

function creaItemQuedada (name,item) {
    var quedadas_wrapper=$('#quedadas_wrapper');
    
    var quedada=quedadas_wrapper.find('.quedada[data-name="'+name+'"]');
    
    if(!quedada.length>0)
    {
        var fecha=new Date(item.fecha);
        var dia=semana[fecha.getDay()]+', '+fecha.getDate()+' de '+meses[fecha.getMonth()];
        var hora=fecha.getHours()+':'+(fecha.getMinutes()<10?'0':'') + fecha.getMinutes();
        
        var quedada=$('<div></div>').attr({'class':'quedada animated fadeInDown panel panel-default','data-name':name});
        var heading=$('<div></div>').attr({'class':'panel-heading'}); quedada.append(heading);
            var horing=$('<div></div>').attr({'class':'hora pull-right'}).html(hora+' <span class="glyphicon glyphicon-time"></span>'); heading.append(horing);
            var feching=$('<h3></h3>').attr({'class':'fecha panel-title'}).html(dia); heading.append(feching);
                
                if(item.autor==usuario.id){
                    var deleting=$('<span></span>').attr({'class':'glyphicon glyphicon-trash'}); feching.append(deleting);
                    deleting.click(function(){
                        quedadasRef.child(name).remove();
                    });
                }
                
                
        
        var body=$('<div></div>').attr({'class':'confirmados panel-body clearfix'}); quedada.append(body);
        
            var confirmame=$('<div></div>').attr({'class':'confirmame', 'data-name':name}).html('+'); body.append(confirmame);
            confirmame.click(function(){ confirmar(name); });
            
            // var maybeme=$('<div></div>').attr({'class':'maybeme', 'data-name':name}).html('?'); body.append(maybeme);
            // maybeme.click(function(){ maybemar(name); });
        
        listaConfimados (name,item,confirmame);
        // listaPosibles (name,item,maybeme);
        
        
        var wait = window.setTimeout( function(){
            quedada.removeClass('animated').removeClass('fadeInDown');
        },1300);
    
        $('#botonNuevaQuedada').before(quedada);
    }
}

function redibujaQuedada (name, item) {
    var quedada=$('#quedadas_wrapper').find('.quedada[data-name="'+name+'"]');
    if(quedada.length>0){
        var confirmame= quedada.find('.confirmame');
        var confirmados= quedada.find('img.confirmado');
        confirmados.remove();
        
        // var maybeme= quedada.find('.maybeme');
        // var posibles= quedada.find('img.posible');
        // posibles.remove();
        
        listaConfimados (name,item,confirmame);
        // listaPosibles (name,item,maybeme);

        anima(quedada,'tada');
    }
    
}

function listaConfimados (name,item,confirmame) {
    if(item.confirmados!=undefined){
        $.each(item.confirmados, function(index, confirmado) {
            var photo=$('<img>').attr({'class':'confirmado', 'src':getFotoUrl(confirmado), 'data-usuario':confirmado}); confirmame.before(photo);
            if(confirmado==usuario.id){
                photo.addClass('linkable');
                photo.click(function(){
                    anular(name);
                })
            }
        });
    }
}

function listaPosibles (name,item,maybeme) {
    if(item.posibles!=undefined){
        $.each(item.posibles, function(index, posible) {
            var photo=$('<img>').attr({'class':'posible', 'src':getFotoUrl(posible), 'data-usuario':posible}); maybeme.before(photo);
            if(posible==usuario.id){
                photo.addClass('linkable');
                photo.click(function(){
                    anular_posible(name);
                })
            }
        });
    }
}

function borraQuedada (name,item) {
    var quedadas_wrapper=$('#quedadas_wrapper');
    
    var quedada=quedadas_wrapper.find('.quedada[data-name="'+name+'"]');
    
    if(quedada.length>0)
    {
        anima(quedada,'fadeOutDown', function(){
            quedada.remove();
        });
    }
}

function creaBotonNuevaQuedada () {
    if(!$('#botonNuevaQuedada').length>0)
    {
        var botonNuevaQuedada=$('<button></button>').attr({'class':'btn','id':'botonNuevaQuedada'}).text('Nuevo partido'); $('#quedadas_wrapper').append(botonNuevaQuedada);
        botonNuevaQuedada.click(function(){
            $('#quedada_modal').modal('show');
        })
    }
}

function confirmar (name) {
    var quedada=$('#quedadas_wrapper').find('.quedada[data-name="'+name+'"]');
    if(quedada.length>0){
        var id_usuario = usuario.id;
        var confirmacion = quedada.find('img.confirmado[data-usuario="'+id_usuario+'"]');
        var posibilidad = quedada.find('img.posible[data-usuario="'+id_usuario+'"]');
        if(confirmacion.length>0 || posibilidad.length>0){
            confirmacion.add(posibilidad).each(function(index) {
                anima($(this),'tada');
            });
        }
        else{
            listaConfirmadosRef=quedadasRef.child(name+'/confirmados');
            listaConfirmadosRef.child(id_usuario).set(id_usuario);
        }
    }
}

function maybemar (name) {
    var quedada=$('#quedadas_wrapper').find('.quedada[data-name="'+name+'"]');
    if(quedada.length>0){
        var id_usuario = usuario.id;
        var confirmacion = quedada.find('img.confirmado[data-usuario="'+id_usuario+'"]');
        var posibilidad = quedada.find('img.posible[data-usuario="'+id_usuario+'"]');
        if(confirmacion.length>0 || posibilidad.length>0){
            confirmacion.add(posibilidad).each(function(index) {
                anima($(this),'tada');
            });
        }
        else{
            listaPosiblesRef=quedadasRef.child(name+'/posibles');
            listaPosiblesRef.child(id_usuario).set(id_usuario);
        }
    }
}

function anular (name) {
    var id_usuario = usuario.id;
    confirmadoRef=quedadasRef.child(name+'/confirmados/'+id_usuario);
    confirmadoRef.remove();
}

function anular_posible (name) {
    var id_usuario = usuario.id;
    posibleRef=quedadasRef.child(name+'/posibles/'+id_usuario);
    posibleRef.remove();
}


function activaDatepicker () {
        
    $('#datepicker').datepicker({ minDate: new Date(), maxDate: "+10D", altField: "#dia_nueva_quedada", altFormat: "yy/mm/dd"});
    $('#timepicker').timepicker({altField: "#hora_nueva_quedada", hourMin: 9, hourMax: 23, stepMinute: 15});
    var ahora=new Date();
    $('#dia_nueva_quedada').val(ahora.getFullYear()+'/'+(parseInt(ahora.getMonth())+1)+'/'+ahora.getDate());
    $('#hora_nueva_quedada').val('23:00');
}

function actualizaFechaFinal () {
    var dia=$('#dia_nueva_quedada').val();
    var hora=$('#hora_nueva_quedada').val();
    return new Date(dia+' '+hora).getTime();
}

function nuevaQuedada () {
    var timestamp=actualizaFechaFinal();
    
    var quedadaRef = quedadasRef.push();
    quedadaRef.set({'fecha' : timestamp,'autor':usuario.id});
    quedadaRef.child('confirmados').child(usuario.id).set(usuario.id);
    
    $('#quedada_modal').modal('hide');
    
}



// QUEDADAS ORGANIZADAS

function cargaChat () {
    var chat_wrapper=$('#chat_wrapper');
    
    if(usuario){
        
        
        $('#nextmensaje').keypress(function (e) {
            if (e.keyCode == 13) {
                var texto = $('#nextmensaje').val();
                if(texto.length>0) mensajesRef.push({texto: texto, autor: usuario.id});
                $('#nextmensaje').val('');
            }
        });
        
        var messageListQuery = mensajesRef.limit(100);
        messageListQuery.on('child_added', function(snapshot) {
            var item=snapshot.val();
            escribeChat(item);
        });
    }
    else logoutstatus();
}

function escribeChat (item) {
    var chat=$('#chat');
    
    
    var mensaje=$('<div></div>').attr({'class':'item media'}); chat.append(mensaje);
        var foto=$('<img>').attr({'class':'media-object pull-left','src':getFotoUrl(item.autor)}); mensaje.append(foto);
        var texto=$('<div></div>').attr({'class':'media-body mensaje'}).html(item.texto); mensaje.append(texto);
    
    $('#chat')[0].scrollTop = $('#chat')[0].scrollHeight;
}


// GENERICOS 

function getFotoUrl (id) {
    return 'http://graph.facebook.com/'+id+'/picture?type=square';
}
 

function anima(elemento,animacion,callback) {
    elemento.addClass('animated').addClass(animacion);
    var wait = window.setTimeout( function(){
        elemento.removeClass('animated').removeClass(animacion);
        if (typeof callback == "function") setTimeout(function(){ callback(); },10); 
    },1300);
}







