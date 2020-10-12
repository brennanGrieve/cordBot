const Discord = require('discord.js')

/**
 * Reaction Filter function - Checks if the reaction is one of the control reactions/was not performed by the bot, 
 * and returns the filter result as a boolean.
 * @param {*} reaction - Object representing the reaction being filtered.
 * @param {Discord.User} user - Object describing the user that performed the reaction being filtered.
 */

const filter = (reaction, user) =>{
	return ["⏪", "⏩", "⏹️", "↩️", "🔢"].includes(reaction.emoji.name) && user.id !== target.author.id;
};

module.exports = class reactController{
	constructor(searchInfo){
		this.info = searchInfo;
	}

/**
 * Launches the reaction controller, and continues to listen for/handle reactions until the controller times out due to inactivity.
 * @param {Discord.Message} target - The message being monitored for reactions (Posted by the bot itself).
 */
	async launchController(target){
		await target.react("⏪");
		await target.react("↩️");
		await target.react("⏩");
		await target.react("🔢");
		var timeout = 0 
		while(timeout == 0){
				await target.awaitReactions(filter, {max : 1, time:60000, errors: ['time']}).then(async collected => {
				const reaction = await collected.first();
				if(reaction.emoji.name === "⏩" && reaction.users.cache.has(this.info.user.id)){
					await reaction.users.remove(this.info.user).then(_ =>{
						this.info.index+= this.info.radix;
						this.info.strategy(target, this.info);
					})
				}
				if(reaction.emoji.name === "⏪" && reaction.users.cache.has(this.info.user.id)){
					await reaction.users.remove(this.info.user).then(_ =>{
						this.info.index-= this.info.radix;
						this.info.strategy(target, this.info);
					})
				}
				if(reaction.emoji.name === "↩️" && reaction.users.cache.has(this.info.user.id)){
					await reaction.users.remove(this.info.user).then(_ =>{
						this.info.index = 0;
						this.info.strategy(target, this.info);
					})
				}
				if(reaction.emoji.name === "🔢" && reaction.users.cache.has(this.info.user.id)){
					await reaction.users.remove(this.info.user).then(async _ =>{
						if(await handleInput(target, this.info) == 1){
							this.info.strategy(target, this.info);
						}
					})
				}
			}).catch(collected => {
				timeout = 1
			});
		}
	}
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
    await target.channel.send("Which page do you want to jump to?").then(result => {
        sentMessage = result;
    });
    console.log("Starting to wait.");
    await target.channel.awaitMessages(response => !isNaN(response.content), {max : 1, time:15000, errors: ["Taking too long!"]}).then(collected => {
        const reply = collected.first();
        if(reply.content > 0 && reply.content <= (info.resCount + 1)){
			info.index = ((parseInt(reply.content, 10) - 1) * info.radix);
            success = 1;
        }
        reply.delete();
    })
    .catch(collected => {
        target.channel.send("Sorry, your request has timed out. Please try again.");
    })
	sentMessage.delete();
    return(success);
}

