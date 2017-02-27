bot.on('userUpdate', (user, oldUser) => {
    if (oldUser) {
        if (user.id != bot.user.id) {
            let guilds = bot.guilds.filter(g => g.members.get(user.id) != undefined);
            let username;
            let discrim;
            let fields;
            let description = '';

            if (oldUser.username != user.username || oldUser.discriminator != user.discriminator) {
                fields = [];
                if (oldUser.username != user.username) description += 'Username Changed\n';
                if (oldUser.discriminator != user.discriminator) description += 'Discriminator Changed\n';
                fields.push({
                    name: 'Old Name',
                    value: bu.getFullName(oldUser),
                    inline: true
                });
                fields.push({
                    name: 'New Name',
                    value: bu.getFullName(user),
                    inline: true
                });
                fields.push({
                    name: 'User ID',
                    value: user.id,
                    inline: true
                });

                guilds.forEach(g => {
                    bu.logEvent(g.id, 'nameupdate', fields, {
                        thumbnail: {
                            url: user.avatarURL
                        },
                        description
                    });
                });

            } else if (user.avatar != oldUser.avatar) {
                fields = [];
                fields.push({
                    name: 'User',
                    value: bu.getFullName(user),
                    inline: true
                });
                fields.push({
                    name: 'User ID',
                    value: user.id,
                    inline: true
                });
                guilds.forEach(g => {
                    bu.logEvent(g.id, 'avatarupdate', fields, {
                        image: {
                            url: user.avatarURL
                        },
                        thumbnail: {
                            url: `https://cdn.discordapp.com/avatars/${user.id}/${oldUser.avatar}.jpg`
                        },
                        description: ':arrow_right: Old avatar\n:arrow_down: New avatar'
                    });
                });
            }
        }
    }
});