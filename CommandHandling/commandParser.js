const searchHandlers = require('./searchHandlers.js');
const texthandlers = require('./textCommandHandlers.js');


module.exports = {
    parseCommand
}

/**
 * This function checks the message command against all valid commands, and executes the expected task if a command is found.
 * In the event that no matching command handler is found, the return value will be false to prompt the sending of an error message.
 * @param {Discord.message} message - An object representing the message being evaluated.
 * @param {string} command - The extracted command from the message to be checked.
 * @param {string[]} args  - The parameters added to the message.
 */

async function parseCommand(message, command, args){
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
	 * Text based command handlers. These commands do not use any resources on disk, or make any API calls. 
	 * avatar - Returns either the sender's avatar (No parameters) or the specified user's avatar.
	 * help - Has the bot DM a list of its commands.
	 */

	if(command == "avatar"){ 
		valid = 1;
		texthandlers.avatarHandler(message);
	}
	
    if(command == "help"){
    	valid = 1;
    	texthandlers.helpHandler(message);
	}
	
    return valid;
    
}

