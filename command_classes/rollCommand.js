const Command = require('./command.js');

const aliesLen = '--roll 0123'.length;
const alieses = {
    '--roll char' : '--roll 4d6 -pick 3 loop 6 -sum',
    '--roll stat' : '--roll 4d6 -pick 3 -sum',
    '--roll nice' : '--roll 69d69 -adv',
}

//command in form: --roll 𝑛 d 𝑥 [+/-] 𝑏 -flag0 arg0 -flag1 arg1…
//rolls n dice
//of size d sides
//adds b to each roll (after -sum)
//flags have special actions:

// const flags = [
//     '-adv',     //roll multiple dice and only return the highest
//     '-dis',     //roll multiple dice and only return the lowest
//     '-sort',    //return list of results in sorted order
//     '-hist',    //return histogram of results
//     '-pick',    //takes argument k, only return higest k rolls
//     '-sum',     //sums all rolls and returns the total
//     '-loop',    //takes argument k, repeats the command k times
// ]

const flagsWithArgs = new Set([
    '-pick',
    '-loop',
])

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

class BatchList {
	constructor() {
		this.batches = [''];
		this.currentBatch = 0;
	}
	
	push(newData) {
		if(this.batches[this.currentBatch].length + newData.length < BATCH_SIZE-1) {
			this.batches[this.currentBatch] += newData;
			return;
		}
		if(newData.length >= BATCH_SIZE-1) {
			let i = 0;
			while(i < newData.length) {
				this.batches[++this.currentBatch] = newData.subString(i, i+BATCH_SIZE);
				i+=BATCH_SIZE;
			}
			this.batches[++this.currentBatch] = newData.subString(i);
			return;
		}
		
		this.batches[++this.currentBatch] = newData;
		return;
	}
}

module.exports = class RollCommand extends Command{
    constructor(){
        super();
        // this.adv = false;
        // this.dis = false;
        // this.sort = false;
        // this.hist = false;
        // this.pick = false;
        // this.sum = false;
        // this.loop = 1;
    }

    static getRollRe(){
        return /^--roll\s*(\d*)\s*[dD]\s*(\d+)\s*([+-]\s*\d+){0,1}\s*(-[^-].+){0,1}(.*)/;
    }

    match(msg){
        return msg.content.indexOf('--roll') === 0;
    }

    handle(msg){
        let text = this.checkAlies(msg.content)
        let args = this.parseArgs(text, msg);
        if(args == undefined) return;

        let [n, x, b, options] = args;
        console.log(n, x, b, options);
        //TODO: ROLL THE DICE!!!!!!!!!
        let results = this.rollDice(n, x);

        

        //TODO: Include batch printing
        // let reply = msg.author.username + ' is rolling...';
        // let batches = new BatchList();

        // batches.push(message + '\n');
        // for(let i=0; i<results.length; i++){
            
        // }
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
                    this.error(msg, `Invalid argument for n: "${matchRoll[1]}".`);
                    return ;
                }
            } else {
                n = 1;
            }

            if(matchRoll[2] && !isNaN(matchRoll[2])) {
                x = parseInt(matchRoll[2]);
            } else {
                this.error(msg, `Invalid argument for x: "${matchRoll[2]}".`);
                return;
            }

            if(matchRoll[3]) {
                b = parseInt(matchRoll[3]);
                if(n == NaN) {
                    this.error(msg, `Invalid argument for b: "${matchRoll[3]}".`);
                    return;
                }
            } else {
                b = 0;
            }
            
            if(matchRoll[4]) {
                options = this.parseOptions(matchRoll[4], msg);
                if(options == undefined) return;
            }
            
            if(matchRoll[5]){
                this.error(msg, `Unknown flag(s): "${matchRoll[5]}".`);
                return;
            }
            

        } else {
            this.error(msg, 'Your message did not match the expected format.');
            return;
        }

        return [n, x, b, options];
    }

    parseOptions(options, msg) {
        let flags = new Set();
        //let matched;
        console.log(options);

        let list = options.split(/\s+/); //does not split properly
        console.log(list);
        for(let i=0; i<list.length; i++){
            let op = list[i]; //what about flags with arguments
            if(disallowedFlagPairs.has(op)){
                let disSet = disallowedFlagPairs.get(op);
                for(let flag of flags){
                    if(disSet.has(flag)){
                        if(flag === op){
                            this.error(msg, `Repeated flag: "${op}".`)
                        } else {
                            this.error(msg, `Cannot set ${op} with ${flag}.`)
                        }
                        return;
                    }
                }
                flags.add(op);

            } else {
                this.error(msg, `Unknown flag: "${op}".`);
                return;
            }
        }

        return flags;
    }

    rollDice(n, x){
        let nums = [];
		
		for(let i = 0; i < n; i++){
			let r = Math.ceil(Math.random()*x);
			nums.push(r);
			//console.log(r);
		}
        return nums;
    }

    error(msg, errMsg) {
        msg.reply(`${errMsg} Try --help roll for more info.`)
    }
}