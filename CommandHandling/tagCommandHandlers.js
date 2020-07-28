var sql = require('sqlite3');
const Discord = require('discord.js');
const reactControls = require('./reactionController');

module.exports = {
    initDB,
    addTag,
    getOwner,
    searchTag,
    removeTag,
    editTag,
    listUserTags,
}

class listResultInfo{
    constructor(message, row, user, target, strat, index, resCount){
        this.message = message;
        this.results = row;
        this.user = user;
        this.target = target
        this.strategy = strat;
        this.index = index;
        this.resCount = resCount;
        this.radix = 10;
    }
}  

    var db;

    /**
     * Ensure the SQLite database exists/is initialized before trying to do anything with it.
     */

function initDB(){
    db = new sql.Database('./tagDb', (err) => {
    if (err) {
         return console.error(err.message);
    }
    console.log('Connected to the SQLite database on disk.');
    });
    db.run('CREATE TABLE IF NOT EXISTS Tags(dbPKTagName CONSTRAINT pk PRIMARY KEY, dbContentColumn, dbAuthorColumn);');
}

/**
 * This function handles adding tags to the database. It delegates checks and content preparation to checkIllegalTagName() and prepTagContent(), before using
 * parameterized SQLite queries to place data into the database. The parameterized queries protect from SQL injection attacks.
 * @param {String[]} args - The parameters provided with the invoking message. In a successful test case, this includes a name and data.
 * @param {Discord.Message} message - The Discord message that invoked the add operation.
 */

function addTag(args, message){
    if(args.length < 3){
        message.channel.send("Missing parameters.")
        return;
    }
    if(checkIllegalTagName(args[1], message)){
        return;
    }
    var toAdd = prepTagContent(args);
    try{
        db.run('INSERT INTO Tags VALUES(?,?,?)', [args[1].toLowerCase(), toAdd, message.author.id], function(err){
            if(err){
                console.log("Error encountered during write. Details are:");    
                console.log(err.message)
                if(err.errno == 19){
                message.channel.send("Tag : '" + args[1] + "' already exists!");
                }else{
                    message.channel.send("Currently unhandled error. ErrNo = " + err.errno + ". Tell Goldrush.");
                }
                return;
            }
            message.channel.send("Successfully added tag: '" + args[1] + "'.");
        });
    }catch(err){
        console.error(err);
    }
}

/**
 * Queries the database to find the owner of a given tag.
 * @param {String} param - The tag name to check ownership of.
 * @param {*} message - The message that invoked the command.
 * @param {*} client - The Discord Client object. This is required to get up-to-date information on the user that owns the tag.
 */

function getOwner(param, message, client){
    if(checkIllegalTagName(param, message)){
        return;
    }
    try{
    db.get("SELECT dbAuthorColumn FROM Tags WHERE dbPKTagName = ?", param.toLowerCase(), async function(err, row){
            if(err){
                return;
            }
            if(row == null){
                message.channel.send("Tag doesn't exist.");
                return;
            }
            var user = await client.users.fetch(row.dbAuthorColumn)
            message.channel.send("This tag belongs to: `" + user.username + "#" + user.discriminator + "`.");
        });
    }catch(err){   
        console.error(err);
    }
}

/**
 * 
 * @param {String} param - The tag name to fetch from the database.
 * @param {Discord.Channel} channel - The channel where the command was invoked.
 */

function searchTag(param, channel){
    try{
    db.get("SELECT dbContentColumn FROM Tags WHERE dbPKTagName = ?", param.toLowerCase(), (err, row) => {
        if (err) {
          return console.error(err);
        }
        if(row == null){
            channel.send("Tag doesn't exist.");
            return;
        }
            channel.send(row.dbContentColumn);
      });
    }catch(err){
        console.error(err);
    }
}

/**
 * Removes a tag from the database.
 * @param {String} param - The tag to remove.
 * @param {Discord.Message} message - The message that invoked the command call.
 */

function removeTag(param, message){
    if(checkIllegalTagName(param, message)){
        return;
    }
    try{
        db.get("SELECT dbAuthorColumn FROM Tags WHERE dbPKTagName = ?", param.toLowerCase(), (err, row) => {
            if(row == null){
                message.channel.send("Tag doesn't exist.");
                return;
            }
            if(err){
                return console.error(err);
            }
            if(row.dbAuthorColumn == message.author.id){
                db.run("DELETE FROM Tags WHERE dbPKTagName = ?", param.toLowerCase(), (err) => {
                    message.channel.send("Tag: " + param.toLowerCase() + " has been deleted successfully.")
                });
            }else{
                message.channel.send("You can't delete other people's tags.")
            }
        });
    }catch(err){
        console.error(err);
    }
}

