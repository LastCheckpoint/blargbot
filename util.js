var moment = require('moment-timezone')

var e = module.exports = {}
e.CAT_ID = "103347843934212096";
e.catOverrides = true

e.db = null
e.config = null
e.emitter = null
e.VERSION = null
e.startTime = null
e.vars = null

e.CommandType = {
    GENERAL: 1,
    CAT: 2,
    MUSIC: 3,
    COMMANDER: 4,
    ADMIN: 5,
    properties: {
        1: { name: 'General', requirement: msg => true },
        2: { name: 'CATZ MEOW MEOW', requirement: msg => msg.author.id == e.CAT_ID },
        3: { name: 'Music', requirement: msg => e.config.discord.musicGuilds[msg.channel.guild.id] },
        4: { name: 'Bot Commander', requirement: msg => e.hasPerm(msg, 'Bot Commander', true), perm: 'Bot Commander'},
        5: { name: 'Admin', requirement: msg => e.hasPerm(msg, 'Admin', true), perm: 'Admin'}
    }
}

e.init = (Tbot) => {
    e.bot = Tbot
}

/**
 * Checks if a user has a role with a specific name
 * @param msg - the message (Message)
 * @param perm - the name of the role required (String)
 * @param quiet - if true, won't output an error (Boolean)
 * @returns {boolean}
 */
e.hasPerm = (msg, perm, quiet) => {
    if ((msg.member.id === e.CAT_ID && e.catOverrides) || msg.channel.guild.ownerID == msg.member.id || msg.member.permission['administrator']) {
        return true;
    }
    var roles = msg.channel.guild.roles.filter(m => m.name == perm);
    for (var i = 0; i < roles.length; i++) {
        if (msg.member.roles.indexOf(roles[i].id) > -1) {
            return true;
        }
    }
    if (!quiet)
        e.sendMessageToDiscord(msg.channel.id, `You need the role '${perm}' in order to use this command!`);
    return false;
}

/**
 * Sends a message to discord.
 * @param channelId - the channel id (String)
 * @param message - the message to send (String)
 * @param file - the file to send (Object|null)
 * @returns {Promise.<Message>}
 */
e.sendMessageToDiscord = function (channelId, message, file) {
    try {
        if (!file)
            return e.bot.createMessage(channelId, message).catch(err => console.log(err.stack));
        else
            return e.bot.createMessage(channelId, message, file).catch(err => console.log(err.stack));

    } catch (err) {
        console.log(err);
    }
}

/**
 * Gets a user from a name (smartly)
 * @param msg - the message (Message)
 * @param name - the name of the user (String)
 * @param quiet - if true, won't respond with multiple users found(Boolean)
 * @returns {User|null}
 */
