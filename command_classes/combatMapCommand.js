const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class CombatMapCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--combat-map');
    }
    
    static CombatMapCreateRE() {
        return /--combat-map\s+create\s+"([\s\S]+)"\s+(\d+)\s?x\s?(\d+)\s+obs\[(?:([\p{L}\P{L}]):([\p{L}\P{L}]),)+(?:([\p{L}\P{L}]):([\p{L}\P{L}]))?\]\s+ign\[(?:([\p{L}\P{L}]):([\p{L}\P{L}]),)+(?:([\p{L}\P{L}]):([\p{L}\P{L}]))?\]\s+board\[([\s\S]+)\]/;
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