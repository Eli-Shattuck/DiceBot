const Command = require('./command.js');

const aliesLen = '--roll 0123'.length;
const alieses = {
    '--roll char' : '--roll 4d6 -pick 3 loop 6 -sum',
    '--roll stat' : '--roll 4d6 -pick 3 -sum',
    '--roll nice' : '--roll 69d69 -adv',
}
const disallowedFlagPairs = new Map([
    ['-adv' ,  new Set([
        '-adv',
        '-dis',
        '-sort',
        '-pick',
        '-sum',
    ])],
    ['-dis' ,  new Set([
        '-dis',
        '-adv',
        '-sort',
        '-pick',
        '-sum',
    ])],
    ['-sort' ,  new Set([
        '-dis',
        '-adv',
        '-sort',
    ])],
    ['-hist' ,  new Set([
        '-hist',
    ])],
    ['-pick' ,  new Set([
        '-dis',
        '-adv',
        '-pick',
    ])],
    ['-sum' ,  new Set([
        '-dis',
        '-adv',
        '-sort',
        '-sum',
    ])],
    ['-loop' ,  new Set([
        '-loop',
    ])],
])

module.exports = class RollCommand extends Command{
    constructor(){
        super();
    }

    static getRollRe(){
        return /^--roll\s*(\d*)\s*[dD]\s*(\d+)\s*([+-]\s*\d+){0,1}\s*(-[^-].+){0,1}/;
    }

    match(msg){
        return msg.content.indexOf('--roll') === 0;
    }

    handle(msg){
        let text = this.checkAlies(msg.content)
        let args = this.parseArgs(text, msg);
        if(args == undefined) return;

        let [n, x, b, options] = args;

        //TODO: ROLL THE DICE!!!!!!!!!
        //TODO: Include batch printing

        //console.log(disallowedFlagPairs);
        console.log(n, x, b, options);
    }

    checkAlies(text){
        if(text.length >= aliesLen){
            let key = text.substring(0, aliesLen);
            if(alieses[key]){
                return alieses[key];
            }
        } 
        return text;
    }

    parseArgs(text, msg){
        let matchRoll = text.match(RollCommand.getRollRe());
        let n, x, b, options;

        if(matchRoll){
            if(matchRoll[1]) {
                n = parseInt(matchRoll[1]);
                if(n == NaN) {
                    this.error(msg, `Invalid argument for n, ${matchRoll[1]}.`);
                    return ;
                }
            } else {
                n = 1;
            }

            if(matchRoll[2] && !isNaN(matchRoll[2])) {
                x = parseInt(matchRoll[2]);
            } else {
                this.error(msg, `Invalid argument for x, ${matchRoll[2]}.`);
                return;
            }

            if(matchRoll[3]) {
                b = parseInt(matchRoll[3]);
                if(n == NaN) {
                    this.error(msg, `Invalid argument for b, ${matchRoll[3]}.`);
                    return;
                }
            } else {
                b = 0;
            }
            
            options = this.parseOptions(matchRoll[4], msg);
            if(options == undefined) return;

        } else {
            this.error(msg, 'Your message did not match the expected format.');
            return;
        }

        return [n, x, b, options];
    }

    parseOptions(options, msg) {
        let flags = new Set();
        let matched;

        let list = options.split(/\s+/);
        for(let i=0; i<list.length; i++){
            let op = list[i];
            if(disallowedFlagPairs.has(op)){
                let disSet = disallowedFlagPairs.get(op);
                for(let flag of flags){
                    if(disSet.has(flag)){
                        if(flag === op){
                            this.error(msg, `Repeated flag: ${op}.`)
                        } else {
                            this.error(msg, `Cannot set ${op} with ${flag}.`)
                        }
                        return;
                    }
                }
                flags.add(op);

            } else {
                this.error(msg, `This flag was not recognized: ${op}.`);
                return;
            }
        }

        return flags;
    }

    error(msg, errMsg) {
        msg.reply(`${errMsg} Try --help roll for more info.`)
    }
}