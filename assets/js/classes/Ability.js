/* eslint-disable no-undef */
import * as THREE from "three";

export default class Ability{
    
    constructor( data ){

        this.player = data.player;
        
        this.nq = new THREE.Object3D();

        this.clock = new THREE.Clock();

        this.geometry = null;

        this.init();
        
    }

    init(){
        
        //threeJS Section
        
    }

}