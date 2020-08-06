/* eslint-disable no-undef */
import GameState from "./GameState.js";
import GlobeSocket from './GlobeSocket.js';

export default class MultiPlayer extends GameState {
    constructor( ){
        super( );
        this.init();

        this.socket = null;
        this.initGS();
    }

    initGS(){
        this.socket = new GlobeSocket( this );
    }
}