const path = require( 'path' );
const express = require( 'express' );
const app = express();

const expressWs = require( 'express-ws' )( app );
const aWss = expressWs.getWss('/');
const PORT = 80;
app.use( express.static( './' ) );

//

const clients = [];
const room = new Array( 255 );
const players = {};

function add( ws ) {

  clients.push( ws );

  for ( let i = 0; i < room.length; i ++ ) {
    if ( room[ i ] === undefined ) {
      ws._id = i;
      room[ i ] = ws;
      return;
    }
  }

}

function remove( ws ) {
  
  var index = clients.indexOf( ws );
  if ( index !== - 1 ) { 
    clients.splice( index, 1 );
    for (var key in players){
      if (players[key].wsindex === index){
        delete players[key];
      }
    }
  }

  var index = room.indexOf( ws );
  if ( index !== - 1 ) room[ index ] = undefined;

}

function broadcast( ws, data ) {

  for ( let i = 0; i < clients.length; i ++ ) {
    const client = clients[ i ];
    if ( client !== ws && client.readyState === client.OPEN ) client.send( data );
  }

}

app.ws( '/', function ( ws, request ) {

  add( ws );

  console.log( 'USERS:', clients.length );

  ws.on( 'close', function () {

    remove( ws );
    console.log( 'USERS:', clients.length );
    if ( clients.length === 0 ){
      for (var player in players) delete players[player];

    }
  
  
  } );
  
  ws.on( 'message', function ( data ) {
    let d = JSON.parse(data);
    players[d.id] = d;
    players[d.id].wsindex = clients.indexOf( ws );
    //console.log(players)
    broadcast( null, JSON.stringify(players) );

  } );
  
} );

//
app.get( '/', function ( req, res ){
  res.sendFile(path.join(__dirname + '/index.html'));

});
const listener = app.listen( PORT, function () {

  console.log( "Listening on port " + listener.address().port );

} );