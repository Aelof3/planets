import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';

export default class ModelLoader{

    constructor( data, scene, onload ){
        this.model = data.model;
        this.color = data.color;
        this.scene = scene;
        this.onload = onload;
        this.userData = null;
        this.modelObj = {
            name: data.model,
            states: [ 'Idle', 'Walking', 'Crouch', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ],
            emotes: [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ],
            actions: {},
            api: { state: 'Idle' },
            model: null,
            mixer: null,
            activeAction: null,
            previousAction: null,
            changeState: false
        }

        this.loaders = {
            gltf: new GLTFLoader( ).setPath( '../assets/models/' ),
            collada: new ColladaLoader( ).setPath( '../assets/models/' ),
            draco: new DRACOLoader( ).setPath( '../assets/models/' ),
            obj: new OBJLoader( ).setPath( '../assets/models/' )
        }
        this.init( );
    }

    init( ){
        
        this.loadmodel( );
    }
    
    loadmodel( ){
        
        if (this.model === "robot") {
            this.loadRobot( );
        } else if (this.model === "alien") {
            this.loadAlien( );
        } else {
            this.loadRobot( );
        }
    }
    
    toRad(degrees){
        var pi = Math.PI;
        return degrees * (pi/180);
    }

    loadRobot( ){
        

        this.loaders.gltf.load(
            'gltf/RobotExpressive/RobotExpressive.glb',
            ( gltf )=> {

                this.modelObj.data = gltf;
                
                this.modelObj.model = gltf.scene;
                this.modelObj.model.name = 'robot';
                this.modelObj.model.scale.set( 25,25,25 );
                this.modelObj.model.position.set( 0,0,0);
                this.scene.add( this.modelObj.model );
                this.modelObj.model.userData.modelname = "robot";

                this.modelObj.model.rotateY( this.toRad(180) );
                this.modelObj.model.rotateX( this.toRad(90) );

                this.modelObj.mixer = new THREE.AnimationMixer( this.modelObj.model );

                for ( var i = 0; i < gltf.animations.length; i ++ ) {
					var clip = gltf.animations[ i ];
					var action = this.modelObj.mixer.clipAction( clip );
                    this.modelObj.actions[ clip.name ] = action;
                    
					if ( this.modelObj.emotes.indexOf( clip.name ) >= 0 || this.modelObj.states.indexOf( clip.name ) >= 4 ) {
						action.clampWhenFinished = true;
						action.loop = THREE.LoopOnce;
					}
                }
                if ( typeof this.onload === "function") this.onload();
                this.modelObj.activeAction = this.modelObj.actions[ 'Idle' ];
                this.animateObject();

              
            }
        );
    }

    loadAlien( ){
        
        
        this.loaders.gltf.load(
            'alien.glb',
            ( gltf )=>{

                this.modelObj.data = gltf;
                
                this.modelObj.model = gltf.scene.children[0];
                this.modelObj.model.name = 'alien';
                this.scene.add( this.modelObj.model );
                this.loaded = true;
                this.modelObj.model.scale.set(25,25,25);

                this.modelObj.model.rotateY( this.toRad(0) );
                this.modelObj.model.rotateZ( this.toRad(180) );
                this.modelObj.model.rotateX( this.toRad(85) );
            
                this.modelObj.model.children[1].material.metalness = 0.4;
                this.modelObj.model.children[1].material.roughness = 0;
                this.modelObj.model.children[1].material.depthWrite = true;
                this.modelObj.model.children[1].material.color = new THREE.Color(this.color);
                this.modelObj.model.children[1].castShadow = true;
                
                this.modelObj.model.position.y += 20;
                this.modelObj.mixer = new THREE.AnimationMixer( this.modelObj.model );
                
                for ( var i = 0; i < gltf.animations.length; i ++ ) {

					var clip = gltf.animations[ i ];
					var action = this.modelObj.mixer.clipAction( clip );
					this.modelObj.actions[ clip.name ] = action;

					if ( this.modelObj.emotes.indexOf( clip.name ) >= 0 || this.modelObj.states.indexOf( clip.name ) >= 4 ) {

						action.clampWhenFinished = true;
						action.loop = THREE.LoopOnce;

					}

                }
                if ( typeof this.onload === "function") this.onload();
                this.modelObj.activeAction = this.modelObj.actions[ 'Idle' ];
                this.animateObject();
            }
        );
    }
    
    animateMe( action ){
        
        if ( this.modelObj.name === 'alien' && action === 'Sitting' ) action = 'Crouch';

        if ( this.modelObj.api.state !== action ){
            this.modelObj.api.state = action;
            this.animateObject( );
        }
    }

    animateObject( ){
        
        this.fadeToAction( this.modelObj.api.state, 0.5 );

        this.modelObj.activeAction.play( );

    }

    fadeToAction( name, duration ) {
        
        this.modelObj.previousAction = this.modelObj.activeAction;
        this.modelObj.activeAction = this.modelObj.actions[ name ];

        if ( this.modelObj.previousAction !== this.modelObj.activeAction ) {
            this.modelObj.previousAction.fadeOut( duration );
        }

        this.modelObj.activeAction
            .reset()
            .setEffectiveTimeScale( 1 )
            .setEffectiveWeight( 1 )
            .fadeIn( duration )
            .play();
    }




}