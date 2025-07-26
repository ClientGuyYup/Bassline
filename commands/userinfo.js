const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Shows info about a user (status, avatar, game, etc.) in an image.',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id).catch(() => null);

    if (!member) return message.reply("Couldn't find that user.");

    const activities = member.presence?.activities || [];
    const activity = activities.find(a => a.type === 0); // Playing

    const statusColors = {
      online: '#43b581',
      idle: '#faa61a',
      dnd: '#f04747',
      offline: '#747f8d'
    };

    const status = member.presence?.status || 'offline';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2c2f33';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 20, 36, 128, 128);

    // Username and ID
    ctx.font = 'bold 24px Sans';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${user.username}#${user.discriminator}`, 160, 60);

    ctx.font = '16px Sans';
    ctx.fillStyle = '#b0b0b0';
    ctx.fillText(`ID: ${user.id}`, 160, 90);

    // Status circle
    ctx.fillStyle = statusColors[status] || '#747f8d';
    ctx.beginPath();
    ctx.arc(140, 140, 10, 0, Math.PI * 2);
    ctx.fill();

    // Status text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Status: ${statusText}`, 160, 120);

    // Activity
    if (activity) {
      ctx.fillText(`Playing: ${activity.name}`, 160, 150);
    }

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'userinfo.png' });

    message.reply({ files: [attachment] });
  }
};
