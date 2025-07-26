const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Shows user info as an image',
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

    // Dark background
    ctx.fillStyle = '#23272a'; // Discord dark
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 30, 36, 128, 128);

    // White text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${user.username}#${user.discriminator}`, 180, 60);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`ID: ${user.id}`, 180, 90);

    ctx.fillStyle = statusColors[status] || '#747f8d';
    ctx.beginPath();
    ctx.arc(148, 148, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Status: ${statusText}`, 180, 120);

    if (activity) {
      ctx.fillStyle = '#00b0f4';
      ctx.fillText(`Playing: ${activity.name}`, 180, 150);
    }

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'userinfo.png' });

    await message.reply({ files: [attachment] });
  }
};
