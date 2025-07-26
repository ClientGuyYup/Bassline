const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Show user info in an image card',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return message.reply("Couldn't find that user.");

    const activities = member.presence?.activities || [];
    const activity = activities.find(a => a.type === 0); // Playing
    const status = member.presence?.status || 'offline';

    const statusColors = {
      online: '#43b581',
      idle: '#faa61a',
      dnd: '#f04747',
      offline: '#747f8d'
    };

    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2c2f33';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 20, 36, 128, 128);

    // Force a system font that works everywhere
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${user.username}#${user.discriminator}`, 160, 60);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#b0b0b0';
    ctx.fillText(`ID: ${user.id}`, 160, 90);

    ctx.fillStyle = statusColors[status] || '#747f8d';
    ctx.beginPath();
    ctx.arc(140, 140, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Status: ${status}`, 160, 120);

    if (activity) {
      ctx.fillText(`Playing: ${activity.name}`, 160, 150);
    }

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'userinfo.png' });

    await message.reply({ files: [attachment] });
  }
};
