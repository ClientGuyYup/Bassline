const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Show detailed user info and activities in two embeds',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return message.reply("Couldn't find that user.");

    const status = member.presence?.status || 'offline';
    const activities = member.presence?.activities || [];

    // Capitalize status first letter
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    const statusColors = {
      online: 0x43b581,
      idle: 0xfaa61a,
      dnd: 0xf04747,
      offline: 0x747f8d
    };

    // User info embed
    const userEmbed = new EmbedBuilder()
      .setColor(statusColors[status] || statusColors.offline)
      .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .addFields(
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Status', value: statusText, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    // Prepare activity embed
    const activityEmbed = new EmbedBuilder()
      .setColor(0x0066cc)
      .setTitle('Current Activities')
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    if (activities.length === 0) {
      activityEmbed.setDescription('No current activities.');
    } else {
      const activityFields = activities.map((activity, index) => {
        // Compose detailed activity info string
        let details = `**Type:** ${activity.type === 0 ? 'Playing' : activity.type === 1 ? 'Streaming' : activity.type === 2 ? 'Listening' : activity.type === 3 ? 'Watching' : activity.type}\n`;

        if (activity.details) details += `**Details:** ${activity.details}\n`;
        if (activity.state) details += `**State:** ${activity.state}\n`;
        if (activity.url) details += `**URL:** ${activity.url}\n`;
        if (activity.createdAt) details += `**Started:** <t:${Math.floor(activity.createdAt.getTime() / 1000)}:R>\n`;

        // Add more fields if needed (e.g., emojis, assets, etc.)

        return {
          name: activity.name || `Activity ${index + 1}`,
          value: details || 'No additional info',
          inline: false
        };
      });

      activityEmbed.addFields(activityFields);
    }

    await message.reply({ embeds: [userEmbed, activityEmbed] });
  }
};
