import {
    ApplicationCommandOptionType
} from "discord.js";
import {
    modifyUserQuestions
} from "../../database/handleData.js";
import {
    easyEmbed
} from "../../bot_modules/utils.js";

export default {
    name: "modifyquestions",
    description: "Edit the amount of questions a user has",
    devOnly: true,
    options: [{
            name: "user",
            description: "ID of the user whose questions you want to modify",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "amount",
            description: "Amount to add or subtract from the user's questions",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],

    async execute(interaction) {
        const userID = interaction.options.getUser('user').id;
        const amount = interaction.options.getInteger('amount');

        try {
            await modifyUserQuestions(userID, amount);
            await interaction.reply({
                embeds: [easyEmbed("#00FF00", "Questions Updated", `Successfully modified questions for <@${userID}> by \`${amount}\``)],
                ephemeral: true
            });
        } catch (error) {
            console.error("Error updating user questions:", error);
            await interaction.reply({
                embeds: [easyEmbed("#FF0000", "Error", "An error occurred while updating the user's questions")],
                ephemeral: true
            });
        }
    }
};