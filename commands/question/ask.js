import {
    ApplicationCommandOptionType
} from "discord.js";
import axios from "axios";
import {
    getUserQuestions,
    modifyUserQuestions,
    modifyAskedQuestions
} from "../../database/handleData.js";
import {
    easyEmbed
} from "../../bot_modules/utils.js";
import dotenv from 'dotenv';

dotenv.config();

export default {
    name: 'ask',
    description: 'Ask the almighty gerg',
    options: [{
        name: 'prompt',
        description: 'Prompt to tell gerg',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],

    async execute(interaction, client) {
        const userID = interaction.user.id;
        const prompt = interaction.options.getString('prompt');

        if (await getUserQuestions(userID) <= 0) {
            return interaction.reply({
                embeds: [easyEmbed("#ff0000", "You have no available questions left")],
                ephemeral: true
            });
        }

        if (prompt.length > 1000) {
            return interaction.reply({
                embeds: [easyEmbed("#ff0000", "That prompt is too long, try something less than 1000 letters")],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        modifyUserQuestions(userID, -1);

        const url = process.env.MODEL_URL;
        const requestData = {
            model: "gerg",
            prompt: prompt,
            stream: false,
        };

        const timeout = setTimeout(async () => {
            console.log("No response received after 5 minutes.");
            await interaction.deleteReply();
            modifyUserQuestions(userID, 1);
        }, 300000);

        try {
            console.log("Question start.");
            const response = await axios.post(url, requestData);

            clearTimeout(timeout);
            modifyAskedQuestions(userID, 1);

            const responseMessage = response.data.response;

            interaction.followUp({
                content: responseMessage.substring(0, 2000)
            });

            console.log("Question done.");
        } catch (error) {
            clearTimeout(timeout);
            console.error("Error fetching data from API:", error);
        }
    },
};