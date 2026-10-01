const MAX_ECHANGE = 10;
const EXPIRATION_MEMOIRE = 30 * 60 * 1000;

const conversation = new Map();

function getHistorique(channelId) {
    const conv = conversation.get(channelId);
    if(!conv){
        return [];
    }else if(Date.now() - conv.lastMessage > EXPIRATION_MEMOIRE){
        conversation.delete(channelId);
        return [];
    }else{
        return [...conv.message];
    }
}

function ajouterHistorique(channelId, question, reponse) {
    const messages = getHistorique(channelId);
    messages.push(
        {role: "user", content: question},
        {role: "assistant", content: reponse}
    );
    const last = messages.slice(-MAX_ECHANGE * 2);

    conversation.set(channelId, {message: last, lastMessage: Date.now()});
}

module.exports = {getHistorique, ajouterHistorique};