/**
 * Allows a tag to be edited. Checks the author of the invoking message to ensure that only the owner of a tag is allowed to edit it.
 * @param {String[]} args - The parameters provided by the initial message.
 * @param {Discord.Message} message - The message that invoked the command.
 */

function editTag(args, message){
    if(args.length < 3){
        message.channel.send("Missing parameters.")
        return;
    }
    if(checkIllegalTagName(args[1], message)){
        return;
    }
    try{
        db.get("SELECT dbAuthorColumn FROM Tags WHERE dbPKTagName = ?;", args[1].toLowerCase(), (err, row) => {
            if(err){
                return console.error(err);
            }
            if(row == null){
                message.channel.send("Tag doesn't exist.");
                return;
            }
            if(row.dbAuthorColumn == message.author.id){
                var toAdd = prepTagContent(args)
                db.run("UPDATE Tags SET dbContentColumn = ? WHERE dbPKTagName = ?", toAdd, args[1].toLowerCase(), (err) => {
                    message.channel.send("Tag: " + args[1].toLowerCase() + " has been edited successfully.")
                });
            }else{
                message.channel.send("You can't edit other people's tags.")
            }

        });
    }catch(err){
        console.error(err);
    }
}

/**
 * Lists all tags a user owns. This command launches a reaction controller, so the invoker of the message can use it to view multiple pages of tags.
 * @param {Discord.Message} message - The message that invoked the command.
 * @param {Discord.User} toTarget - The user whose tag list is being requested.
 * @param {Discord.Client} client - Required to query up-to-date user information.
 */

function listUserTags(message, toTarget, client){
    var userTarget;
    if(toTarget != null){userTarget = toTarget.id}
    else{userTarget = message.author.id}
    db.all('SELECT dbPKTagName FROM Tags WHERE dbAuthorColumn = ?;', userTarget, async (err, row) => {
        if(err){
            return console.error(err);
        }
        if(row.length == 0 || row == null){
            message.channel.send("User owns no tags.");
            return;
        }else{
            targetProfile = await client.users.fetch(userTarget);
            var info = new listResultInfo(message, row, message.author, targetProfile.username, tagListNextStrategy, 0, row.length);
            target = await message.channel.send(prepTagListMessage(info));
            var controller = new reactControls(info);
            controller.launchController(target);
        }
    });
}

/**
 * Checks for illegal tag names and sends a message indicating that an operation has failed if this check is not passed.
 * @param {String} param - The name parameter passed into any applicable command. 
 * @param {Discord.Message} message - The message that invoked the command being checked.
 */

function checkIllegalTagName(param, message){
    if(param == "dbPKTagName" || param == "dbContentColumn" || param == "dbAuthorColumn"){
        message.channel.send("Tag name is invalid. Please try again with a different name.");
        return 1;
    }else{
        return 0;
    }
    
}

/**
 * Concatenates each parameter that contains data to be inserted into the database.
 * @param {String[]} args - The parameters sent with the invoking message.
 */

function prepTagContent(args){
    var max = args.length;
    var toAdd = '';
    for(i = 2; i < max; i++){
        toAdd+= args[i];
        toAdd+= ' ';
    }
    return toAdd;
}

/**
 * Fetches a subset of results from the info structure and prepares them to be used as a field for the specially generated message response that makes up the display of
 * the reaction controller.
 * @param {listResultInfo} info - A structure containing all information gathered during the list query to be used by the reaction controller for response generation.
 */

function prepTagListMessage(info){
    var tagListData = '';
    var i = info.index;
    var limit = i + 10;
    while(i < limit){
        if(i >= info.resCount) { break; }
        tagListData += info.results[i].dbPKTagName
        tagListData += '\n'
        i++;
    }
    return listEmbed = new Discord.MessageEmbed()
    .setAuthor(info.user.username, info.user.avatarURL())
    .setTitle(info.target + "'s Owned Tags")
    .addField('Tags: ', tagListData)
    .setFooter('Page: ' + ((info.index / info.radix) + 1) + '/' + (Math.floor( info.resCount / info.radix) + 1))
}

/**
 * A strategy pattern method, used to allow the reaction controller to properly handle iteration over the input provided by a tag list query.
 * @param {Discord.Message} target - The initial message sent by the reaction controller to be edited.
 * @param {listResultInfo} info - A structure containing all information gathered during the list query to be used by the reaction controller for response generation. 
 */

function tagListNextStrategy(target, info){
    if(info.index > info.resCount){
        info.index = 0;
    }
    if(info.index < 0){
        info.index = (info.resCount - (info.resCount % info.radix));
    }
    target.edit(prepTagListMessage(info));
}