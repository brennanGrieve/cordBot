var searchFuncs = require("../commandHandling/searchResultFunctions");

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
		await target.react("⏹️");
		await target.react("⏩");
		await target.react("↩️");
		await target.react("🔢");
		var timeout = 0 
		while(timeout == 0){
				await target.awaitReactions(filter, {max : 1, time:60000, errors: ['time']}).then(async collected => {
				const reaction = collected.first();
				if(reaction.emoji.name === "⏩" && reaction.users.has(this.info.user.id)){
					await reaction.remove(this.info.user).then(_ => {
						if(this.info.index < this.info.resCount){
							this.info.index++;
							this.info.strategy(target, this.info);
						}	
					})
				}
				if(reaction.emoji.name === "⏪" && reaction.users.has(this.info.user.id)){
					await reaction.remove(this.info.user).then(_ =>{
						if(this.info.index != 0){
							this.info.index--;
							this.info.strategy(target, this.info);
						}
					})
				}
				if(reaction.emoji.name === "⏹️" && reaction.users.has(this.info.user.id)){
					await reaction.remove(this.info.user).then(_ =>{
						timeout = 1;
					})
				}
				if(reaction.emoji.name === "↩️" && reaction.users.has(this.info.user.id)){
					await reaction.remove(this.info.user).then(_ => {
						this.info.index = 0;
						this.info.strategy(target, this.info);
					})
				}
				if(reaction.emoji.name === "🔢" && reaction.users.has(this.info.user.id)){
					await reaction.remove(this.info.user).then(async _ => {
						if(await searchFuncs.handleInput(target, this.info)){
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