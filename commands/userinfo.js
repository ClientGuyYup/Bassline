const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Shows user info as an image (no external fonts required)',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return message.reply("Couldn't find that user.");

    const activities = member.presence?.activities || [];
    const activity =
      activities.find(a => a.type === 0) ||  // Playing
      activities.find(a => a.type === 2) ||  // Listening
      activities.find(a => a.type === 1);    // Streaming

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
    ctx.fillStyle = '#23272a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 30, 36, 128, 128);

    // Use built-in sans-serif font (no registration)
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${user.username}#${user.discriminator}`, 180, 60);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`ID: ${user.id}`, 180, 90);

    // Status circle
    ctx.fillStyle = statusColors[status] || '#747f8d';
    ctx.beginPath();
    ctx.arc(148, 148, 10, 0, Math.PI * 2);
    ctx.fill();

    // Status text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, 180, 120);

    // Activity text fallback
    ctx.fillStyle = '#00b0f4';
    const activityText = activity
      ? `${activity.type === 2 ? 'Listening to' : activity.type === 1 ? 'Streaming' : 'Playing'}: ${activity.name}`
      : 'Playing: None';
    ctx.fillText(activityText, 180, 150);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'userinfo.png' });

    await message.reply({ files: [attachment] });
  }
};
