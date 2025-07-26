const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Shows user info as an image',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return message.reply("Couldn't fetch user data.");

    // Safely extract presence and activity
    const presence = member.presence;
    const status = presence?.status || 'offline';
    const activity = presence?.activities?.find(a => a.type === 0);
    console.log(`Status: ${status}, Activity: ${activity?.name || 'None'}`);

    // Setup canvas
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#23272a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.drawImage(avatar, 30, 36, 128, 128);

    // Debug box
    ctx.strokeStyle = 'red';
    ctx.strokeRect(180, 40, 380, 120);

    // Font
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#ffffff';

    // Draw texts
    ctx.fillText(`Username: ${user.username}#${user.discriminator}`, 190, 60);
    ctx.fillText(`ID: ${user.id}`, 190, 90);
    ctx.fillText(`Status: ${status}`, 190, 120);
    ctx.fillText(`Playing: ${activity?.name || 'None'}`, 190, 150);

    // Attach image
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'userinfo.png' });

    await message.reply({ files: [attachment] });
  }
};
