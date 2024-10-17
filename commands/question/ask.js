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
    devOnly: true,
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
        let prompt = interaction.options.getString('prompt');

        if (await getUserQuestions(userID) <= 0) {
            return interaction.reply({
                embeds: [easyEmbed("#ff0000", "You have no available questions left")],
                ephemeral: true
            });
        }

        if (prompt.length > 1200) {
            return interaction.reply({
                embeds: [easyEmbed("#ff0000", "That prompt is too long, try something less than 1200 letters")],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        prompt = `${interaction.user.displayName} asks you: ${prompt}`;
        modifyUserQuestions(userID, -1);

        const url = process.env.MODEL_URL;
        const requestData = {
            model: "gerg",
            prompt: prompt,
            stream: false,
        };

        const timeout = setTimeout(async () => {
            console.log("No response received after 10 minutes.");
            await interaction.deleteReply();
            modifyUserQuestions(userID, 1);
        }, 600000);

        try {
            console.log("Question start.");
            const response = await axios.post(url, requestData);

            clearTimeout(timeout);
            modifyAskedQuestions(userID, 1);

            const responseMessage = response.data.response;
            const chunkSize = 2000;

            for (let i = 0; i < responseMessage.length; i += chunkSize) {
                const chunk = responseMessage.substring(i, i + chunkSize);
                if (i === 0) {
                    await interaction.followUp({
                        content: chunk
                    });
                } else {
                    await interaction.followUp({
                        content: chunk
                    });
                }
            }

            console.log("Question done.");
        } catch (error) {
            clearTimeout(timeout);
            console.error("Error fetching data from API:", error);
        }
    },
};