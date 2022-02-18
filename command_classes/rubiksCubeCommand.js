const Command = require('./command.js');
const reactionHandler = require('../io_classes/reactionHandler.js');
const UIEmojis = require('../io_classes/uiEmojis.js');
const scrambleGenerator = require('rubiks-cube-scramble');

const startingUIElements = [
    UIEmojis.TRASH, UIEmojis.SHUFFLE, UIEmojis.UP, UIEmojis.DOWN, UIEmojis.FRONT, UIEmojis.BACK, UIEmojis.LEFT, UIEmojis.RIGHT, UIEmojis.CW
];
const turningUIElements = [
    UIEmojis.UP, UIEmojis.DOWN, UIEmojis.FRONT, UIEmojis.BACK, UIEmojis.LEFT, UIEmojis.RIGHT
];
const toggledUIElements = [
    UIEmojis.CW, UIEmojis.CCW
];

const ORANGE = 0;
const GREEN = 1;
const WHITE = 2;
const BLUE = 3;
const RED = 4;
const YELLOW = 5;

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
| g1 g2 g3 | w1 w2 w3 | b1 b2 b3 |    current scramble:
| g4 g5 g6 | w4 w5 w6 | b4 b5 b6 |    #1
| g7 g8 g9 | w7 w8 w9 | b7 b8 b9 |    #2        
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

        //this.faces[5] = [[0,1,2],[3,4,5],[6,7,8]];

        this.prime = false;
        this.message;
    }

    getFaceAbove(face) {
        switch(face) {
            case ORANGE:
                return {face: YELLOW, rowCol: 3-1, set: this.setRow, get: this.getRow};
            case GREEN:
                return {face: ORANGE, rowCol: 0, set: this.setCol, get: this.getCol};
            case WHITE:
                return {face: ORANGE, rowCol: 3-1, set: this.setRow, get: this.getRow};
            case BLUE:
                return {face: ORANGE, rowCol: 3-1, set: this.setCol, get: this.getCol};
            case RED:
                return {face: WHITE, rowCol: 3-1, set: this.setRow, get: this.getRow};
            case YELLOW:
                return {face: RED, rowCol: 3-1, set: this.setRow, get: this.getRow};
        }
    }

    getFaceBelow(face) {
        switch(face) {
            case ORANGE:
                return {face: WHITE, rowCol: 0, set: this.setRow, get: this.getRow};
            case GREEN:
                return {face: RED, rowCol: 0, set: this.setCol, get: this.getCol};
            case WHITE:
                return {face: RED, rowCol: 0, set: this.setRow, get: this.getRow};
            case BLUE:
                return {face: RED, rowCol: 3-1, set: this.setCol, get: this.getCol};
            case RED:
                return {face: YELLOW, rowCol: 0, set: this.setRow, get: this.getRow};
            case YELLOW:
                return {face: ORANGE, rowCol: 0, set: this.setRow, get: this.getRow};
        }
    }

    getFaceRight(face) {
        switch(face) {
            case ORANGE:
                return {face: BLUE, rowCol: 0, set: this.setRow, get: this.getRow};
            case GREEN:
                return {face: WHITE, rowCol: 0, set: this.setCol, get: this.getCol};
            case WHITE:
                return {face: BLUE, rowCol: 0, set: this.setCol, get: this.getCol};
            case BLUE:
                return {face: YELLOW, rowCol: 3-1, set: this.setCol, get: this.getCol};
            case RED:
                return {face: BLUE, rowCol: 3-1, set: this.setRow, get: this.getRow};
            case YELLOW:
                return {face: BLUE, rowCol: 3-1, set: this.setCol, get: this.getCol};
        }
    }

    getFaceLeft(face) {
        switch(face) {
            case ORANGE:
                return {face: GREEN, rowCol: 0, set: this.setRow, get: this.getRow};
            case GREEN:
                return {face: YELLOW, rowCol: 0, set: this.setCol, get: this.getCol};
            case WHITE:
                return {face: GREEN, rowCol: 3-1, set: this.setCol, get: this.getCol};
            case BLUE:
                return {face: WHITE, rowCol: 3-1, set: this.setCol, get: this.getCol};
            case RED:
                return {face: GREEN, rowCol: 3-1, set: this.setRow, get: this.getRow};
            case YELLOW:
                return {face: GREEN, rowCol: 0, set: this.setCol, get: this.getCol};
        }
    }

    rotateFace(face) {
        this.faces[face] = this.cycleMatrix(this.faces[face]);
        
        let above = this.getFaceAbove(face);
        let below = this.getFaceBelow(face);
        let left  = this.getFaceLeft (face);
        let right = this.getFaceRight(face);

        let tmp = above.get(this.faces[above.face], above.rowCol);

        if(!this.prime) {
            above.set( this.faces[above.face],  left .get(this.faces[left .face], left .rowCol),  above.rowCol );
            left .set( this.faces[left .face],  below.get(this.faces[below.face], below.rowCol),  left .rowCol );
            below.set( this.faces[below.face],  right.get(this.faces[right.face], right.rowCol),  below.rowCol );
            right.set( this.faces[right.face],  tmp                                            ,  right.rowCol );      
        } else {
            above.set( this.faces[above.face],  right.get(this.faces[right.face], right.rowCol),  above.rowCol );
            right.set( this.faces[right.face],  below.get(this.faces[below.face], below.rowCol),  right.rowCol );
            below.set( this.faces[below.face],  left .get(this.faces[left .face], left .rowCol),  below.rowCol );
            left .set( this.faces[left .face],  tmp                                            ,  left .rowCol );         
        }
    }

    up() {
        this.rotateFace(WHITE);        
    }

    down() {
        this.rotateFace(YELLOW);
    }

    left() {
        this.rotateFace(GREEN);
    }

    right() {
        this.rotateFace(BLUE);
    }

    front() {
        this.rotateFace(RED);
    }

    back() {
        this.rotateFace(ORANGE);
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

    getCol(mat, c) {
        return mat[c];
    }

    getRow(mat, r) {
        return [mat[0][r], mat[1][r], mat[2][r]]
    }

    setCol(mat, col, c) {
        mat[c] = col;
    }

    setRow(mat, row, r) {
        mat[0][r] = row[0];
        mat[1][r] = row[1];
        mat[2][r] = row[2];
    }

    scramble(scram) {
        this.scram = scram;
        let prime = this.prime;
        scram = scram.split(' ');
        //console.log(scram);
        for(let move of scram) {
            let turn;
            //console.log(move, move[0], move[1]);
            switch(move[0]) {
                case 'F':
                    turn = this.front.bind(this);
                break;
                case 'B':
                    turn = this.back.bind(this);
                break;
                case 'U':
                    turn = this.up.bind(this);
                break;
                case 'D':
                    turn = this.down.bind(this);
                break;
                case 'L':
                    turn = this.left.bind(this);
                break;
                case 'R':
                    turn = this.right.bind(this);
                break;
            }
            //console.log(turn);
            
            if(move[2] === "'") {
                this.prime = true;
                turn();
            } else if(move[2] === "2") {
                this.prime = false;
                turn();
                turn();
            } else {
                this.prime = false;
                turn();
            }
        }
        this.prime = prime;
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
        let scram = this.scram ? this.scram : '';
        let centerSpace = scram.indexOf(' ', scram.length/2);
        let scram1 = scram.substring(0, centerSpace+1);
        let scram2 = scram.substring(centerSpace+1);
        return repr.replace('#1', scram1).replace('#2', scram2);
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

    shuffle(reaction, user) {
        reaction.users.remove(user.id);
        let rc = this.cubes[reaction.message.id];
        rc.scramble(scrambleGenerator.default({ turns: 5 }).substring(1));
        reaction.message.edit(rc.toString());
    }

    delete(reaction) {
        reaction.message.delete();
        return;
    }
}