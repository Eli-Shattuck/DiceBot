let callbacks = new Map();
module.exports = {
    onReaction: (reaction, user) => {
        if(callbacks[reaction.message.id] && callbacks[reaction.message.id][reaction.emoji.identifier]) {
            //console.log(reaction.emoji.identifier, callbacks[reaction.message.id]);
            //console.log(callbacks[reaction.message.id][reaction.emoji.identifier]);
            callbacks[reaction.message.id][reaction.emoji.identifier](reaction, user);
        }
    },

    addCallback: (emojiObjects, message, callback) => {
        for(let emoji of emojiObjects) {
            if(!callbacks[message.id]) {
                callbacks[message.id] = new Map();
            }
            callbacks[message.id][emoji.toString()] = callback;
        }
    },

    removeCallback: (emojiIdentifiers, message) => {
        for(let emoji of emojiIdentifiers) {
            if(callbacks[message.id] && callbacks[message.id][emoji]) {
                callbacks[message.id].delete(emoji);
            }
        }
    },

    removeAllCallbacks: (message) => {
        if(callbacks[message.id]) {
            callbacks.delete(message.id);
        }
    },

    addReactions: (emojiObjects, message) => {
        //console.log(emojiIdentifiers);
        for(let emoji of emojiObjects) message.react(emoji.toString());
    },

    removeReactions: (emojiObjects, message) => {
        for(let emoji of emojiObjects) {
            let found = message.reactions.cache.get(emoji.id);
            if(found) found.remove();
        }
    },

    toggleEmoji: (emojiAObject, emojiBObject, message) => {
        //console.log('called toggle', message);
        let isA = message.reactions.cache.get(emojiAObject.id);
        let isB = message.reactions.cache.get(emojiBObject.id);
        //console.log(isA, isB);
        if(isA) {
            isA.remove();
            message.react(emojiBObject.toString());
        }
        if(isB) {
            isB.remove();
            message.react(emojiAObject.toString());
        }
    }
}