e.getUserFromName = (msg, name, quiet) => {
    var userId;
    var discrim;
    if (/<@!?[0-9]{17,21}>/.test(name)) {
        userId = name.match(/<@!?([0-9]{17,21})>/)[1];
        return e.bot.users.get(userId);
    }
    if (/[0-9]{17,21}/.test(name)) {
        userId = name.match(/([0-9]{17,21})/)[1];
        return e.bot.users.get(userId);
    }
    if (/^.*#\d{4}$/.test(name)) {
        discrim = name.match(/^.*#(\d{4}$)/)[1];
        name = name.substring(0, name.length - 5);
    }
    if (!discrim) {
        var userList = msg.channel.guild.members.filter(m => m.user.username && m.user.username == name);
        if (userList.length == 0) {
            userList = msg.channel.guild.members.filter(m => m.user.username && m.user.username.toLowerCase() == name);
        }
        if (userList.length == 0) {
            userList = msg.channel.guild.members.filter(m => m.user.username && m.user.username.startsWith(name));
        }
        if (userList.length == 0) {
            userList = msg.channel.guild.members.filter(m => m.user.username && m.user.username.toLowerCase().startsWith(name));
        }
    } else {
        userList = msg.channel.guild.members.filter(m => m.user.username && m.user.discriminator && m.user.username == name && m.user.discriminator == discrim);
        if (userList.length == 0) {
            userList = msg.channel.guild.members.filter(m => m.user.username && m.user.discriminator && m.user.username.toLowerCase() == name && m.user.discriminator == discrim);
        }
        if (userList.length == 0) {
            userList = msg.channel.guild.members.filter(m => m.user.username && m.user.discriminator && m.user.username.startsWith(name) && m.user.discriminator == discrim);
        }
        if (userList.length == 0) {
            userList = msg.channel.guild.members.filter(m => m.user.username && m.user.discriminator && m.user.username.toLowerCase().startsWith(name) && m.user.discriminator == discrim);
        }
    }
    userList.sort();

    if (userList.length == 1) {
        return userList[0].user;
    } else if (userList.length == 0) {
        if (!quiet)
            e.sendMessageToDiscord(msg.channel.id, `No users found.`)
        return null;
    } else {
        var userListString = ''
        for (var i = 0; i < userList.length; i++) {
            userListString += `- ${userList[i].user.username}#${userList[i].user.discriminator}\n`
        }
        if (!quiet)
            e.sendMessageToDiscord(msg.channel.id, `Multiple users found!\`\`\`
${userListString}
\`\`\``);
        return null;
    }


}

/**
 * Saves the config file
 */
e.saveConfig = () => {
    e.emitter.emit('saveConfig');
}

/**
 * Reloads the user list (only for irc)
 */
e.reloadUserList = () => {
    e.emitter.emit('ircUserList');
}

/**
 * Gets a random integer within the range
 * @param min - minimum value (int)
 * @param max - maximum value (int)
 * @returns {int}
 */
e.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates an uptime string
 * @param moment1 - start time
 * @param moment2 - end time
 * @returns {string}
 */
e.createTimeDiffString = (moment1, moment2) => {

    var ms = moment1.diff(moment2);

    var diff = moment.duration(ms);
    //  console.log(diff.humanize());
    var days = diff.days();
    diff.subtract(days, 'd');
    var hours = diff.hours();
    diff.subtract(hours, 'h');
    var minutes = diff.minutes();
    diff.subtract(minutes, 'm');
    var seconds = diff.seconds();
    return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}

/**
 * Gets how much memory the bot is currently using
 * @returns {number}
 */
e.getMemoryUsage = () => {
    var memory = process.memoryUsage();
    return memory.rss / 1024 / 1024;
}

e.bans = {}

e.unbans = {}

e.logAction = (guild, user, mod, type) => {
    console.log('fuck')
    if (e.config.discord.servers[guild.id] && e.config.discord.servers[guild.id].modlog) {
        console.log('fuck2')

        var stmt = e.db.prepare(`select caseid from modlog where guildid = ? order by caseid desc limit 1`)
        stmt.get(guild.id, (err, row) => {
            if (err) {
                console.log(err)
                return
            }
            var caseid = 0
            if (row && row.caseid >= 0) {
                caseid = row.caseid + 1
            }
            var message = `**Case ${caseid}**
**Type:** ${type}
**User:** ${user.username}#${user.discriminator} (${user.id})
**Reason:** Responsible moderator, please do \`reason ${caseid}\` to set.
**Moderator:** ${mod ? `${mod.username}#${mod.discriminator}` : 'Unknown'}`

            e.sendMessageToDiscord(e.config.discord.servers[guild.id].modlog, message).then(msg => {
                stmt = e.db.prepare(`insert into modlog (guildid, caseid, userid, modid, type, msgid) 
                    values (?, ?, ?, ?, ?, ?)`)
                stmt.run(guild.id, caseid, user.id, mod ? mod.id : null, type, msg.id, err => {
                    console.log(err)
                })
                return msg
            }).catch(err => {
                console.log(err)
            })



        })
    }
}