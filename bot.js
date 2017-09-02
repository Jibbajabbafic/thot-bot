// Add modules
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require('fs');

// Channel IDs
// cunts and runts channel id = '338812737268219910';
// eye poppin chatte server id = '338812737268219908';

function listVoiceChannels(server) {
    var channels = bot.servers[server].channels;
    for (var channel in channels) {
        if (channels[channel].type === 'voice') {
            logger.info(channel + " - " + channels[channel].name);
        }
    }
    logger.info('Finished listing voice channels!');
}

function listServers() {
    for (var item in bot.servers) {
        logger.info('Server: ' + item)
    }
}

function dumpBotJSON() {
    fs.writeFile('bot_info_dump.json', JSON.stringify(bot, null, '\t'), (err) => {
        if (err) logger.error(err);
        logger.info('Bot info dumped to bot_info_dump.json!');
    });
}

function findVoiceChannelID_from_userID(userID, serverID, callback) {
    if (bot.servers[serverID] == null) callback(new Error('Invalid server ID!'));
    else if (bot.servers[serverID].members[userID] == null) callback(new Error('Invalid user ID!'));
    else if (bot.servers[serverID].members[userID].voice_channel_id == null) callback(new Error('User not in voice channel!'));
    else return bot.servers[serverID].members[userID].voice_channel_id;
}

function findServerID_from_channelID(channelID, callback) {
    if (bot.channels[channelID] == null) callback(new Error('Invalid channel ID!'));
    else if (bot.channels[channelID].guild_id == null) callback(new Error('Server ID is null!'));
    else return bot.channels[channelID].guild_id;
}

function playSoundInChannel(filename, userID, channelID, callback) {
    var foundServerID = findServerID_from_channelID(channelID, function(err) {
        if (err) callback(err);
    });
    logger.info('Found server ID: ' + foundServerID);

    var foundVoiceChannelID = findVoiceChannelID_from_userID(userID, foundServerID, function (err) {
        if (err) {
            bot.sendMessage({
                to: channelID,
                message: 'OI, GET IN A VOICE CHANNEL FIRST!'
            });
            callback(err);
        }
    });
    logger.info('Found voice channel ID: ' + foundVoiceChannelID);

    logger.info('Joining voice channel with ID: ' + foundVoiceChannelID);

    bot.joinVoiceChannel(foundVoiceChannelID, function(error, events){
        if (error) callback(error);
        // Get audio context
        bot.getAudioContext(foundVoiceChannelID, function(error, stream){
            if (error) callback(error);
            fs.createReadStream('./sounds/' + filename).pipe(stream, {end: false});
            stream.once('done', function() {
                // Stream done, leave channel
                bot.leaveVoiceChannel(foundVoiceChannelID);
                logger.info('Sent sound: ' + filename);
                logger.info('Left voice channel with ID: ' + foundVoiceChannelID);
                callback(null);
            });
        });
    });
}

function printAllInfo(user, userID, channelID, message, evt) {
    logger.info('Printing current info...');
    logger.info('user: ' + user);
    logger.info('userID: ' + userID);
    logger.info('channelID: ' + channelID);
    logger.info('message: ' + message);
    logger.info('evt: ' + evt);
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

var isReady = false;

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    isReady = true;
    //listVoiceChannels(serverID);
    //listServers();
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        if (!isReady) {
            logger.info('Bot not ready!');
            bot.sendMessage({
                to: channelID,
                message: "HOLD ON I'M BUSY WITH SOMETHING PAL!"
            });
            return;
        }
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        // logger.info('before args = ' + args);
        args = args.splice(1);
        // logger.info('after args = ' + args);

        // logger.info('Message received from:');
        // logger.info('Server ID: ' + msgServerID);
        // logger.info('Voice Channel ID: ' + msgVoiceID);     
        logger.info('==========');
        logger.info('Caught: !' + cmd);
        logger.info('From: ' + user)
        switch(cmd) {
            case 'thot':
                logger.info('Valid command: ' + cmd);
                isReady = false;
                bot.sendMessage({
                    to: channelID,
                    message: 'THOT BOT IS HERE!',
                    tts: true
                });
                // printAllInfo(user, userID, channelID, message, evt);
                isReady = true;
                break;

            case 'pizza':
                logger.info('Valid command: ' + cmd);
                isReady = false;

                // bot.sendMessage({
                //     to: channelID,
                //     message: 'TIME TO DELIVER A PIZZABALL!',
                //     tts: true
                // });

                playSoundInChannel('pizzaball.ogg', userID, channelID, function(err) {
                    isReady = true;
                    if (err) return logger.error(err);
                });

                // var msgVoiceID = findVoiceChannelID_from_userID(userID, msgServerID);

                // printAllInfo(user, userID, channelID, message, evt);
                // Get voiceChannelID from user/member object somehow
                // bot.members???
                // var msgServerID = bot.channels[channelID].guild_id;
                // var msgVoiceID = bot.servers[msgServerID].members[userID].voice_channel_id;
                // logger.info('Message received from:');
                // logger.info('Server ID: ' + msgServerID);
                // logger.info('Voice Channel ID: ' + msgVoiceID);
                break;

            case 'sniffy':
                logger.info('Valid command: ' + cmd);
                isReady = false;
                playSoundInChannel('sniffy.ogg', userID, channelID, function(err) {
                    isReady = true;
                    if (err) return logger.error(err);
                });
                break;

            // case 'oisd':
            //     dumpBotJSON()
            //     break;
            // 

            default:
                logger.info('Invalid command: ' + cmd);
                bot.sendMessage({
                    to: channelID,
                    message: "THAT'S NOT A VALID COMMAND YOU PLONKER!"
                });
                break;
        }
    }
});