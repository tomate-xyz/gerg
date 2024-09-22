import {
    getUserQuestions,
    getAskedQuestions,
    getInviteStatus
} from "../../database/handleData.js";

export default {
    name: "account",
    description: "Show user account information",

    async execute(interaction, client) {
        const getMillisecondsToMidnight = () => new Date().setHours(24, 0, 0, 0) - Date.now();
        const timestamp = `<t:${Math.floor((Date.now() + getMillisecondsToMidnight()) / 1000)}:R>`;

        const inviteStatus = await getInviteStatus(interaction.user.id);
        const inviteMessage = inviteStatus ?
            `You have invited <@${inviteStatus}>` :
            `Invite a single user with </invite:${await getCommandIdByName(client, "invite")}>`;

        interaction.reply({
            content: `> 👤 **${interaction.user.username}**\n> 💬 **Questions asked:** \`${await getAskedQuestions(interaction.user.id)}\`\n> 🔢 **Remaining questions:** \`${await getUserQuestions(interaction.user.id)}/15\`\n> 🔄 Remaining questions refresh ${timestamp}\n> 📨 **Invite:** ${inviteMessage}\n> -# No additional information gets saved.`,
            ephemeral: true
        });
    },
};

const getCommandIdByName = async (client, commandName) => {
    try {
        const commands = await client.application.commands.fetch();
        const command = commands.find(cmd => cmd.name === commandName);

        if (command) {
            return command.id;
        } else {
            throw new Error(`Command "${commandName}" not found.`);
        }
    } catch (error) {
        console.error("Error fetching command ID:", error);
        return null;
    }
};