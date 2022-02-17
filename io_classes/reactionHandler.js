let callbacks = new Map();
module.exports = {
    onReaction: (reaction, user) => {
        if(callbacks[reaction.message.id] && callbacks[reaction.message.id][reaction.emoji.name]) {
            callbacks[reaction.message.id][reaction.emoji.name] (reaction, user);
        }
    },

    addCallback: (emojis, message, callback) => {
        for(let emoji of emojis) {
            if(!callbacks[message.id]) {
                callbacks[message.id] = new Map();
            }
            callbacks[message.id][emoji] = callback;
        }
    },

    removeCallback: (emojis, message) => {
        for(let emoji of emojis) {
            if(callbacks[message.id] && callbacks[message.id][emoji]) {
                callbacks[message.id].delete(emoji);
            }
        }
    },

    removeAllCallbacks: (message) => {
        if(callbacks[message.id]) {
            callbacks[message.id] = undefined;
        }
    },

    addReactions: (emojis, message) => {
        for(let emoji of emojis) message.react(emoji);
    },

    removeReactions: (emojis, message) => {
        for(let emoji of emojis) {
            let found = message.reactions.cache.get(emoji);
            if(found) found.remove();
        }
    },

    toggleEmoji: (emojiA, emojiB, message) => {
        let isA = message.reactions.cache.get(emojiA);
        let isB = message.reactions.cache.get(emojiB);
        if(isA) {
            isA.remove();
            message.react(emojiB);
        }
        if(isB) {
            isB.remove();
            message.react(emojiA);
        }
    }
}