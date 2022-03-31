const style = require('./styleString.js');

const styleStringToBitMaskMap = {
    'serif': 0b00000001,
    'sans' : 0b00000010,
    'bf'   : 0b00000100,
    'it'   : 0b00001000,
    'cal'  : 0b00010000,
    'frak' : 0b00100000,
    'mono' : 0b01000000,
    'bb'   : 0b10000000 
};

const bitMaskToStyleStringMap = {
    0b00000001 : 'serif',
    0b00000010 : 'sans' ,
    0b00000100 : 'bf'   ,
    0b00001000 : 'it'   ,
    0b00010000 : 'cal'  ,
    0b00100000 : 'frak' ,
    0b01000000 : 'mono' ,
    0b10000000 : 'bb'    
}

const styleStrings = {
    0b00000010: 'sans-serif normal',
    0b00000001: 'serif normal',
    0b00000000: 'serif normal',
    0b00000110: 'sans-serif bold',
    0b00000101: 'serif bold',
    0b00000100: 'serif bold',
    0b00001010: 'sans-serif italic',
    0b00001001: 'serif italic',
    0b00001000: 'serif italic',
    0b00001110: 'sans-serif bold italic',
    0b00001101: 'serif bold italic',
    0b00001100: 'serif bold italic',
    0b00010000: 'cal normal',
    0b00010100: 'cal bold',
    0b00100000: 'fraktur normal',
    0b00100100: 'fraktur bold',
    0b01000000: 'mono',
    0b10000000: 'bb',
}

function setBit(pattern, bitToSet) { return pattern | bitToSet };
function testBit(pattern, bitToSet) { return (pattern & bitToSet) === 0 ? 0 : 1 };
function stringSet(pattern) {
    let out = ''

    for (let key in bitMaskToStyleStringMap) {
        if(testBit(pattern, key)) {
            out += bitMaskToStyleStringMap[key] + ', ';
        }
    }

    return out.substring(0, out.length-2);
}

const ESCAPED = ["'", '"', 'n', 't', '\\', '{', '}', '*', '~', '|'];
const ESCAPED_AFTER = ["'", '"', '\n', '\t', '\\', '{', '}', '\\*', '\\~', '\\|'];
class TextParser {
    constructor(text, index) {
        this.text = text;
        if(index == undefined) this.index = 0;
        else this.index = index;
    }

    parse(stop, currStyle) {
        let stopChar = stop || '';
        let parsed = '';
        while(this.hasNext() && stopChar.indexOf(this.peek()) < 0) {
            let curr = this.pop();
            if(curr === '\\') {
                //console.log('backslash', curr, this.peek());
                if(this.checkEscape()) {
                    //console.log('escape');
                    let res = this.getEscape();
                    if(!res.sucsess) return res;
                    parsed += res.val; 
                } else {
                    //console.log('style');
                    let res = this.getStyleMacro(currStyle === undefined ? 0 : currStyle);
                    if(!res.sucsess) return res;
                    parsed += res.val;
                }
            } else {
                parsed += curr;
            }
        }
        console.log(this.hasNext(), stopChar.indexOf(this.peek()) < 0, this.peek());
        if(stop && (!this.hasNext() || !stopChar.indexOf(this.peek()) < 0)) { //if we were supposed to hit a stop char and didnt
            return {sucsess: false, val: null, msg: `Expexted ['${stop.split('').join("', '")}']`}
        }
        return { sucsess: true, val: parsed };
    }

    peek() {
        return this.text[this.index];
    }

    pop() {
        this.next();
        return this.text[this.index-1];
    }

    next() {
        this.index++;
    }

    hasNext() {
        return this.index < this.text.length;
    }

    getStyleBitSet(currStyleBitSet, inStyleSting) {
        let mask = styleStringToBitMaskMap[inStyleSting];
        if(!mask) return {sucsess: false, val:null, msg:`Style: [${inStyleSting}] is unrecognized.`};
        let newStyleBitSet = setBit(currStyleBitSet, mask);
        return {sucsess: true, val: newStyleBitSet};
    }

    getStyleFromBitSet(inStyleSting, newStyleBitSet, oldBitSet) {
        let outStyleString = styleStrings[newStyleBitSet];
        if(outStyleString == undefined) return {sucsess: false, val:null, msg:`Style: [${inStyleSting}] cannot be set with [${stringSet(oldBitSet)}].`};
        console.log(outStyleString);
        return {sucsess: true, val: outStyleString};
    }

    getStyleMacro(currStyle) {
        let macro = {};
        let res = this.parse('{', currStyle);
        if(!res.sucsess) return res;
        let newStyleStr = res.val;

        res = this.getStyleBitSet(currStyle, newStyleStr);
        if(!res.sucsess) return res;
        let newBitSet = res.val;

        res = this.getStyleFromBitSet(newStyleStr, newBitSet, currStyle);
        if(!res.sucsess) return res;
        
        macro.style = res.val;
        this.next();
        
        res = this.parse('}', newBitSet);
        if(!res.sucsess) return res;
        macro.str = res.val;
        this.next();

        let styled = style(macro);
        if(styled === null) {
            return {sucsess: false, val:null, msg:`Style: [${macro.style}] is unrecognized.`}
        }
        return {sucsess: true, val: styled};
    }

    getEscape() {
        let i = ESCAPED.indexOf(this.pop());
        return {sucsess: true, val: ESCAPED_AFTER[i]};
    }

    checkEscape() {
        return ESCAPED.indexOf(this.peek()) >= 0;
    }
}

module.exports = (asciiText) => {
    console.log(asciiText);
    let parser = new TextParser(asciiText);
    return parser.parse();
};