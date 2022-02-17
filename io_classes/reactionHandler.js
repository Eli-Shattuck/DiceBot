let callbacks = new Map();
module.exports = {
    onReaction: (reaction, user) => {
        if(callbacks[reaction.message.id] && callbacks[reaction.message.id][reaction.emoji.identifier]) {
            console.log(reaction.emoji.identifier);
            callbacks[reaction.message.id][reaction.emoji.identifier] (reaction, user);
        }
    },

    addCallback: (emojiIdentifiers, message, callback) => {
        for(let emoji of emojiIdentifiers) {
            if(!callbacks[message.id]) {
                callbacks[message.id] = new Map();
            }
            callbacks[message.id][emoji] = callback;
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

    addReactions: (emojiIdentifiers, message) => {
        console.log(emojiIdentifiers);
        for(let emoji of emojiIdentifiers) message.react(emoji);
    },

    removeReactions: (emojiIdentifiers, message) => {
        for(let emoji of emojiIdentifiers) {
            let found = message.reactions.cache.get(emoji);
            if(found) found.remove();
        }
    },

    toggleEmoji: (emojiAIdentifier, emojiBIdentifier, message) => {
        let isA = message.reactions.cache.get(emojiAIdentifier);
        let isB = message.reactions.cache.get(emojiBIdentifier);
        if(isA) {
            isA.remove();
            message.react(emojiBIdentifier);
        }
        if(isB) {
            isB.remove();
            message.react(emojiAIdentifier);
        }
    }
}