const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Shows user info centered in an image',
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

    // Light background
    ctx.fillStyle = '#f0f0f0';  // light gray
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw avatar on left
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 30, 36, 128, 128);

    // Text settings
    ctx.textAlign = 'center';  // center horizontally
    ctx.textBaseline = 'middle'; // center vertically

    // X position of text block (right side, center of that area)
    const textX = 390;  // roughly halfway between avatar and right edge
    // Starting Y and spacing
    const startY = 60;
    const lineHeight = 35;

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(`${user.username}#${user.discriminator}`, textX, startY);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText(`ID: ${user.id}`, textX, startY + lineHeight);

    // Status circle - put it left of status text
    const statusCircleX = textX - ctx.measureText('Status: Offline').width / 2 - 20;
    const statusCircleY = startY + 2 * lineHeight;

    ctx.fillStyle = statusColors[status] || '#747f8d';
    ctx.beginPath();
    ctx.arc(statusCircleX, statusCircleY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillText(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, textX, statusCircleY);

    ctx.fillStyle = '#0066cc';
    const activityText = activity
      ? `${activity.type === 2 ? 'Listening to' : activity.type === 1 ? 'Streaming' : 'Playing'}: ${activity.name}`
      : 'Playing: None';
    ctx.fillText(activityText, textX, startY + 3 * lineHeight);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'userinfo.png' });

    await message.reply({ files: [attachment] });
  }
};
