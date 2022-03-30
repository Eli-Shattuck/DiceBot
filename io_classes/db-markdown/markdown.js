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
                    parsed += res.val; 
                } else {
                    console.log('style');
                    let res = this.getStyleMacro();
                    if(!res.sucsess) return res;
                    parsed += res.val;
                }
            } else {
                parsed += curr;
            }
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

    getStyleMacro() {
        let macro = {};
        let res = this.parse('{'); //TODO: check brackets better
        if(!res.sucsess) return res;
        macro.style = res.val;
        this.next();
        
        res = this.parse('}');
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