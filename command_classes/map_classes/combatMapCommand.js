const JSONCommand = require('../jsonCommand.js');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const jsonHandler = require('../../io_classes/jsonHandler.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;

module.exports = class CombatMapCommand extends JSONCommand {
    constructor(onNewResponse){
        super(onNewResponse, '--combat-map');
    }

    static getCombatMapCreateRE() {
        return /--combat-map\s+create\s+"([\s\S]+)"\s+(\d+)\s?x\s?(\d+)\s+obs\[((?:[\s\S]+:[\p{L}\P{L}]+,)+(?:[\s\S]+:[\p{L}\P{L}]+)?)\]\s+ign\[((?:[\s\S]+:[\p{L}\P{L}]+,)+(?:[\s\S]+:[\p{L}\P{L}]+)?)\]\s+board\[([\s\S]+)\]/u;
    }

    static getCombatMapPlayRE() {
        return /--combat-map\s+play\s+"([\s\S]+)"\s+player\[((?:\(\d+,\d+\):[\p{L}\P{L}]+,)?(?:\(\d+,\d+\):[\p{L}\P{L}]+)+)\]/u;
    }

    static getCombatMapShowRE() {
        return /--combat-map\s+show\s+maps/;
    }

    static getCombatMapInspectRE() {
        return /--combat-map\s+inspect\s+"([\s\S]+)"\s+(\d+)\s+(\d+)/;
    }

    getUserFilePath(user){
        return `./command_classes/map_classes/map_data/user${user.id}.json`;
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
        let matchCreate = msg.content.match(CombatMapCommand.getCombatMapCreateRE());
        let matchPlay = msg.content.match(CombatMapCommand.getCombatMapPlayRE());
        let matchShow = msg.content.match(CombatMapCommand.getCombatMapShowRE());
        let matchInspect = msg.content.match(CombatMapCommand.getCombatMapInspectRE());
        
        console.log(matchShow);

        if(matchCreate) {
            this.mapNew(msg, matchCreate);
        } else if(matchPlay) {
            this.mapPlay(msg, matchPlay);
        } else if(matchShow) {
            this.mapShow(msg);
        } else if(matchInspect) {
            this.mapInspect(msg, matchInspect);
        }

    };

    mapNew(msg, args) {
        //console.log(args);
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
            //console.log(`${rows} * ${cols} !== ${asciiBoard.length}`);
            this.error(msg, `rows * cols must equal the size of the ascii board (${rows} * ${cols} !== ${asciiBoard.length}.`);
            return;
        }
        if(asciiBoard.length * asciiBoard[0].length >= 2000) {
            this.error(msg, `rows * cols must be less than 2000.`);
            return;
        }
        this.pushEltToArray(
            msg,
            { name, cols, rows, obs, ign, asciiBoard },
            "maps",
            (a, b) => {
                return a["name"] == b["name"] && a["cols"] == b["cols"] && a["rows"] == b["rows"];
            },
            `You have an existing map with the name ${name}, size ${cols},${rows}}. Would you like to replace it?`,
            "Your map has been modified.",
            "Your map has been added."
        );

        //console.log(name, cols, rows, obs, ign, CombatMapCommand.toString(asciiBoard, rows, cols));
        return;
    }

    mapPlay(args) {
        console.log(args);
    }

    mapShow(msg) {
        console.log('show');
        this.showArray(
            msg,
            "maps",
            ["name", "cols", "rows"],
            "You have the following maps:",
            "You can inspect any of these maps using `--combat-map inspect macroName cols rows`, or delete it with `--combat-map delete macroName cols rows`.",
            "You have no saved maps."
        );
    }

    mapInspect(msg, matchInspect) {
        let macroName = matchInspect[1];
        let cols = parseInt(matchInspect[2]);
        let rows = parseInt(matchInspect[3]);
        //this.showElt()
        this.showElt(
            msg,
            "maps",
            elt => {
                if(elt["name"] == macroName && elt["cols"] == cols && elt["rows"] == rows) {
                    elt["obs"] = elt["obs"].toString();
                    elt["asciiBoard"] = "\n"+CombatMapCommand.toString(elt["asciiBoard"], rows, cols);
                    return true;
                } 
            },
            "This map has the following properties:",
            "You do not have a map with that name or size. Try `--combat-map show maps` to see your maps."
        );
    }

    deleteMacro(msg, matchDelete){
        let toDelete = matchDelete[1];
        this.deleteElt(
            msg,
            "Macros",
            elt => {
                return elt["Name"] == toDelete;
            },
            `Your macro ${toDelete} was successfully deleted.`,
            `You have no existing macros with the name "${toDelete}".`,
            'You have no existing macros.'
        );
    }
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