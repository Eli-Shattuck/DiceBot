const Command = require('./command.js');
const reactionHandler = require('../io_classes/reactionHandler.js');
const UIEmojis = require('../io_classes/uiEmojis.js');

const startingUIElements = [
    UIEmojis.TRASH, UIEmojis.SHUFFLE, UIEmojis.UP, UIEmojis.DOWN, UIEmojis.FRONT, UIEmojis.BACK, UIEmojis.LEFT, UIEmojis.RIGHT, UIEmojis.CW
];
const turningUIElements = [
    UIEmojis.UP, UIEmojis.DOWN, UIEmojis.FRONT, UIEmojis.BACK, UIEmojis.LEFT, UIEmojis.RIGHT
];
const toggledUIElements = [
    UIEmojis.CW, UIEmojis.CCW
];

class Cube{
    static getColor(i) {
        return [
            'o',
            'g',
            'w',
            'b',
            'r',
            'y'
        ][i];
    }

    static getNet() {
        return `        +-------+
        | o1 o2 o3 |
        | o4 o5 o6 |
        | o7 o8 o9 |
+-------+-------+-------+
| g1 g2 g3 | w1 w2 w3 | b1 b2 b3 |
| g4 g5 g6 | w4 w5 w6 | b4 b5 b6 |
| g7 g8 g9 | w7 w8 w9 | b7 b8 b9 |
+-------+-------+-------+
        | r1 r2 r3 |
        | r4 r5 r6 |
        | r7 r8 r9 |
        +-------+
        | y1 y2 y3 |
        | y4 y5 y6 |
        | y7 y8 y9 |
        +-------+`;
    }

    constructor() {
        this.faces = [];
        for(let i = 0; i < 6; i++) {
            this.faces.push([]);
            for(let j = 0; j < 3; j++) {
                this.faces[i].push([]);
                for(let k = 0; k < 3; k++) {
                    this.faces[i][j][k] = Cube.getColor(i);
                }
            }
        }

        this.faces[2] = [[0,1,2],[3,4,5],[6,7,8]];

        this.prime = false;
        this.message;
    }

    up() {
        this.faces[2] = this.cycleMatrix(this.faces[2]);
        if(!this.prime) {
            let tmp = this.getRow(this.faces[0], 2);
            this.setRow(this.faces[0], this.getCol(this.faces[1], 2), 2);
            this.setCol(this.faces[1], this.getRow(this.faces[4], 0), 2);
            this.setRow(this.faces[4], this.getCol(this.faces[3], 0), 0);
            this.setCol(this.faces[3], tmp, 0);           
        } else {

        }
    }

    down() {
        console.log('down');
    }

    left() {
        console.log('left');
    }

    right() {
        console.log('right');
    }

    front() {
        console.log('front');
    }

    back() {
        console.log('back');
    }

    cycleMatrix(mat) {
        let newMat = [];

        if(!this.prime) {
            for(let j = 3-1; j >= 0; j--) {
                newMat.push([]);
                for(let i = 0; i < 3; i++) {
                    newMat[3-j-1].push(mat[i][j]);
                }
            }
        } else {
            for(let j = 0; j < 3; j++) {
                newMat.push([]);
                for(let i = 3-1; i >= 0; i--) {
                    newMat[j].push(mat[i][j]);
                }
            }
        }

        return newMat
    }

    getCol(mat, r) {
        return mat[r];
    }

    getRow(mat, c) {
        return [mat[0][c], mat[1][c], mat[2][c]]
    }

    setCol(mat, row, r) {
        mat[r] = row;
    }

    setRow(mat, col, c) {
        mat[0][c] = col[0];
        mat[1][c] = col[1];
        mat[2][c] = col[2];
    }

    toString() {
        let repr = '```\n' + Cube.getNet() + '\n```';

        for(let i = 0; i < 6; i++) {
            for(let j = 0; j < 3; j++) {
                for(let k = 0; k < 3; k++) {
                    repr = repr.replace(Cube.getColor(i) + (j+3*k+1), this.faces[i][j][k]);
                }
            }
        }

        return repr;
    }
}

module.exports = class RubiksCubeCommand extends Command{
    constructor(){
        super();
        this.cubes = {};
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf("--rubik's") === 0;
    };
    
    handle(msg){
        let rc = new Cube();
        //console.log(Cube.getNet());
        msg.channel.send(rc.toString())
        .then(message => {
            rc.message = message;
            this.cubes[message.id] = rc;
            reactionHandler.addReactions(startingUIElements, message);

            reactionHandler.addCallback(
                turningUIElements,
                message,
                this.turn.bind(this)
            );

            reactionHandler.addCallback(
                toggledUIElements,
                message,
                this.toggleDirection.bind(this)
            );

            reactionHandler.addCallback(
                [UIEmojis.SHUFFLE],
                message,
                this.shuffle.bind(this)
            );

            reactionHandler.addCallback(
                [UIEmojis.TRASH],
                message,
                this.delete.bind(this)
            );
        })
        return;
    };

    turn(reaction, user) {
        reaction.users.remove(user.id);
        let msg = reaction.message;
        let rc = this.cubes[msg.id];
        switch(reaction.emoji.id) {
            case UIEmojis.FRONT.id:
                rc.front();
            break;
            case UIEmojis.BACK.id:
                rc.back();
            break;
            case UIEmojis.LEFT.id:
                rc.left();
            break;
            case UIEmojis.RIGHT.id:
                rc.right();
            break;
            case UIEmojis.UP.id:
                rc.up();
            break;
            case UIEmojis.DOWN.id:
                rc.down();
            break;
        }
        msg.edit(rc.toString());
    }

    toggleDirection(reaction) {
        let rc = this.cubes[reaction.message.id];
        if(reaction.emoji.id === UIEmojis.CW.id) {
            rc.prime = true;
        } else {
            rc.prime = false;
        }

        reactionHandler.toggleEmoji(UIEmojis.CW, UIEmojis.CCW, reaction.message);
    }

    shuffle(reaction) {

    }

    delete(reaction) {
        reaction.message.delete();
        return;
    }
}