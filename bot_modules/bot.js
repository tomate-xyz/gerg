import {
    REST,
    Routes,
    PermissionsBitField,
    Client,
    Partials,
    GatewayIntentBits,
    Collection
} from "discord.js";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ],
    allowedMentions: {
        parse: ["users", "roles"]
    },
});

client.commands = new Collection();

const successEmoji = '✅';
const errorEmoji = '❌';
const loadingEmoji = '⏳';

const commandFiles = [];
const eventFiles = [];

const readRecursively = (dir, fileArray, extension) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.lstatSync(fullPath);

        if (stat.isDirectory()) {
            readRecursively(fullPath, fileArray, extension);
        } else if (file.endsWith(extension)) {
            fileArray.push(fullPath);
        }
    }
};

readRecursively('./commands', commandFiles, '.js');
readRecursively('./events', eventFiles, '.js');

const registerSlashCommands = async (commands, applicationId) => {
    try {
        const commandData = commands.map(command => ({
            name: command.name,
            description: command.description,
            options: command.options || [],
            default_permission: command.default_permission ? command.default_permission : null,
            default_member_permissions: command.default_member_permissions ? PermissionsBitField.resolve(command.default_member_permissions).toString() : null,
            integration_types: [1],
            contexts: [0, 1, 2]
        }));

        const rest = new REST({
            version: '10'
        }).setToken(process.env.DISCORD_TOKEN);

        await rest.put(Routes.applicationCommands(applicationId), {
            body: commandData
        });

        console.log(`${successEmoji} Registered slash commands: ${commandData.map(c => c.name).join(', ')}`);
    } catch (error) {
        console.error(`${errorEmoji} Failed to register slash commands:`, error);
        throw error;
    }
};

export const registerAllCommands = async () => {
    try {
        const applicationId = await getApplicationId();
        const commands = [];

        for (const file of commandFiles) {
            try {
                const commandModule = await import(`file://${path.resolve(file)}`);
                const command = commandModule.default;
                console.log(`${loadingEmoji} Loaded command: ${command.name}`);
                client.commands.set(command.name, command);
                commands.push(command);
            } catch (error) {
                console.error(`${errorEmoji} Failed to load command file ${file}:`, error);
            }
        }

        await registerSlashCommands(commands, applicationId);
        console.log(`${successEmoji} All commands registered successfully`);
    } catch (error) {
        console.error(`${errorEmoji} Failed to fetch application ID:`, error);
    }
};

const getApplicationId = async () => {
    try {
        const response = await fetch('https://discord.com/api/v10/applications/@me', {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            },
        });

        const data = await response.json();
        if (response.ok) {
            return data.id;
        } else {
            throw new Error(`Failed to fetch application ID: ${response.status} - ${data.message}`);
        }
    } catch (error) {
        throw new Error(`Failed to fetch application ID: ${error.message}`);
    }
};

console.log(`${loadingEmoji} Registering commands...`);
registerAllCommands()
    .then(() => {
        console.log(`${successEmoji} Commands registration completed.`);
    })
    .catch(error => {
        console.error(`${errorEmoji} Error registering commands:`, error);
    });

for (const file of eventFiles) {
    import(`file://${path.resolve(file)}`).then(eventModule => {
        const event = eventModule.default;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }).catch(error => {
        console.error(`Failed to load event file ${file}:`, error);
    });
}

const startBot = () => {
    const handleCrash = (error) => {
        console.error(`⛔ Bot crashed:`, error);

        console.error(`Timestamp: ${new Date().toISOString()}`);
        console.error(`Error Stack Trace:`, error.stack || error.message || error);

        process.off('uncaughtException', handleCrash);
        process.off('unhandledRejection', handleRejection);

        setTimeout(() => {
            process.nextTick(startBot);
        }, 5000);
    };

    const handleRejection = (reason, promise) => {
        console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
    };

    process.on('uncaughtException', handleCrash);
    process.on('unhandledRejection', handleRejection);

    client.login(process.env.DISCORD_TOKEN)
        .catch((error) => {
            console.error(`❌ Failed to log in:`, error);
            process.nextTick(startBot);
        });
};

startBot();