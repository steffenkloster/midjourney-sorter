const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
} = require("discord.js");

require("dotenv").config();

// Create a new Client with the Guilds intent
const client = new Client({
  intents: [
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// IF I FORGOT TO RUN BOT :(
// setTimeout(async () => {
//   const guild = client.guilds.cache.find((guild) => guild.id == process.env.GUILD_ID);
//   if (!guild) {
//     return;
//   }

//   const animalChannel = guild.channels.cache.find((channel) =>
//     channel.name.endsWith('oktoberfest')
//   );

//   const fetchedMessages = await animalChannel.messages.fetch({
//     limit: 100,
//   });

//   fetchedMessages.forEach((message) => {
//     if (message.content.includes('Image #')) {
//       console.log(message.content);
//       const attachment = message.attachments.entries().next().value[1].url;
//       client.guilds.cache
//         .find((guild) => guild.id == process.env.GUILD_ID)
//         .channels.cache.find(
//           (channel) =>
//             channel.parentId == '1121449008519454770' &&
//             channel.name == `all-upscales`
//         )
//         .send({ files: [{ attachment }] });

//       const content = message.content.toLocaleLowerCase().replace(/ /g, '-');
//       const upscaleChannel = client.guilds.cache
//         .find((guild) => guild.id == process.env.GUILD_ID)
//         .channels.cache.find((c) =>
//           c.name.endsWith(`${animalChannel.name}-upscaled`)
//         );

//       if (upscaleChannel) {
//         upscaleChannel.send({ files: [{ attachment }] });
//       }
//     }
//   });

//   let messages = [];
//   let lastId;

//   while (true) {
//     const fetchedMessages = await animalChannel.messages.fetch({
//       limit: 100,
//       before: lastId,
//     });
//     messages.push(fetchedMessages);

//     const size = fetchedMessages.reduce((p, c) => p + 1, 0);
//     console.log(size);

//     if (fetchedMessages.size < 100) {
//       break; // Stop fetching if we receive fewer than 100 messages
//     }

//     lastId = fetchedMessages.last().id;
//     const amount = fetchedMessages.reduce((p, c) => p + 1, 0);
//     console.log(amount);
//     console.log(lastId);
//   }

//   console.log(`Fetched ${messages.length} messages.`);
// }, 3000);

const categories = [];
const DELETE_UPSCALES = false;
const channelNameLastUpdates = {};

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on(Events.MessageReactionAdd, async (reaction) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }

  //console.log(reaction.emoji.name);
  switch (reaction.emoji.name) {
    case "❎": {
      reaction.message.reactions.removeAll();
      break;
    }

    case "❌": {
      reaction.message.delete();
      break;
    }
  }
});

const handleChannelUpdate = async () => {
  categories.length = 0;
  client.guilds.cache
    .find((guild) => guild.id == process.env.GUILD_ID)
    .channels.cache.filter((c) => c.parentId == "1121448960339497041")
    .map((c) => categories.push(c.name));
};

client.on(Events.ChannelCreate, handleChannelUpdate);
client.on(Events.ChannelDelete, handleChannelUpdate);

client.on(Events.MessageCreate, (message) => {
  console.log(
    `messageCreate from ${message.author.username}: ${message.content}`
  );

  const messageChannel = client.guilds.cache
    .find((guild) => guild.id == process.env.GUILD_ID)
    .channels.cache.find((c) => c.id == message.channelId);

  if (message.author.id !== midjourneyBotUserId) {
    return;
  }

  if (message.content.includes("Image #")) {
    const query = message.content
      .toLowerCase()
      .split("**")[1]
      .split("--")[0]
      .trim();
    const attachment = message.attachments.entries().next().value[1].url;
    client.guilds.cache
      .find((guild) => guild.id == process.env.GUILD_ID)
      .channels.cache.find(
        (channel) =>
          channel.parentId == "1121449008519454770" &&
          channel.name == `all-upscales`
      )
      .send({ files: [{ attachment }] });

    const content = message.content.toLocaleLowerCase().replace(/ /g, "-");
    const upscaleChannel = client.guilds.cache
      .find((guild) => guild.id == process.env.GUILD_ID)
      .channels.cache.find((c) =>
        c.name.endsWith(`${messageChannel.name}-upscaled`)
      );

    if (upscaleChannel) {
      upscaleChannel.send({ files: [{ attachment }] });
    }

    if (DELETE_UPSCALES) {
      message.delete();
    }
  }
});

setInterval(async () => {
  const guild = client.guilds.cache.find(
    (guild) => guild.id == process.env.GUILD_ID
  );

  if (!guild) {
    return;
  }

  const upscaleChannels = guild.channels.cache.filter(
    (channel) => channel.parentId == "1121449008519454770"
  );

  upscaleChannels.forEach(async (channel) => {
    if (channel.name == "all-upscales") {
      return;
    }

    const channelName = channel.name.includes("》")
      ? channel.name.split("》")[1]
      : channel.name;

    const messages = await channel.messages.fetch({ limit: 100 });

    const filteredMesssages = messages.filter(
      (m) =>
        m.author.id == "1101186227664863304" &&
        m.attachments.size > 0 &&
        m.reactions.cache.size == 0
    );

    const imagesCount = filteredMesssages.reduce((prev, curr) => {
      const count = curr.attachments.filter(
        (attachment) => !attachment.url.includes(".zip")
      ).size;
      return prev + count;
    }, 0);

    const newName = `《${imagesCount}》${channelName}`;
    if (channel.name !== newName) {
      if (!(channelName in channelNameLastUpdates)) {
        channelNameLastUpdates[channelName] = 0;
      }

      const currentTimestamp = Date.now();
      if (
        currentTimestamp >
        channelNameLastUpdates[channelName] + 5 * 60 * 1000
      ) {
        channelNameLastUpdates[channelName] = currentTimestamp;
        channel.edit({ name: `《${imagesCount}》${channelName}` });
      }
    }
  });
}, 5000);

// Login with the environment data
client.login(process.env.TOKEN);
