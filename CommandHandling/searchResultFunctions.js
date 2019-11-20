const Discord = require("discord.js");

module.exports = {
    youtubeNextStrategy,
    imageNextStrategy,
    prepareImageEmbed,
    prepareYoutubeMessage,
    handleInput
}


/**
 * A function used for an implementation of the Strategy pattern. This allows the Reaction Controller to perform whichever edit task is appropriate, depending
 * on the kind of search it's being used to control. This onn is used for Youtube Searches.
 * @param {Discord.Message} target - The message (From the bot) to be edited.
 * @param {CurrentSearchInfo} info - An object full of data representing the search the message is displaying.
 */

function youtubeNextStrategy(target, info){
    target.edit(prepareYoutubeMessage(info))
}   

/**
 * Another function used as part of a Strategy pattern. This one is used for Google Image Searches.
 * @param {Discord.Message} target - The message (From the bot) to be edited.
 * @param {CurrentSearchInfo} info - An object full of data representing the search the message is displaying.
 */

function imageNextStrategy(target, info){
    target.edit(prepareImageEmbed(info));
}

/**
 * A function that prepares a Discord RichEmbed object using Image Search data.
 * @param {CurrentSearchInfo} info - An object full of data representing the search the embed is being prepared for.
 */


function prepareImageEmbed(info){
    return embed = new Discord.RichEmbed()
    .setAuthor(info.user.username, info.user.avatarURL)
    .setTitle("Google Image Search Results")
    .setDescription("Search Terms: [ " + info.query + "]")
    .setImage(info.response.data.items[info.index].link)
    .setFooter("Google Image Search Result (" + (info.index + 1) + "/" + (info.resCount + 1) + ")", 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png');
}

/**
 * A function that composes a Youtube link with the search result object, and also includes helpful information like indexes.
 * @param {CurrentSearchInfo} info - An object full of data representing the search the embed is being prepared for.
 */

function prepareYoutubeMessage(info){
    return("https://www.youtube.com/watch?v=" + info.response.data.items[info.index].id.videoId + " \n`(" + (info.index + 1) + "/" + (info.resCount + 1) + ")`");
}

/**
 * A function to handle message-based input when using the index-jump function to immediately jump to a particular search result.
 * Cleans up after itself entirely so the channel doesn't become flooded.
 * @param {Discord.Message} target - Contains information on the channel the search was invoked from. Used to determine where to post prompts and listen for input.
 * @param {CurrentSearchInfo} info - The object that contains information about the search author, the google api's search response, etc.
 */

async function handleInput(target, info){
    var sentMessage;
    var success = 0;
    await target.channel.send("Enter the index you want to jump to.").then(result => {
        sentMessage = result;
    });
    await target.channel.awaitMessages(mFilter, {maxMatches : 1, time:15000, errors: ["Timed out."]}).then(collected => {
        const reply = collected.first();
        if(reply.content > 0 && reply.content <= (info.resCount + 1)){
            info.index = (parseInt(reply.content, 10) - 1);
            success = 1;
        }
        reply.delete();
    })
    .catch(_ => {
        target.channel.send("Timed out.");
    })
    sentMessage.delete();
    return success;
}

/**
 * Filter function used by the MessageCollector (The awaitMessages function is just a dressup for the MessageCollector class) to determine which messages to process.
 * @param {string} response - The message being checked.
 */

const mFilter =  response  => {
	return !isNaN(response);
}
