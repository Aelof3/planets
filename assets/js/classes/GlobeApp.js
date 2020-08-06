/* eslint-disable no-undef */
import Menu from './Menu.js';
import SinglePlayer from './SinglePlayer.js';
import MultiPlayer from './MultiPlayer.js';

export default class GlobeApp {
    constructor( ){
        this.gameStates = ['menu','singleplayer','multiplayer'];
        this.gameState = 'menu';
        this.state = null;
        this.menu = null;
        this.init();
    }
    
    init(){
        this.setupEventHandlers( );
        this.stateChange( this.gameState );
    }

    stateChange( state ){
        let self = this;

        this.gameState = state;

        if ( state === 'menu' ){
            if (this.menu){
                this.menu.toggleMenu();
            } else {
                this.menu = new Menu( self );
            }
        }
        
        if ( state === 'singleplayer' ){
            this.state = new SinglePlayer( );
        }
        
        if ( state === 'multiplayer' ){
            this.state = new MultiPlayer( );
        }

    }

    setupEventHandlers( ){
        
        window.addEventListener( 'keydown', ( e )=>{ this.handleKeyDown( e ) }, false );
        //window.addEventListener( 'keyup', ( e )=>{ this.handleKeyUp( e ) }, false );
    }
     
    handleKeyDown( e ){
        
        let key = e.key;
        if ( key === "Escape" ){
            this.stateChange( 'menu' );
        }
    }
}
