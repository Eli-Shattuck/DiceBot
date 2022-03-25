module.exports = {
    message: (msg, content, attachment, thenLambda, shouldBreak) => {
        return {isMessage: true, msg, content, attachment, thenLambda, shouldBreak}
    },

    reply: (msg, content, attachment, thenLambda, shouldBreak) => {
        return {isReply: true, msg, content, attachment, thenLambda, shouldBreak}
    },

    edit: (msg, content, attachment, thenLambda, shouldBreak) => {
        return {isEdit: true, msg, content, attachment, thenLambda, shouldBreak}
    }
}