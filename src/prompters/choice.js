const makeFilter = (choices, userId) => (reaction, user) => {
  const correctUser = (!userId || user.id === userId) && !user.bot;
  return correctUser && (choices.includes(reaction.emoji.name) || choices.includes(reaction.emoji));
};

const choice = (
  {
    channel,
    question = 'Pick one',
    choices = ['💓', '💙'],
    userId = '',
    timeout = 30000,
    deleteMessage = true,
    acceptEarly = false,
  } = {
    question: 'Pick one',
    choices: ['💓', '💙'],
    userId: '',
    timeout: 30000,
    deleteMessage: true,
    acceptEarly: false,
  },
) => {
  if (!channel) throw new Error('Missing channel');
  if (!choices) {
    throw new Error('Choice prompt requires emoji choices');
  }
  if (!timeout) timeout = 30000;
  if (deleteMessage === undefined) deleteMessage = true;
  if (!acceptEarly) acceptEarly = false;

  const getResponse = async () => {
    const msg = await channel.send(question);
    const message = msg instanceof Array ? msg[0] : msg;

    // React with possible choices
    for (const choice of choices) {
      if (!acceptEarly) {
        await message.react(choice);
      } else {
        message.react(choice);
      }
    }

    // Await the response
    let collected;
    try {
      collected = await message.awaitReactions(makeFilter(choices, userId), {
        time: timeout,
        max: 1,
        errors: ['time'],
      });
    } catch (e) {
      // If time ran out, delete message and resolve
      if (deleteMessage) await message.delete();
      return null;
    }

    if (deleteMessage) await message.delete();

    let result = null;

    for (const reaction of collected) {
      const guildEmoji = message.guild ? message.guild.emojis.cache.get(reaction[0]) : null;
      result = guildEmoji ? guildEmoji : reaction[0];
    }

    return result;
  };

  return new Promise((resolve, reject) => {
    getResponse()
      .then(resolve)
      .catch(reject);
  });
};

module.exports = choice;
