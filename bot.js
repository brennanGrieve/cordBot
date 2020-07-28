const commandParser = require("./commandHandling/commandParser");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const tagFunctions = require("./commandHandling/tagCommandHandlers.js");

/**
 * Discord API function - It creates a websocket connection for the bot to operate on.
 */
client.login(config.token);

/**
 * Event handler for when the bot is ready and connected. Prints out some basic data on the server it's in, and brings up the database for use.
 */
client.on("ready", () => {
	client.user.setActivity("King of the Digital World.");
	tagFunctions.initDB();
});	

/**
 * Event handler for when the bot receives a message. It ignores the message if its from itself, checks for its command prefix, and then prepares the command 
 * for consideration by the command parsing functions.
 */

client.on("message", async message => {
	if(!message.author.bot && message.content[0] == config.prefix){
		const args = message.content.slice(config.prefix.length).trim().split(" ");
		const command = args.shift().toLowerCase();
		message.channel.startTyping();
		if(!await commandParser.parseCommand(message, command, args, client)){
	    	message.channel.send("Invalid command. Type !help for a list of valid commands");
		}
		message.channel.stopTyping();
	}
});

