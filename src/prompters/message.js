function message(
  {
    channel = null,
    question = 'Are you sure?',
    prefix = '',
    timeout = 15000,
    max = 1,
    deleteMessage = true,
    userId = null,
    regex = null,
  } = {
    channel: null,
    question: 'Are you sure?',
    prefix: '',
    timeout: 15000,
    max: 1,
    deleteMessage: true,
    userId: null,
    regex: null,
  },
) {
  if (!question) question = 'Are you sure?';
  if (!max || !max < 1) max = 1;
  // Checking if its an instance of RegEx or a regex string
  if (regex && !(regex instanceof RegExp)) {
    if (typeof regex === 'string') {
      regex = new RegExp(regex);
    } else {
      regex = null;
    }
  }

  const getResponse = async () => {
    const sentMessage = await channel.send(question);
    const message = Array.isArray(sentMessage) ? sentMessage[0] : sentMessage;

    return new Promise((resolve) => {
      channel
      .awaitMessages(
        m => {
          // If regex is defined test it against message content
          const matchesRegex = !regex || regex.test(m.content);
          // If prefix/userId is defined compare the prefix/id
          const rightPrefix = !prefix || m.content.startsWith(prefix);
          const rightAuthor = !userId || m.author.id === userId;
          return rightPrefix && rightAuthor && matchesRegex;
        },
        {
          max: max,
          time: timeout,
          errors: ['time'],
        },
      )
      .then(collected => {
        // Clear the prompt(question) and resolve with the result
        if (deleteMessage) {
          message.delete().catch(() => {});
        }
        resolve(collected);
      })
      .catch(collected => {
        // Clear the prompt(question) and resolve with the result or null if none
        if (deleteMessage) {
          message.delete().catch(() => {});
        }
        if (!collected.size) {
          resolve(null);
        } else {
          resolve(collected);
        }
      });
    });
  };

  return new Promise((resolve, reject) => {
    if (!channel || !channel.send) {
      reject(new Error('Missing channel for message prompter'));
      return;
    }
    getResponse()
      .then(result => resolve(result))
      .catch(reject);
  });
}

module.exports = message;
