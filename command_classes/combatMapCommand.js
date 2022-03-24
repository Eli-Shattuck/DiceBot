const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class CombatMapCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--combat-map');
    }

    static getCombatMapCreateRE() {
        return /--combat-map\s+create\s+"([\s\S]+)"\s+(\d+)\s?x\s?(\d+)\s+obs\[((?:[\p{L}\P{L}]:[\p{L}\P{L}],)+(?:[\p{L}\P{L}]:[\p{L}\P{L}])?)\]\s+ign\[((?:[\p{L}\P{L}]:[\p{L}\P{L}],)+(?:[\p{L}\P{L}]:[\p{L}\P{L}])?)\]\s+board\[([\s\S]+)\]/u;
    }

    static toString(asciiBoard, rows, cols) {
        let repr = '';
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                repr += asciiBoard[r][c];
            }
            repr += '\n';
        }
        return repr;
    }

    handle(msg){
        let args = msg.content.match(CombatMapCommand.getCombatMapCreateRE());
        console.log(args);
        let name = args[1];
        let cols = parseInt(args[2]);
        let rows = parseInt(args[3]);
        let obs = args[4].split(',');
        let ign = args[5].split(',');
        let asciiBoard = args[6];

        let validAscii = '';
        let tmp = {};
        for(let o of obs) {
            let t = o.split(':');
            tmp[t[0]] = t[1];
            validAscii += t[0];
        }
        obs = tmp;
        tmp = {};
        for(let i of ign) {
            let t = i.split(':');
            tmp[t[0]] = t[1];
            validAscii += t[0];
        }
        ign = tmp;

        for(let c of asciiBoard) {
            if( validAscii.indexOf(c) < 0) {
                asciiBoard = asciiBoard.replace(c, '');
            }
        }

        let index = 0;
        if(rows * cols === asciiBoard.length) {
            let tmp = [];
            for(let r = 0; r < rows; r++) {
                tmp.push([]);
                for(let c = 0; c < cols; c++) {
                    let uchr = '';
                    if(obs[asciiBoard[index]]) uchr = obs[asciiBoard[index]];
                    else if(ign[asciiBoard[index]]) uchr = ign[asciiBoard[index]];
                    tmp[r][c] = uchr;
                    index++;
                }
            }
            asciiBoard = tmp;
        } else {
            console.log(`${rows} * ${cols} !== ${asciiBoard.length}`)
        }

        console.log(name, cols, rows, obs, ign, CombatMapCommand.toString(asciiBoard, rows, cols));
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