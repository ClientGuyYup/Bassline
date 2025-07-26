module.exports = {
  name: 'invite',
  description: 'Get the bot invite link with all required permissions',
  execute(message) {
    const inviteURL = 'https://discord.com/oauth2/authorize?client_id=1398464080007659560&permissions=268518528&scope=bot%20applications.commands';
    message.reply(`Invite me to your server with this link:\n${inviteURL}`);
  }
};
