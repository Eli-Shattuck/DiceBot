const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class CombatMapCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--combat-map');
    }
    
    handle(msg){
        
        return;
    };
}

/*
    --combat-map name 10x10 obs[#:⬛,T:🌳,R:🗻] ign[.:⬜,D:🟫] board[
        ##########
        #........#
    ] 
*/