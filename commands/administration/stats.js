export default {
    name: "stats",
    description: "Show bot stats",

    async execute(interaction, client) {
        interaction.reply({
            content: `> ⏱️ Uptime: \`${formatUptime(client.uptime)}\`\n> 🏓 Latency: \`${Date.now() - interaction.createdTimestamp}ms\``,
            ephemeral: true
        });
    },
};

function formatUptime(uptime) {
    let totalSeconds = uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);

    let formattedDays = String(days).padStart(2, '0');
    let formattedHours = String(hours).padStart(2, '0');
    let formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedDays}d ${formattedHours}h ${formattedMinutes}m`;
}