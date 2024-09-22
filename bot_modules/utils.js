import {
    EmbedBuilder
} from "discord.js";

export function easyEmbed(color, title, description) {
    const embed = new EmbedBuilder()
        .setColor(color ? color : "#373737")
        .setTitle(title ? title : null)
        .setDescription(description ? description : null)
    return embed;
}