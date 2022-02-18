let callbacks = new Map();
module.exports = {
    onReaction: (reaction, user) => {
        if(callbacks.has(reaction.message.id) && callbacks.get(reaction.message.id).has(reaction.emoji.identifier)) {
            //console.log(reaction.emoji.identifier, callbacks[reaction.message.id]);
            //console.log(callbacks[reaction.message.id][reaction.emoji.identifier]);
            callbacks.get(reaction.message.id).get(reaction.emoji.identifier) (reaction, user);
        }
    },

    addCallback: (emojiObjects, message, callback) => {
        for(let emoji of emojiObjects) {
            if(!callbacks.has(message.id)) {
                callbacks.set(message.id, new Map());
            }
            callbacks.get(message.id).set(emoji.toString(), callback);
        }
    },

    removeCallback: (emojiIdentifiers, message) => {
        for(let emoji of emojiIdentifiers) {
            if(callbacks.has(message.id) && callbacks.get(message.id).has(emoji)) {
                callbacks.get(message.id).delete(emoji);
            }
        }
    },

    removeAllCallbacks: (message) => {
        if(callbacks.has(message.id)) {
            callbacks.delete(message.id);
            //callbacks[message.id] = undefined;
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