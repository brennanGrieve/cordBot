module.exports ={
    avatarHandler,
    helpHandler,
}

/**
 * Replies with the mentioned user's Avatar in Discord's RichEmbed format.
 * @param {Discord.Message} message - The message being handled.
 */

function avatarHandler(message){
    if(message.mentions.users.first() == null){
        message.channel.send("`" + message.author.username + "`" + "'s Avatar: ", {embed: embed = {"image" : { url: message.author.avatarURL}}});
    }else{
        message.channel.send("`" + message.mentions.members.first().user.username + "`'s Avatar: ", {embed: embed = {"image" : { url: message.mentions.members.first().user.avatarURL}}});
    }
}

/**
 * Prompts the bot to send a direct message listing available commands.
 * @param {Discord.Message} message - The message being handled.
 */

function helpHandler(message){
    message.author.send("Here's the list of available commands:\n\n" +
            " -yt [search terms] : I'll bring back a set of youtube videos based on your search terms.\n\n" +
            " -img [search terms] : I'll bring back a set of images based on your search terms.\n\n" +
    		" -avatar [@user] : I'll bring back the full-sized avatar of the person you mention.\n\n");
}
