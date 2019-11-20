var reactController = require("./reactionController.js")
var searchStrats = require("./searchResultFunctions")

var {google} = require('googleapis'),
youtube = google.youtube( { version: 'v3', auth: '[redacted for security purposes.]' } ),
search = google.customsearch({ version: 'v1', auth: '[redacted for security purposes.]' } );


/**
 * CurrentSearchInfo - A class that contains unique information about each search including the invoking user, the raw response, and 
 * several key pieces of data including the strategy pattern function used to handle posting output of different types of searches.
 */

class currentSearchInfo {
	constructor(rCount, user, res, idx, func, q){
		this.resCount = rCount,
		this.user = user
		this.response = res,
		this.index = idx,
		this.strategy = func;
		this.query = q;
	}
}



module.exports = {
	handleImageSearch,
	handleYoutubeSearch,
}

/**
 * A simple function to format the query arguments.
 * @param {string} args - Input to be extracted into an appropriately formatted string to be passed into the Google APIs
 */

function extractTerms(args){
	var index = 0;
		var searchterms = "";
		while(index < args.length){
			searchterms+= args[index] + " ";
			++index;
		}
		return searchterms;
}


/**
 * Handling function for an image search command - will call the image search API function, store output, and launch the reaction-based controller.
 * @param {Discord.message} message - The discord message that invoked the command.
 * @param {string[]} args - The arguments provided with the message.
 */

function handleImageSearch(message, args){
	imageSearchAPICall(args, message.author).then(async output =>{
		var info = new currentSearchInfo(
			(parseInt(output.config.params.num) - 1),
			message.author,
			output,
			0,
			searchStrats.imageNextStrategy,
			output.config.params.q
			);
		target = await message.channel.send(searchStrats.prepareImageEmbed(info));
		var controller = new reactController(info);
		controller.launchController(target);
   },
	   _ => message.channel.send("Search Failed.")
   )
}

/**
 * Handling function for a youtube search command - will call the youtube search api function, store output, and launch the reaction based controller.
 * @param {Discord.message} message  - The discord message that invoked the command.
 * @param {string[]} args - The arguments provided with the message
 */

function handleYoutubeSearch(message, args){
	console.log(args);
	youtubeSearchAPICall(args).then(async output =>{
		var info = new currentSearchInfo(
			(parseInt(output.config.params.maxResults) - 1),
			message.author,
			output,
			0,
			searchStrats.youtubeNextStrategy,
			output.config.params.q
		)
		target = await message.channel.send(searchStrats.prepareYoutubeMessage(info));
		var controller = new reactController(info);
		controller.launchController(target);
		},
		err => {message.channel.send("Search Failed.")});
}

/**
 * Function that calls the Google custom search API. Returns a promise object.
 * @param {string[]} args - The search terms to be formatted.
 */

 function imageSearchAPICall(args){
    return new Promise(function(resolve, reject){
        searchterms = extractTerms(args);
		search.cse.list({
			"cx" : "[redacted for security purposes]",
			"q": searchterms,
			"searchType" : "image",
			"num" : 10	
		}).then(function(response){
			if(parseInt(response.data.searchInformation.totalResults) != 0){
				resolve(response)
			}else{
                reject("The api call is broken.");
			}
		},
		    function(err) { console.error("Execute error", err); 
        });
    })
}

/**
 * Function that calls the Youtube v3 API. Returns a promise object.
 * @param {string[]} args - The search terms to be formatted.
 */

 function youtubeSearchAPICall(args){
    return new Promise(function(resolve, reject){
    	searchterms = extractTerms(args);
		youtube.search.list({
			"part": "id,snippet",
			"maxResults": 5,
			"q": searchterms,
			"type": "video"
		    }).then(function(response) {
                resolve(response)  
			},
				function(err) { reject(err) }
			);
    })
}