module.exports = {
  name: 'ban',
  description: 'Soft ban a user by assigning a Banned role and restricting access (Admin/Owner only)',
  async execute(message, args) {
    // Restrict to server owner or administrators only
    if (
      !message.member.permissions.has('Administrator') &&
      message.author.id !== message.guild.ownerId
    ) {
      return message.reply("Only administrators or the server owner can use this command.");
    }

    if (!args[0]) {
      return message.reply("Please provide a user ID or mention to ban.");
    }

    // Fetch user by mention or ID
    let user;
    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else {
      try {
        user = await message.client.users.fetch(args[0]);
      } catch {
        return message.reply("Invalid user ID.");
      }
    }

    if (!user) return message.reply("User not found.");

    // Fetch guild member
    let member;
    try {
      member = await message.guild.members.fetch(user.id);
    } catch {
      return message.reply("User is not in this server.");
    }

    if (!member.manageable) {
      return message.reply("I cannot assign roles to this user due to role hierarchy.");
    }

    // Role color and name check
    const bannedRoleColor = 0xff0000;
    let bannedRole = message.guild.roles.cache.find(r => r.color === bannedRoleColor && r.name.toLowerCase().includes('banned'));

    // Create role if missing
    if (!bannedRole) {
      try {
        bannedRole = await message.guild.roles.create({
          name: 'Banned',
          color: bannedRoleColor,
          reason: 'Role for soft-banned users',
          permissions: []
        });

        // Update all channel permission overwrites for the role
        for (const [, channel] of message.guild.channels.cache) {
          await channel.permissionOverwrites.edit(bannedRole, {
            ViewChannel: false,
            SendMessages: false,
            Speak: false,
            Connect: false,
            AddReactions: false,
            ReadMessageHistory: false,
          }).catch(() => null);
        }
      } catch (err) {
        console.error('Failed to create Banned role or update permissions:', err);
        return message.reply('Failed to create the Banned role. Please check my permissions.');
      }
    }

    // Check if already banned
    if (member.roles.cache.has(bannedRole.id)) {
      return message.reply(`${user.tag} is already banned.`);
    }

    // Remove all roles except @everyone
    try {
      const rolesToRemove = member.roles.cache.filter(r => r.id !== message.guild.id);
      await member.roles.remove(rolesToRemove);
    } catch (err) {
      console.error('Failed to remove roles:', err);
      return message.reply('Failed to remove user roles.');
    }

    // Assign banned role
    try {
      await member.roles.add(bannedRole);
    } catch (err) {
      console.error('Failed to assign Banned role:', err);
      return message.reply('Failed to assign the Banned role.');
    }

    // DM user about ban
    try {
      await user.send(`You have been banned from **${message.guild.name}**.`);
    } catch {
      // Ignore if can't DM
    }

    return message.reply(`Soft-banned ${user.tag} by assigning the Banned role.`);
  }
};
