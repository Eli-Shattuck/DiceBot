const Command = require('./command.js');
const Discord = require('discord.js');
const converter = require('number-to-words');

module.exports = class SnakeCommand extends Command{
    constructor(){
        super();
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--sn') === 0;
    };
    
    addNewHandler(msg) {
        if(msg.oldReply == undefined) msg.oldReply = msg.reply;
        msg.reply = (str) => {
            let newStr = this.snake(str);
            console.log(newStr);
            msg.oldReply(newStr);
        };

        if(msg.channel.oldSend == undefined) msg.channel.oldSend = msg.channel.send;
        msg.channel.send = (toSend, options) => {
            if(toSend.constructor.name === "String") {
                return msg.channel.oldSend(this.snake(toSend), options).then(message => {
                    this.addNewHandler(message);
                    return new Promise(resolve => resolve(message) );     
                });

            } else if(toSend.constructor.name === msg.constructor.name ) {
                toSend.content = this.snake(toSend.content);
                return msg.channel.oldSend(toSend, options);
            } else if(toSend instanceof Discord.MessageEmbed) {
                //console.log(toSend);
                for(let field of toSend.fields) {
                    field.name = this.snake(field.name);
                    field.value = this.snake(field.value);
                }
                if(toSend.footer) toSend.footer.text = this.snake(toSend.footer.text);
                if(toSend.title) toSend.title = this.snake(toSend.title);
                if(toSend.description) toSend.description = this.snake(toSend.description);
                if(toSend.thumbnail) toSend.thumbnail.url = 'https://cdn-icons-png.flaticon.com/512/3662/3662068.png';

                return msg.channel.oldSend(toSend, options).then(message => {
                    //tmp = message;
                    this.addNewHandler(message);
                    return new Promise(resolve => resolve(message) );     
                });
            } else {
                return msg.channel.oldSend(toSend, options);
            }
        };
        
        if(msg.oldEdit == undefined) msg.oldEdit = msg.edit;
        msg.edit = (toEdit) => {
            console.log('snaaaaaaaaaaaaaaaaaaaaaaaa 1')
            if(toEdit.constructor.name === "String") {
                return msg.oldEdit(this.snake(toEdit));
            } else if(toEdit.constructor.name === msg.constructor.name ) {
                toEdit.content = this.snake(toEdit.content);
                return msg.oldEdit(toEdit);
            } else if(toEdit instanceof Discord.MessageEmbed) {
                console.log('snaaaaaaaaaaaaa');
                for(let field of toEdit.fields) {
                    field.name = this.snake(field.name);
                    field.value = this.snake(field.value);
                }
                if(toEdit.footer) toEdit.footer.text = this.snake(toEdit.footer.text);
                if(toEdit.title) toEdit.title = this.snake(toEdit.title);
                if(toEdit.description) toEdit.description = this.snake(toEdit.description);
                if(toEdit.thumbnail) toEdit.thumbnail.url = 'https://cdn-icons-png.flaticon.com/512/3662/3662068.png';

                return msg.oldEdit(toEdit);
            } else {
                return msg.oldEdit(toEdit);
            }
        };
    }

    handle(msg){
        console.log('-----NEW MESSAGE-----');
        const Parser = require('../command_classes/parser.js');
        msg.content = msg.content.substring(5);

        this.addNewHandler(msg);

        let p = new Parser(msg);
        p.parse();        
    };

    isVowel(c) {
        return "aeiou".indexOf(c.toLowerCase()) >= 0;
    }

    isNotLetter(c) {
        return c.toLowerCase().charCodeAt(0) < 'a'.charCodeAt(0) || c.toLowerCase().charCodeAt(0) > 'z'.charCodeAt(0);
    }
//converter.toWords(13);

    snake(str) {
        let nums = str.split(/(\d+)/);

        for(let i = 0; i < nums.length; i++) {
            //if(nums[i].length <= 0) continue;
            console.log(`to word: [${nums[i]}]`);

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
            while(firstLetter < words[i].length && this.isNotLetter(words[i][firstLetter++]));
            firstLetter--;
            if(firstLetter+1 >= words[i].length && this.isNotLetter(words[i][firstLetter])) continue;

            if(words[i][firstLetter] === words[i][firstLetter].toUpperCase()) replace = 'Sn';
            
            if(this.isVowel(words[i][firstLetter])) {
                //console.log(`i: ${i}, vowel!`);
                words[i] = words[i].substring(0, firstLetter) + replace + words[i][firstLetter].toLowerCase() + words[i].substring(firstLetter+1);
            } else {
                words[i] = words[i].substring(0, firstLetter) + replace + words[i].substring(firstLetter+1);
            }
        }
        //console.log('snaked: ' + words.join(''));
        return words.join('');
    }
}