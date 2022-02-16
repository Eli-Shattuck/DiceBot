const Command = require('./command.js');
const BatchList = require('../io_classes/batchList.js')


const aliesLen = '--roll 0123'.length;
const alieses = {
    '--roll char' : '--roll 4d6 -pick 3 -loop 6 -sum',
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
//     '-sort',    //return list of results in decreasing order
//     '-isort',   //return list of results in increasing order
//     '-hist',    //return histogram of results
//     '-pick',    //takes argument k, only return k rolls
//     '-sum',     //sums all rolls and returns the total
//     '-loop',    //takes argument k, repeats the command k times
// ]

const flagArgCount = {
    '-adv': 0, 
    '-dis': 0, 
    '-sort': 0,
    '-isort': 0,
    '-hist': 0,
    '-chist': 3,
    '-pick': 1,
    '-sum': 0, 
    '-loop': 1,
}

const flagArgType = {
    '-pick': [/\d+/],
    '-loop': [/\d+/],
    '-chist': [/\d+/, /.+/, /[0,1]/],
}

const disallowedFlagPairs = new Map([
    ['-adv' ,  new Set([
        '-adv',
        '-dis',
        '-sort',
        '-isort',
        '-pick',
        '-sum',
    ])],
    ['-dis' ,  new Set([
        '-dis',
        '-adv',
        '-sort',
        '-isort',
        '-pick',
        '-sum',
    ])],
    ['-sort' ,  new Set([
        '-dis',
        '-adv',
        '-sort',
        '-isort',
    ])],
    ['-isort' ,  new Set([
        '-dis',
        '-adv',
        '-sort',
        '-isort',
    ])],
    ['-hist' ,  new Set([
        '-chist',
        '-hist',
    ])],
    ['-chist' ,  new Set([
        '-chist',
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
        '-isort',
        '-sum',
    ])],
    ['-loop' ,  new Set([
        '-loop',
    ])],
])

class Flag {
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
}

module.exports = class RollCommand extends Command{
    constructor(){
        super();
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
        
        let loop;
        let loopSize = 1;
        if(options) loop = options.find( elt => elt.name==='-loop' );
        if(loop) loopSize = parseInt(loop.args[0]);

        msg.channel.send(`${msg.author} is rolling...`);

        for(let i = 0; i < loopSize; i++) {
            let results = this.rollDice(n, x);
            let extra = this.doOptions(results, n, x, b, options);
            this.sendResults(msg, results, extra);
        }

        //TODO: Include batch printing
        // let reply = msg.author.username + ' is rolling...';
        // let batches = new BatchList();

        // batches.push(message + '\n');
        // for(let i=0; i<results.length; i++){
            
        // }
    }

    sendResults(msg, results, extraLines){
        let toSend = "";
        for(let res of results) {
            toSend += res + "\n";
        }
        if(extraLines) {
            for(let line of extraLines) {
                toSend += line + "\n";
            }
        }
        msg.channel.send(toSend);
    }

    makeHist(results, n, x, b, chist) {
        let barSize = chist ? parseInt(chist.args[0]) : 20;
        let barChar = chist ? chist.args[1] : '=';

        let buckets = {};
        let min = Infinity;
        let max = -Infinity;
        let maxLen = -Infinity;
        for(let res of results) {
            if(buckets[res]) {
                buckets[res]++;
            } else {
                buckets[res] = 1;
                if(res < min) min = res;
                if(res > max) max = res;
            }
            if(buckets[res] > maxLen) maxLen = buckets[res];
        }
        // const maxBuckets = 20;
        // let labels = [];
        // if(Object.keys(buckets).length > maxBuckets) {
        //     //console.log('> 20');
        //     min = 1;
        //     max = 20;
        //     let newBuckets = [];
        //     for(let i = b+1; i < x+b; i++) {
        //         let value = buckets[i] || 0;
        //         let newBucket = Math.ceil(maxBuckets*i/x);
        //         console.table(newBuckets);
        //         if(newBuckets[newBucket]) {
        //             newBuckets[newBucket]+= value;
        //             labels[newBucket].push(i);
        //         } else {
        //             newBuckets[newBucket] = value;
        //             labels[newBucket] = [i];
        //         }
        //         if(newBuckets[newBucket] > maxLen) maxLen = newBuckets[newBucket];
        //     }
        //     buckets = newBuckets;
        // }
        //console.table(labels);
        let histParts = [];
        let maxLabel = -Infinity;
        for(let i = min; i <= max; i++) {
            let len = buckets[i] || 0;
            len = Math.floor(barSize * len / maxLen);
            
            // let label = `[${labels[i][0]}`;
            // if(labels[i].length > 1) {
            //     label += `-${labels[i][labels[i].length-1]}`;
            // }
            // //label += `-${labels[i][(labels[i].length-1) % labels[i].length]}]`;
            // label += ']';

            let label = '' + i;

            histParts.push({
                label: label,
                sep: ' | ',
                bar: barChar.repeat(len)
            });
            if(label.length > maxLabel) maxLabel = label.length;
        }
        let hist = ['```'];
        for(let part of histParts) {
            let spaceNum = maxLabel - part.label.length;
            hist.push(' '.repeat(spaceNum) + part.label + part.sep + part.bar);
        }
        hist.push('```');
        return hist;
    }

    doOptions(results, n, x, b, options) {
        let extra;
        if(options) {
            if(options.find( elt => elt.name==='-hist')) {
                extra = this.makeHist(results, n, x, b);
                results.splice(0, results.length);
                return extra;
            }

            let chist = options.find( elt => elt.name==='-chist');
            if(chist) {
                extra = this.makeHist(results, n, x, b, chist);
                if(parseInt(chist.args[2]) == 0) {
                    results.splice(0, results.length);
                    return extra;
                }
            }

            if(options.find( elt => elt.name==='-sort' )) results.sort((x, y) => y-x);
            
            if(options.find( elt => elt.name==='-isort' )) results.sort((x, y) => x-y);

            const pick = options.find( elt => elt.name==='-pick' );
            if(pick) results.splice(parseInt(pick.args[0]), results.length);

            if(options.find( elt => elt.name==='-adv' )){
                let max = Math.max(...results);
                results.splice(0, results.length);
                results.push(max);
            }

            if(options.find( elt => elt.name==='-dis' )){
                let min = Math.min(...results);
                results.splice(0, results.length);
                results.push(min);
            } 

            if(options.find( elt => elt.name==='-sum' )){
                let sum = 0;
                for(let res of results){
                    sum += res;
                }
                results.splice(0, results.length);
                results.push(sum);
            }   
        }
        for(let j=0; j<results.length; j++){
            results[j] = results[j] + b;
        }

        return extra;
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
        let flags = [];
        //let matched;
        //console.log(options);

        let list = options.split(/\s+/); //does not split properly
        console.log(list);
        for(let i=0; i<list.length; i++){
            let op = list[i]; //what about flags with arguments
            if(disallowedFlagPairs.has(op)){
                let disSet = disallowedFlagPairs.get(op);
                for(let flag of flags){
                    if(disSet.has(flag.name)){
                        if(flag.name === op){
                            this.error(msg, `Repeated flag: "${op}".`)
                        } else {
                            this.error(msg, `Cannot set ${op} with ${flag.name}.`)
                        }
                        return;
                    }
                }
                let toAdd = new Flag(op, []);
                flags.push(toAdd);
                let fac = flagArgCount[op];
                while (fac-- > 0) {
                    if(i < list.length-1) {
                        let arg = list[++i];
                        if(arg.match(flagArgType[op][toAdd.args.length])) {
                            toAdd.args.push(arg);
                        } else {
                            this.error(msg, `Invalid argument "${arg}" for flag "${op}".`);
                            return;
                        }
                    } else {
                        this.error(msg, `Not enough args passed to flag: "${op}".`);
                        return;
                    }
                }

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