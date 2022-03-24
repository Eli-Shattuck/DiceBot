const Command = require('../command.js');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const jsonHandler = require('../../io_classes/jsonHandler.js');
const uiEmojis = require('../io_classes/uiEmojis.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;

module.exports = class jsonCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }

    getUserFilePath(user){}

    getObject(user){
        let userObject = jsonHandler.getObject(
            this.getUserFilePath(user)
        );
        return userObject;
    }

    getArray(user, arrayName){
        let userObject = this.getObject(user);
        if(userObject && userObject[arrayName]){
            return userObject[arrayName];
        } else {
            return [];
        }
    }

    saveObject(msg, userObject, successText){
        let isErr = jsonHandler.saveObject(
            this.getUserFilePath(msg.author),
            userObject
        );
        if(isErr){
            this.push(responses.reply(msg, "There was an error writing to your file."));
        } else {
            this.push(responses.reply(msg, successText || "Your file has been updated."));
        }
    }

    pushEltToArray(msg, elt, arrayName, equalTo, replaceText, successText){
        let array;
        let userObject = this.getObject(user);
        if(userObject){
            if(userObject[arrayName]){
                array = userObject[arrayName];
            } else {
                array = [];
            }
        } else {
            userObject = {};
            array = [];
        }
        
        for(let i in array){
            if(equalTo(array[i], elt)){
                this.push(
                    responses.reply(
                        msg,
                        replaceText || "Your file contains an object that matches this. Would you like to replace it?",
                        undefined,
                        message => {
                            reactionHandler.addCallback(
                                [YES],
                                message,
                                (reaction, user) => {
                                    if(user != msg.author) return;
                                    array[i] = elt;
                                    userObject[arrayName] = array;
                                    this.saveObject(msg, userObject, successText);
                                    reactionHandler.removeAllCallbacks(message); 
                                    message.delete();
                                }
                            )
                            reactionHandler.addCallback(
                                [STOP],
                                message,
                                (reaction, user) => {
                                    if(user != msg.author) return;
                                    reactionHandler.removeAllCallbacks(message); 
                                    message.delete();
                                    this.push(responses.reply(msg, "Your file has not been changed."));
                                }
                            );
                            reactionHandler.addReactions([YES, STOP], message);
                        }
                    )
                );
                return;
            }
        }

        array.push(elt);
        userObject[arrayName] = array;
        this.saveObject(msg, userObject, successText);
    }

    showArray(msg, arrayName, eltFields, beforeText, afterText){
        let array = this.getArray(msg.author, arrayName);
        let toWrite = beforeText || "You have the following objects:";
        for(let elt of array){
            toWrite += '\n';
            for(let field of eltFields){
                toWrite += `${field} : "${elt[field]}", `
            }
            toWrite.substring(0, toWrite.length - 2);
        }
        if(afterText) toWrite += '\n' + afterText;
        this.push(responses.reply(msg, toWrite));
    }

    showElt(msg, arrayName, isElt, foundText, notFoundText){
        let array = this.getArray(msg.author, arrayName);
        let found;
        for(let elt of array){
            if(isElt(elt)){
                found = elt;
                break;
            }
        }
        if(!found){
            this.push(responses.reply(msg, notFoundText || "You do not have an object with that name."));
            return;
        }
        let toWrite = foundText || "Your object has the following attributes:";
        for(let field in elt){
            toWrite += `\n${field} : "${elt[field]}"`;
        }
        this.push(responses.reply(msg, toWrite));
    }

    deleteElt(msg, arrayName, isElt, successText, failText, emptyText){
        let array;
        let userObject = this.getObject(user);
        if(userObject){
            if(userObject[arrayName]){
                array = userObject[arrayName];
            } else {
                array = [];
            }
        } else {
            userObject = {};
            array = [];
        }

        let initialLen = array.length;
        if(initialLen > 0){
            for(let i = 0; i < initialLen; i++){
                if(isElt(array[i])){
                    array.splice(i, 1);
                    break;
                }
            }
            if(array.length == initialLen){
                this.push(responses.reply(msg, failText || "No matching objects were found."));
            } else {
                userObject[arrayName] = array;
                this.saveObject(msg, userObject, successText);
            }
        } else {
            this.push(responses.reply(msg, emptyText || 'You have no existing objects of this type.'));
        }
    }
}