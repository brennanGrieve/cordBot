const cardDrawHandlers = require('./cardDrawer/drawingCommandHandlers.js');
const searchHandlers = require('./searchHandlers.js');
const texthandlers = require('./textCommandHandlers.js');
const imageHandlers = require('./imageCommandHandlers.js');
const tagHandlers = require('./tagCommandHandlers.js');


module.exports = {
    parseCommand
}

/**
 * This function checks the message command against all valid commands, and executes the expected task if a command is found.
 * In the event that no matching command handler is found, the return value will be false to prompt the sending of an error message.
 * @param {Discord.message} message - An object representing the message being evaluated.
 * @param {string} command - The extracted command from the message to be checked.
 * @param {string[]} args  - The parameters added to the message.
 * @param {Discord.Client} client - Some functions require a reference to the client for specific interactions with the Discord api.
 */

async function parseCommand(message, command, args, client){
	valid = 0;

	/**
	 * Google API command handlers. These commands use the Google API to perform searches on google services (Images, Youtube).
	 * Due to the quota system, these commands should be used sparingly. This bot would not be fit for widespread use using the Google APIs due to this restriction.
	 * Maybe one day these will be retired and replaced with HTML Scraping solutions to get results without using the API.
	 * 
	 * img - Performs a google image search on the given String parameter.
	 * yt - Performs a youtube video search on the given String parameter.
	 */

	if(command == "img"){
		valid = 1;
        searchHandlers.handleImageSearch(message, args);
	}

	if(command == "yt"){
        valid = 1;
        searchHandlers.handleYoutubeSearch(message, args);
	}

	/** 
	 * Text based command handlers. These commands do not use any resources on disk, or make any API calls. Generally speaking, they're simple. 
	 * 
	 * avatar - Returns either the sender's avatar (No parameters) or the specified user's avatar.
	 * thump - Sends the bot after the specified user.
	 * help - Has the bot DM a list of its commands.
	 * poke - Sends the bot to poke the specified user. (Functionally the same as thump, but with a different message.)
	 */

	if(command == "avatar"){ 
		valid = 1;
		texthandlers.avatarHandler(message);
	}

		
    if(command == "help"){
    	valid = 1;
    	texthandlers.helpHandler(message);
	}

	/**
	 * Tag System Command handlers.
	 * t acts as an additional prefix that directs inputted commands to this handler.
	 * All CRUD operations are available - 
	 * - Add (Create)
	 * - Read (Via tag name as param)
	 * - Edit (Update),
	 * - Remove (Delete). 
	 * Also supports listing of all tags assigned to a single user, and checking to find the owner 
	 * of any given tag. 
	 * Passes along the invoking message, and any relevant args to the relevant tag command handler.
	 */

	if(command == "t"){
		valid = 1;
		if(message.attachments.first() != null){
			args[args.length] = message.attachments.first().url;
		}
		if(args[0] == null){
			message.channel.send("Empty command.");
			return valid;
		}
		if(args[0].toLowerCase() == 'add' || args[0].toLowerCase() == 'create'){
			tagHandlers.addTag(args, message);
		}else if(args[0].toLowerCase() == 'remove' || args[0].toLowerCase() == 'delete'){
			tagHandlers.removeTag(args[1], message);
		}else if(args[0].toLowerCase() == 'owner'){
			tagHandlers.getOwner(args[1], message, client)
		}else if(args[0].toLowerCase() == 'edit'){
			tagHandlers.editTag(args, message)
		}else if(args[0].toLowerCase() == 'list'){
			if(message.mentions.users.first() != null){
				target = await client.users.fetch(message.mentions.users.first().id);
				tagHandlers.listUserTags(message, target, client)
			}else{
				tagHandlers.listUserTags(message, null, client)
			}
		}else{
			tagHandlers.searchTag(args[0], message.channel);
		}
	}
	return valid;
}

