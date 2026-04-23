// Loads variables from your .env file into process.env
// so you can safely use your Discord App ID and Bot Token.
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

// Imports the Discord tools this file needs:
// Client = the bot itself
// GatewayIntentBits = lets you choose what events the bot can receive
// REST = used to send command data to Discord's API
// Routes = gives the correct API route for registering commands
import { Client, GatewayIntentBits, REST, Routes, Partials } from 'discord.js';

import { getBotReply } from './services/chat.mjs';

// Creates the Discord bot client.
// Right now we only care about direct messages,
// so we enable the DirectMessages intent.
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

const userConversations = new Map();

const conversationsFile = path.join('data', 'conversations.json');
async function loadConversations() {
  try {
    const data = await fs.readFile(conversationsFile, 'utf8');
    const parsed = JSON.parse(data);

    for (const [userId, messages] of Object.entries(parsed)) {
      userConversations.set(userId, messages);
    }
  } catch (error) {
    console.log('No saved conversations found yet.');
  }
}

// This is the list of slash commands we want the app to have.
// At the moment there is only one command: /ping
const commands = [
  {
    // The slash command name people type in Discord
    name: 'echo',
    description: 'Talk to Lord of Shadows',

    // [1] means USER_INSTALL
    // This makes the command available for "Add to My Apps" installs
    integration_types: [1],
    // [1, 2] controls where the command can appear
    // 1 = BOT_DM
    // 2 = PRIVATE_CHANNEL
    contexts: [1, 2],

    options: [
     {
       name: 'message',
       description: 'What you want to say to Lord of Shadows',
       type: 3,
       required: true,
     }
    ],
  }
];

// Creates a REST helper that talks to Discord's API
// using your bot token for authentication.
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

// This function sends your slash commands to Discord
// so Discord knows what commands your app has.
async function registerCommands() {
  await rest.put(
    // This is the API route for registering commands
    // for your specific Discord application
    Routes.applicationCommands(process.env.DISCORD_APP_ID),

    // Sends the commands array as the request body
    { body: commands }
  );
}

// This runs once when the bot has logged in successfully
// and is fully connected to Discord.
client.once('clientReady', () => {
  console.log('Lord of Shadows Discord bot is online!');
});

// This runs whenever Discord sends your bot an interaction.
// Slash commands are one type of interaction.
client.on('interactionCreate', async (interaction) => {
  // If the interaction is not a slash command, stop here.
  if (!interaction.isChatInputCommand()) return;

  // If the command used was /ping,
  // reply with "Pong!"
  if (interaction.commandName === 'echo') {
    const userMessage = interaction.options.getString('message');
    const userId = interaction.user.id;

    if (!userConversations.has(userId)) {
       userConversations.set(userId, []);
    }

    const messages = userConversations.get(userId);

    await interaction.deferReply();

    messages.push({ role: 'user', content: userMessage });

    const reply = await getBotReply(messages);

    messages.push({ role: 'assistant', content: reply });

    await saveConversations();

    await interaction.editReply(reply);
}
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 1) return;

  const userMessage = message.content;

  const reply = await getBotReply([
  { role: 'user', content: userMessage }
]);

  await message.reply(reply);
});

await loadConversations();
async function saveConversations() {
  const data = Object.fromEntries(userConversations);
  await fs.writeFile(conversationsFile, JSON.stringify(data, null, 2));
}
// Registers the slash commands with Discord before the bot logs in.
await registerCommands();

// Logs the bot into Discord using the token from .env
// and brings it online.
client.login(process.env.DISCORD_BOT_TOKEN);