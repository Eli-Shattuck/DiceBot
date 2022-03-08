const Parser = require('../parser.js');
const Discord = require('discord.js');
const converter = require('number-to-words');

function isVowel(c) {
    return "aeiou".indexOf(c.toLowerCase()) >= 0;
}

function isNotLetter(c) {
    return c.toLowerCase().charCodeAt(0) < 'a'.charCodeAt(0) || c.toLowerCase().charCodeAt(0) > 'z'.charCodeAt(0);
}

function snakeString(str) {
    let nums = str.split(/(\d+)/);

    for(let i = 0; i < nums.length; i++) {
        //if(nums[i].length <= 0) continue;
        //console.log(`to word: [${nums[i]}]`);

        let num = parseInt(nums[i]);
        if(isNaN(num)) continue;

        let numStr = nums[i];
        try {
            numStr = converter.toWords(num);
        } catch(e) {

        }
        nums[i] = numStr;
    }

    str = nums.join('');
    let words = str.split(/([^\s\/\\\-\u20e3_:]+)/);
    for(let i = 0; i < words.length; i++) {
        //console.log(`word ${i}: [${words[i]}]`);
        //if(this.isNotLetter(words[i][0])) continue;
        if(words[i].length <= 0) continue;
        let replace = 'sn';
        
        let firstLetter = 0;
        while(firstLetter < words[i].length && isNotLetter(words[i][firstLetter++]));
        firstLetter--;
        if(firstLetter+1 >= words[i].length && isNotLetter(words[i][firstLetter])) continue;

        if(words[i][firstLetter] === words[i][firstLetter].toUpperCase()) replace = 'Sn';
        
        if(isVowel(words[i][firstLetter])) {
            //console.log(`i: ${i}, vowel!`);
            words[i] = words[i].substring(0, firstLetter) + replace + words[i][firstLetter].toLowerCase() + words[i].substring(firstLetter+1);
        } else {
            words[i] = words[i].substring(0, firstLetter) + replace + words[i].substring(firstLetter+1);
        }
    }
    //console.log('snaked: ' + words.join(''));
    return words.join('');
}

function snake(content) {
    if(content instanceof Discord.MessageEmbed) {
        //console.log(toSend);
        for(let field of content.fields) {
            field.name = snakeString(field.name);
            field.value = snakeString(field.value);
        }
        if(content.footer) content.footer.text = snakeString(content.footer.text);
        if(content.title) content.title = snakeString(content.title);
        if(content.description) content.description = snakeString(content.description);
        if(content.thumbnail) content.thumbnail.url = 'https://cdn-icons-png.flaticon.com/512/3662/3662068.png';

        return content;
    } else if(content.constructor.name === "String") {
        return snakeString(content);
    } else {
        return "SNERROR: snuwu?";
    }
}

module.exports = class Snarser extends Parser {
    constructor(snessage){
        super(snessage);
    }

    snarse() {this.parse();}

    respond(response) {
        response.content = snake(response.content);
        super.respond(
            response
        )
    }
};