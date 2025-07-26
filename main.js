require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Express server for UptimeRobot
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bassline is alive!');
});

app.listen(PORT, () => {
  console.log(`Uptime server running on port ${PORT}`);
});

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Load all .js files from /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath);

for (const file of commandFiles) {
  const fullPath = path.join(commandsPath, file);
  if (file.endsWith('.js')) {
    try {
      const command = require(fullPath);
      if (command.name && command.execute) {
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
      } else {
        console.warn(`Command file missing "name" or "execute": ${file}`);
      }
    } catch (err) {
      console.error(`Error loading command ${file}:`, err);
    }
  }
}

// Discord bot ready event
client.once('ready', () => {
  console.log(`✅ Bassline is online as ${client.user.tag}`);
});

// Message event
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith('$')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('❌ There was an error executing that command.');
  }
});

// Log in
client.login(process.env.DISCORD_TOKEN);
