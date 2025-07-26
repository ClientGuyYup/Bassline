module.exports = {
  name: 'unban',
  description: 'Remove the Banned role from a user (Admin/Owner only)',
  async execute(message, args) {
    // Restrict to server owner or administrators only
    if (
      !message.member.permissions.has('Administrator') &&
      message.author.id !== message.guild.ownerId
    ) {
      return message.reply("Only administrators or the server owner can use this command.");
    }

    if (!args[0]) {
      return message.reply("Please provide a user ID or mention to unban.");
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

    // Find Banned role
    const bannedRoleColor = 0xff0000;
    const bannedRole = message.guild.roles.cache.find(
      r => r.color === bannedRoleColor && r.name.toLowerCase().includes('banned')
    );

    if (!bannedRole) {
      return message.reply("There is no Banned role on this server.");
    }

    // Check if user has the banned role
    if (!member.roles.cache.has(bannedRole.id)) {
      return message.reply(`${user.tag} is not banned.`);
    }

    // Remove the banned role
    try {
      await member.roles.remove(bannedRole);
    } catch (err) {
      console.error('Failed to remove Banned role:', err);
      return message.reply('Failed to remove the Banned role.');
    }

    return message.reply(`Unbanned ${user.tag} by removing the Banned role.`);
  }
};
