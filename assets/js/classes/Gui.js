export default class Gui {
    constructor( data ){
        this.el = document.getElementById( "gui" );
    }

    init( ){
        

    }

    loop( ){
        
        // update the total amount of slimes on all planets
        let slimeTotal = 0;
        for ( let k=0;k<window.player.planets.length;k++ ){
            slimeTotal += window.player.planets[k].objectList.length;
        }
        let wasd = window.player.moveDirection.forward === 1 || window.player.moveDirection.backward === 1 || window.player.moveDirection.right === 1 || window.player.moveDirection.left === 1;
        let strafe = window.player.moveDirection.strafeLeft === 1 || window.player.moveDirection.strafeRight === 1;
        let jump = window.player.moveDirection.jump === 1;
        let dive = window.player.moveDirection.dive === 1;
        let dash = window.player.moveDirection.dash === 1;
        let gravity = ``;
        let bounce = ``;
        let timer = `0`;
        if ( window.player.playerTimer !== null ) { 
            timer = Math.floor( window.player.playerTimer.getElapsedTime( ) * 1000 ) / 1000;
            if ( timer > 0 && slimeTotal === 0 ){
                window.player.playerTimer.stop( );
            }
        }

        if ( window.globeAPPsettings.difficulty === "insanity" ) {
            gravity = `<p id="gui--stats--gravity">Gravity: <span>${ Math.floor( window.player.attributes.gravity.modifier * 100 ) }%</span></p>`;
            bounce = `<p id="gui--stats--bounce">Bounce: <span>${ Math.floor( window.player.attributes.bounce.modifier * 100 ) }%</span></p>`;
        }
        // 
        this.el.innerHTML = `<div id="gui--left">
                                <p>Planets: ${ window.globeAPPsettings.planetCount }</p>
                                <p>Distance to nearest planet (${ window.player.closestPlanet.number + 1 }/${ window.player.planets.length }): ${ Math.round( window.player.closestDist ) }<p>
                                <p>Slimes left on this planet: ${ window.player.closestPlanet.planet.objectList.length }</p>
                                <p>Slimes left on all planets: ${ slimeTotal }</p>
                                <br>
                                <p>Time Elapsed: ${ timer }</p>
                                <p>Seed: ${ window.globeAPPsettings.seed }</p>
                                <p>Difficulty: ${ window.globeAPPsettings.difficulty }</p>
                                <br>
                                <p>Controls:</p>
                                <p class="${ wasd ? "activeClass" : "" }" id="keys--wasd">move - w a s d</p>
                                <p class="${ strafe ? "activeClass" : "" }" id="keys--strafe">strafe - q e</p>
                                <p class="${ jump ? "activeClass" : "" }" id="keys--jump">jump - space</p>
                                <p class="${ dive ? "activeClass" : "" }" id="keys--dive">dive - z</p>
                                <p class="${ dash ? "activeClass" : "" }" id="keys--dash">dash - f</p>
                            </div>
                            <div id="gui--right">
                                <p id="gui--stats--health">Health: <span>${ window.player.attributes.health.amount }</span></p>
                                <p id="gui--stats--energy">Energy: <span>${ window.player.attributes.energy.amount }</span></p>
                                ${ gravity }
                                ${ bounce }
                            </div>
                            `;
    }
}