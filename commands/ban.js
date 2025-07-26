const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a user by giving them the Banned role and locking them out.',
  async execute(message, args) {
    const author = message.member;
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!author.permissions.has(PermissionsBitField.Flags.Administrator) &&
        message.guild.ownerId !== message.author.id) {
      return message.reply("❌ You don't have permission to use this command.");
    }

    if (!target) return message.reply('Please mention a valid user to ban.');

    if (target.id === message.author.id) return message.reply("You can't ban yourself.");
    if (target.id === message.client.user.id) return message.reply("You can't ban the bot.");

    // Check or create the Banned role
    let bannedRole = message.guild.roles.cache.find(role => role.name === 'Banned');

    if (!bannedRole) {
      bannedRole = await message.guild.roles.create({
        name: 'Banned',
        color: 0x2f3136, // dark gray
        reason: 'Created for banning users'
      });
    }

    // Move Banned role to top
    const botMember = await message.guild.members.fetchMe();
    const highestRole = botMember.roles.highest;

    try {
      await bannedRole.setPosition(highestRole.position - 1);
    } catch (err) {
      console.error('Failed to move role:', err);
    }

    // Deny access in all channels
    message.guild.channels.cache.forEach(async (channel) => {
      try {
        await channel.permissionOverwrites.edit(bannedRole, {
          ViewChannel: false
        });
      } catch (err) {
        console.error(`Failed to update channel ${channel.name}:`, err);
      }
    });

    // Add the role
    try {
      await target.roles.add(bannedRole, 'User was banned');
      await target.send(`You have been banned from **${message.guild.name}**.`);
      return message.reply(`✅ ${target.user.tag} has been banned.`);
    } catch (err) {
      console.error(err);
      return message.reply('❌ Failed to ban the user.');
    }
  }
};
