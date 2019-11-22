function confirm(
  {
    channel = null,
    question = 'Are you sure?',
    timeout = 15000,
    deleteMessage = true,
    confirmEmoji = '✅',
    cancelEmoji = '❌',
    userId = null,
  } = {
    channel: null,
    question: 'Are you sure?',
    timeout: 15000,
    deleteMessage: true,
    confirmEmoji: '✅',
    cancelEmoji: '❌',
    userId: null,
  },
) {
  if (!question) question = 'Are you sure?';
  if (!confirmEmoji) confirmEmoji = '✅';
  if (!cancelEmoji) cancelEmoji = '❌';

  const getResponse = async () => {
    const sentMessage = await channel.send(question);
    const message = Array.isArray(sentMessage) ? sentMessage[0] : sentMessage;

    return new Promise(resolve => {
      message
        .react(confirmEmoji)
        .then(() => {
          message.react(cancelEmoji);
        })
        // Catch if user responded before second reaction is dispatched
        .catch();

      // Await response
      message
        .awaitReactions(
          (reaction, user) => {
            // check if reaction if either confirm or cancel
            const correctEmoji = [confirmEmoji, cancelEmoji].includes(reaction.emoji.name);
            // If options.userId is defined compare the ids
            const correctUser = (!userId || user.id === userId) && !user.bot;
            return correctEmoji && correctUser;
          },
          {
            max: 1,
            time: timeout,
            errors: ['time'],
          },
        )
        .then(collected => {
          const reaction = collected.first();
          if (reaction.emoji.name === confirmEmoji) {
            // If confirmed, delete message and resolve
            if (deleteMessage) message.delete().catch(() => {});
            resolve(true);
          } else {
            // If cancelled, delete message and resolve
            if (deleteMessage) message.delete().catch(() => {});
            resolve(false);
          }
        })
        .catch(() => {
          // If time ran out, delete message and resolve
          if (deleteMessage) message.delete().catch(() => {});
          resolve(false);
        });
    });
  };

  return new Promise((resolve, reject) => {
    if (!channel || !channel.send) {
      reject(new Error('Missing channel for message prompter'));
      return;
    }
    getResponse()
      .then(resolve)
      .catch(reject);
  });
}

module.exports = confirm;
