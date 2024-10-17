import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export default {
    devOnly: true,
    name: 'test-builders',
    description: 'Test Builders',

    async execute(interaction, client) {
        const primaryButton = new ButtonBuilder()
            .setCustomId('primary')
            .setLabel('Primary')
            .setStyle(ButtonStyle.Primary);

        const secondaryButton = new ButtonBuilder()
            .setCustomId('secondary')
            .setLabel('Secondary')
            .setStyle(ButtonStyle.Secondary);

        const successButton = new ButtonBuilder()
            .setCustomId('success')
            .setLabel('Success')
            .setStyle(ButtonStyle.Success);

        const dangerButton = new ButtonBuilder()
            .setCustomId('danger')
            .setLabel('Danger')
            .setStyle(ButtonStyle.Danger);

        const linkButton = new ButtonBuilder()
            .setLabel('Link')
            .setURL('https://google.com/')
            .setStyle(ButtonStyle.Link);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Choose an option...')
            .addOptions([
                {
                    label: 'Option 1',
                    description: 'This is option 1',
                    value: 'option1',
                },
                {
                    label: 'Option 2',
                    description: 'This is option 2',
                    value: 'option2',
                },
                {
                    label: 'Option 3',
                    description: 'This is option 3',
                    value: 'option3',
                },
            ]);

        const buttonRow = new ActionRowBuilder()
            .addComponents(primaryButton, secondaryButton, successButton, dangerButton, linkButton);

        const selectMenuRow = new ActionRowBuilder()
            .addComponents(selectMenu);

        await interaction.reply({
            content: 'Test Buttons and Select Menu',
            components: [buttonRow, selectMenuRow]
        });
    },
};