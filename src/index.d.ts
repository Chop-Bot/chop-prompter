import {
  Snowflake,
  Collection,
  Message,
  TextChannel,
  DMChannel,
  EmojiIdentifierResolvable,
  Emoji,
} from 'discord.js';

declare interface MessagePrompterOptions {
  channel: TextChannel | DMChannel;
  question?: string;
  prefix?: string;
  timeout?: number;
  max?: number;
  deleteMessage?: boolean;
  userId?: Snowflake;
  regex?: string;
}

declare interface ConfirmPrompterOptions {
  channel: TextChannel | DMChannel;
  question?: string;
  timeout?: number;
  deleteMessage?: boolean;
  confirmEmoji?: EmojiIdentifierResolvable;
  cancelEmoji?: EmojiIdentifierResolvable;
  userId?: Snowflake;
}

declare interface ChoicePrompterOptions {
  channel: TextChannel | DMChannel;
  question?: string;
  timeout?: number;
  deleteMessage?: boolean;
  userId?: Snowflake;
  choices: EmojiIdentifierResolvable[];
  acceptEarly?: boolean;
}

declare const Prompter: {
  message: (options: MessagePrompterOptions) => Promise<Collection<Snowflake, Message> | null>;
  confirm: (options: ConfirmPrompterOptions) => Promise<boolean>;
  choice: (options: ChoicePrompterOptions) => Promise<Emoji | null>;
};

export default Prompter;
export {};
