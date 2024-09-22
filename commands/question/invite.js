import {
    ApplicationCommandOptionType
} from "discord.js";
import {
    inviteUser
} from "../../database/handleData.js";
import {
    easyEmbed
} from "../../bot_modules/utils.js";

export default {
    name: "invite",
    description: "Invite another user to use gerg",
    options: [{
        name: "user",
        description: "ID of the user you want to invite",
        type: ApplicationCommandOptionType.User,
        required: true
    }],

    async execute(interaction, client) {
        const inviterID = interaction.user.id;
        const inviteeID = interaction.options.getUser('user').id;
        const result = await inviteUser(inviterID, inviteeID, client);

        if (result.success) {
            interaction.reply({
                embeds: [easyEmbed("#00FF00", "📨 Invite Status", result.message)],
                ephemeral: true
            });
        } else {
            interaction.reply({
                embeds: [easyEmbed("#ff0000", "📨 Invite Status", result.message)],
                ephemeral: true
            });
        }
    },
};