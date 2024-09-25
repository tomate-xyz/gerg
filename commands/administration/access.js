import {
    ApplicationCommandOptionType
} from "discord.js";
import {
    addUserToWhitelist,
    removeUserFromWhitelist,
    addUserToBlacklist,
    removeUserFromBlacklist
} from "../../database/handleData.js";
import {
    easyEmbed
} from "../../bot_modules/utils.js";

export default {
    name: "access",
    description: "Manage access of users",
    devOnly: true,
    options: [{
            name: "option",
            description: "Option",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [{
                    name: "grant",
                    value: "grant"
                },
                {
                    name: "revoke",
                    value: "revoke"
                },
                {
                    name: "block",
                    value: "block"
                },
                {
                    name: "unblock",
                    value: "unblock"
                }
            ]
        },
        {
            name: "user",
            description: "ID of the user you want to manage",
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],

    async execute(interaction) {
        const option = interaction.options.getString('option');
        const userID = interaction.options.getUser('user').id;
        let result;

        switch (option) {
            case "grant":
                result = await addUserToWhitelist(userID);
                break;
            case "revoke":
                result = await removeUserFromWhitelist(userID);
                break;
            case "block":
                result = await addUserToBlacklist(userID);
                break;
            case "unblock":
                result = await removeUserFromBlacklist(userID);
                break;
        }

        const color = result.success ? "#00FF00" : "#FF0000";
        await interaction.reply({
            embeds: [easyEmbed(color, "Access Management", result.message)],
            ephemeral: true
        });
    }
};