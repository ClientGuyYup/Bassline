module.exports = {
  name: 'ping',
  description: 'Replies with Pong!',
  async execute(message, args) {
    await message.channel.send('Pong!');
  }
};
