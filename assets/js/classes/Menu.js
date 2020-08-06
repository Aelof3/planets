/* eslint-disable no-undef */
export default class Menu {
    
    constructor( app ){
        
        this.ingameMenuItems = {
            exitToMenu: {
                text: "exit to menu",
                enabled: true
            }
        }

        this.menuItems = {
            newGame: {
                text: "new game",
                enabled: true,
                items: {
                    seed: {
                        text: "seed",
                        settingname: "seed",
                        value: window.globeAPPsettings.seed,
                        type: "text",
                    },
                    difficulties: {
                        text: "difficulty",
                        settingname: "difficulty",
                        value: window.globeAPPsettings.difficulties,
                        type: "select"
                    },
                    planetCount: {
                        text: "planets",
                        settingname: "planetCount",
                        value: window.globeAPPsettings.planetCount,
                        type: "number"
                    },
                    character: {
                        text: "character",
                        settingname: "character",
                        value: window.globeAPPsettings.characters,
                        type: "select"
                    },
                    color: {
                        text: "color",
                        settingname: "color",
                        value: window.globeAPPsettings.color,
                        type: "text"
                    },
                    startButton: {
                        text: "GO",
                        settingname: "GO",
                        value: "singleplayer",
                        type: "button"
                    }
                },
            },
            loadGame: {
                text: "load game",
                enabled: false,
                items: {
                    savedGameFile: {
                        text: "saved game file",
                        settingname: "savedGameFile",
                        value: window.globeAPPsettings.savedGameFile,
                        type: "text/file"
                    },
                    loadGameButton: {
                        text: "load game",
                        settingname: "loadGameButton",
                        value: "loadgame",
                        type: "button"
                    }
                }
            },
            multiplayer: {
                text: "multiplayer",
                enabled: false,
                items: {
                    character: {
                        text: "character",
                        settingname: "character",
                        value: window.globeAPPsettings.characters,
                        type: "select"
                    },
                    color: {
                        text: "color",
                        settingname: "color",
                        value: window.globeAPPsettings.color,
                        type: "text"
                    },
                    server: {
                        text: "server",
                        settingname: "server",
                        value: window.globeAPPsettings.server,
                        type: "text"
                    },
                    connectButton: {
                        text: "connect",
                        settingname: "connectButton",
                        value: "multiplayer",
                        type: "button",
                    }
                }
            },
            options: {
                text: "options",
                enabled: false,
                items: {
                    sound: {
                        text: "sound",
                        settingname: "sound",
                        value: window.globeAPPsettings.options.sound,
                        type: "boolean"
                    },
                    controls: {
                        text: "controls",
                        settingname: "controls",
                        value: {
                            forward: window.globeAPPsettings.options.controls.forward,
                            backwards: window.globeAPPsettings.options.controls.backwards,
                            strafeleft: window.globeAPPsettings.options.controls.strafeleft,
                            straferight: window.globeAPPsettings.options.controls.straferight,
                            turnleft: window.globeAPPsettings.options.controls.turnleft,
                            turnright: window.globeAPPsettings.options.controls.turnright,
                            jump: window.globeAPPsettings.options.controls.jump,
                            dash: window.globeAPPsettings.options.controls.dash,
                            dive: window.globeAPPsettings.options.controls.dive,
                            action1: window.globeAPPsettings.options.controls.action1,
                            action2: window.globeAPPsettings.options.controls.action2,
                            action3: window.globeAPPsettings.options.controls.action3,
                            action4: window.globeAPPsettings.options.controls.action4,
                            action5: window.globeAPPsettings.options.controls.action5,
                            action6: window.globeAPPsettings.options.controls.action6,
                            action7: window.globeAPPsettings.options.controls.action7,
                            action8: window.globeAPPsettings.options.controls.action8,
                            action9: window.globeAPPsettings.options.controls.action9,
                            action10: window.globeAPPsettings.options.controls.action10
                        },
                        type: "select"
                    },
                    graphics: {
                        text: "graphics",
                        settingname: "graphics",
                        value: {
                            viewdistance: window.globeAPPsettings.options.graphics.viewdistance,
                            texturequality: window.globeAPPsettings.options.graphics.texturequality
                        },
                        type: "select"
                    }
                }
            }
        }

        this.menuElement = null;
        this.init();
    }
    
    init(){
        
        this.menuElement = this.h2e( `<div id="gameMenu"></div>` );
        document.body.appendChild( this.menuElement );

        this.buildMenu( this.menuItems );
    }

