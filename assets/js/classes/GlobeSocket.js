/* eslint-disable no-undef */
import * as THREE from 'three';
import ModelLoader from './ModelLoader.js';

export default class GlobeSocket {
    
    constructor ( data ) {
        this.settings = data.settings;
        this.socket = null;// io( this.settings.server );
        this.delayed = true;
        this.connected = false;
        this.player = data.player;
        this.scene = data.scene;
        this.serverData = null;
        this.playerList = [];
        this.playerObjects = {};
        this.delay = 200;
        this.logData = { b: true, t: 1000 };
        this.interval = null;
        this.ws = null;

        this.obj = null;
        this.geometry = null;

        this.init( );
    }
    
    uuidv4( ) {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
            let r = Math.random( ) * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
            return v.toString( 16 );
        } );
    }

    init( ){
        

        this.id = this.uuidv4( );
        this.websockets( );
    }

    makePlayers( ){
        
        
        for ( let key in this.playerList ){
            
            if ( this.playerList[key].id !== this.id ){

                if ( key in this.playerObjects ){

                    let time = Date.now( );

                    if ( ( time - this.playerList[key].time ) > 5000 ){

                        window.scene.remove( this.playerObjects[key].playerObject.modelObj );
                        
                        delete this.playerObjects[key];
                    } else {
                        let c = this.playerList[key].position;
                        let q = this.playerList[key].quaternion;
                        
                        if (this.playerObjects[key].playerObject.modelObj.model ){
                            this.playerObjects[key].playerObject.modelObj.model.position.copy( new THREE.Vector3( c.x, c.y, c.z ) );
                            this.playerObjects[key].playerObject.modelObj.model.quaternion.copy( new THREE.Quaternion( q.x, q.y, q.z, q.w ) );
                            this.playerObjects[key].playerObject.modelObj.model.updateMatrixWorld();
                        }
                    }
                
                    
                } else {
            
                    this.playerObjects[this.playerList[key].id] = this.playerList[key];
                    this.playerObjects[key].playerObject = new THREE.Object3D();
                    let character = this.playerList[key].character;
                    let data = {
                        model: character,
                        color: this.playerList[key].color
                    }
                    this.playerObjects[key].playerObject = new ModelLoader( data, window.scene, ( )=>{ 
                        if (this.playerObjects[key].playerObject){
                            let position = this.playerList[key].position;
                            let quaternion = this.playerList[key].quaternion;

                            this.playerObjects[key].playerObject.modelObj.model.position.set( position.x, position.y, position.z );
                            
                            this.playerObjects[key].playerObject.modelObj.model.quaternion.set( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
                            
                            this.playerObjects[key].playerObject.modelObj.model.castShadow = false;
                            this.playerObjects[key].playerObject.modelObj.model.receiveShadow = false;
                        }
                    } );
                    
                }
            }

        }

    }

    websockets( ){            
        this.ws = new WebSocket( 'ws://' + window.location.hostname );

        this.ws.binaryType = 'arraybuffer';
        
        this.ws.addEventListener( 'open', ( event )=>{
            
            this.interval = setInterval( ( )=>{
                
                if (window.player.avatar.modelObj.model){
                    let c = window.player.playerObject.getWorldPosition( );
                    let q = window.player.avatar.modelObj.model.children[0].getWorldQuaternion( );
                    if (window.player.avatar.model === "alien"){
                        q = window.player.playerObject.getWorldQuaternion( );
                    }
                    let position = { x: Math.floor(c.x), y: Math.floor(c.y), z: Math.floor(c.z) };
                    let quaternion = { x: Math.floor(q.x), y: Math.floor(q.y), z: Math.floor(q.z), w: Math.floor(q.w) };
                    let character = this.settings.character;
                    let color = this.settings.color;
                    let data = {
                        position: position,
                        id: this.id,
                        quaternion: quaternion,
                        time: Date.now( ),
                        character: character,
                        color: color
                    };  
                    
                    let buffer = new ArrayBuffer(8);
                    let view = new Int32Array(buffer);
                    console.log(view);
                    
                    this.ws.send( JSON.stringify( data ) );

                }  
                

            }, this.delay );
        } );

        this.ws.addEventListener( 'close', ( event )=>{
            clearInterval(this.interval)
            console.log( event );

        } );

        this.ws.addEventListener( 'message', ( event )=>{

            let d = JSON.parse( event.data );
            this.playerList = d;
            this.makePlayers( );
        } );
      
    }
} 