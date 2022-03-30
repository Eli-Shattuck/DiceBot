const style = require('./styleString.js');

const ESCAPED = "'\"nt\\{}";
const ESCAPED_AFTER = "'\"\n\t\\{}";
class TextParser {
    constructor(text, index) {
        this.text = text;
        if(index == undefined) this.index = 0;
        else this.index = index;
    }

    parse(stop) {
        stop = stop || '';
        let parsed = '';
        while(this.hasNext() && stop.indexOf(this.peek()) < 0) {
            let curr = this.pop();
            if(curr === '\\') {
                console.log('backslash', curr, this.peek());
                if(this.checkEscape()) {
                    console.log('escape');
                    let res = this.getEscape();
                    if(!res.sucsess) return res;
                    parsed += ; 
                } else {
                    console.log('style');
                    let styled = this.getStyleMacro();
                    if(styled === null) return null;
                    parsed += styled;
                }
            } else {
                parsed += curr;
            }
        }
        return parsed;
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

    getStyleMacro() {
        let macro = {};
        macro.style = this.parse('{');
        if(macro.style === null) return {sucsess: false, val: null};
        this.next();
        macro.str = this.parse('}');
        if(macro.str === null) return {sucsess: false, val: null};
        this.next();
        let styled = style(macro);
        return {sucsess: styled !== null, val: style};
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