    setMenuState( state ){
        /* Whether or not to show menu
        *  Which part of menu is showing
        *   - main: new game, load game, multiplayer, options
        *   - new game: seed, difficulties
        *   - load game: game file
        *   - multiplayer: server to connect to
        *   - options: sound, controls, graphics
        *   - - - controls: movement: keys
        *   - - - graphics: viewdistance, texturequality
        */
       console.log( state );
    }

    setGameState( state ){
        // setup game state - menu, singleplayer, multiplayer
        if ( state === "singleplayer" ){
            this.menuElement.className = "hideMenu";
            window.globeapp.stateChange( 'singleplayer' );
        }
        if ( state === "multiplayer" ){
            this.menuElement.className = "hideMenu";
            window.globeapp.stateChange( 'multiplayer' );
        }
        if ( state === "menu" ){
            window.globeapp.stateChange( 'menu' );
        }
    }

    loadGame( savefile ){
        console.log( savefile );
    }

    changeSetting( setting, newvalue ){
        
        window.globeAPPsettings[setting] = newvalue;
    }

    buildMenu( menuItems ){
        

        for (let key in menuItems ){
            let item = menuItems[key];
            if (item.enabled ){
                let row = this.h2e( `<div class="menu--row"><div class="menu--row--label">${ item.text }</div></div>`); 
                row.onclick = ()=>{
                    this.handleMenuRowClick( row, item );
                }
                this.menuElement.appendChild( row )
    
            }
        }

    }

    handleMenuRowClick( row, item ){
        

        this.menuElement.innerHTML = "";
        if ( item.items ){
            for (let key in item.items ){
                let sub = item.items[key];
                if ( sub.type !== "button" ){
                    let subrow = this.h2e( `<div class="menu--row"><div class="menu--row--label">${ sub.text }</div></div>`); 
                    subrow.appendChild( this.menuPart( sub ) );
                    this.menuElement.appendChild( subrow );
                } else {
                    let subrow = this.h2e( `<div class="menu--row"></div>`); 
                    subrow.appendChild( this.menuPart( sub ) );
                    this.menuElement.appendChild( subrow );
                }
                
            }
        } else {
            /*window.globeapp.state.clearSelf();
            delete window.globeapp.state;
            this.buildMenu( this.menuItems );*/
            location.reload();
        }
    }

    menuPart( part ){
        
        let html = null;

        if ( part.type === "button" ){
            html = this.h2e( `<div class="menu--input--Button">${ part.text }</div>` );
            html.onclick = ()=>{
            
                this.setGameState( part.value );
            
            }
        } else if ( part.type === "text" ){
            html = this.h2e( `<input type="text" value="${ part.value }" class="menu--input--Text"/>` );
            html.onchange = (e)=>{
                this.changeSetting( part.settingname, html.value );
            }
        } else if ( part.type === "number" ){
            html = this.h2e( `<input type="text" value="${ part.value }" class="menu--input--Number"/>` );
            html.onchange = (e)=>{
                let h = parseInt( html.value ) || 1;
                if ( h < 1 ) { h = 1; }

                this.changeSetting( part.settingname, h );
            }
        } else if ( part.type === "select" ){
            html = this.h2e( `<select class="menu--input--Select" value="${ window.globeAPPsettings[part.text] }">${this.menuPartSelect( part )}</select>` );
            html.onchange = ()=>{
                this.changeSetting( part.settingname, html.value );
            }
        } else if ( part.type === "file" ){
            html = this.h2e( `<input type="file" class="menu--input--File"/>` );
        } else if ( part.type === "boolean" ){
            html = this.h2e( `<input type="checkbox" class="menu--input--Boolean"/>` );
        }

        return html;
        
    }

    toggleMenu( ){
        
        this.menuElement.classList.toggle( 'hideMenu' );
        //this.menuElement.innerHTML = '';
        if ( !this.menuElement.classList.contains( 'hideMenu' ) ){
            this.menuElement.innerHTML = '';
            this.buildMenu( this.ingameMenuItems );
        }
    }

    menuPartSelect( part ){
        
        let html = "";
        
        for (let i=0;i<part.value.length; i++){
            html += `<option value="${part.value[i]}" ${ ( part.value[i] === window.globeAPPsettings[part.text]) ? 'selected' : ''  }>${part.value[i]}</option>`;
        }
        return html;
    }
    h2e( html ) {
        // Turn text html into an element node, use is similar to jQuery $('<div class="jqueryclass"></div>') to create element
        let template = document.createElement( 'template' );
        html = html.trim( ); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

     
}

/*
-- new game
-- -- seed
-- -- difficulty

-- load game

-- multiplayer
-- -- connect to server

-- options
-- -- controls
-- -- sound?
-- -- quality/graphics
-- -- gameplay
-- -- -- -- difficulty
*/