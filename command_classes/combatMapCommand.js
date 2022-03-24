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
    --combat-map create name 10x10 obs[#:⬛,T:🌳,R:🗻] ign[.:⬜,D:🟫] board[
        ##########
        #DDDT....#
        #DR......#
        #RR......#
        #.....T..#
        #.....DD.#
        #..R..DD.#
        #.....DDT#
        #.T.....R#
        ##########
    ]

    --combat-map play name player[(6,5):🧙‍♂️,(2,1):🧟‍♂️,(1,8):👮‍♀️]
*/