import { createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ApplicationCommandOptionType } from 'discord.js';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

export default {
    devOnly: true,
    name: 'test-canvas',
    description: 'Test Canvas',
    options: [{
        name: "time",
        description: "Time in seconds",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
        max_value: 6000
    }],

    async execute(interaction, client) {
        const gridSize = 29;
        const scaleFactor = 3;
        const cellSize = 20 * scaleFactor;
        const canvasSize = gridSize * cellSize;

        const users = new Map();
        const placedPixels = [];

        const time = interaction.options.getInteger('time');
        let currentTime = Math.floor(Date.now() / 1000);
        let endTime = currentTime + time;

        const generateId = () => {
            return Math.random().toString(36).substring(2, 7).toUpperCase();
        };

        const uniqueId = generateId();

        const getRandomPosition = () => {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            return { x, y };
        };

        const addUser = (userId, username, avatarURL) => {
            if (!users.has(userId)) {
                const { x, y } = getRandomPosition();
                users.set(userId, { x, y, username, avatarURL, color: '#ff0000' });
            }
        };

        const framesDir = `./frames/${uniqueId}/`;
        if (!fs.existsSync(framesDir)) {
            fs.mkdirSync(framesDir, { recursive: true });
        }

        let frameCounter = 0;

        const drawGrid = async () => {
            const canvas = createCanvas(canvasSize, canvasSize);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1 * scaleFactor;
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, canvas.height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(canvas.width, i * cellSize);
                ctx.stroke();
            }

            for (const pixel of placedPixels) {
                const { x, y, color } = pixel;
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            for (const [userId, user] of users) {
                const { x, y, avatarURL } = user;

                const avatar = await loadImage(avatarURL);
                ctx.save();
                
                const radius = cellSize / 2;
                const centerX = x * cellSize + radius;
                const centerY = y * cellSize + radius;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                
                ctx.globalAlpha = 1.0;
                ctx.drawImage(avatar, x * cellSize, y * cellSize, cellSize, cellSize);
                
                ctx.restore();
            }

            frameCounter++;
            const framePath = `${framesDir}/${String(frameCounter).padStart(3, '0')}.png`;
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(framePath, buffer);

            return buffer;
        };

        const drawOnlyPixels = async () => {
            const canvas = createCanvas(canvasSize, canvasSize);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (const pixel of placedPixels) {
                const { x, y, color } = pixel;
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            return canvas.toBuffer('image/png');
        };

        const drawTransparentPixels = async () => {
            const canvas = createCanvas(canvasSize, canvasSize);
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const pixel of placedPixels) {
                const { x, y, color } = pixel;
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            return canvas.toBuffer('image/png');
        };

        const moveUpButton = new ButtonBuilder()
            .setCustomId('move_up')
            .setLabel('⬆️')
            .setStyle(ButtonStyle.Primary);

        const moveDownButton = new ButtonBuilder()
            .setCustomId('move_down')
            .setLabel('⬇️')
            .setStyle(ButtonStyle.Primary);

        const moveLeftButton = new ButtonBuilder()
            .setCustomId('move_left')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary);

        const moveRightButton = new ButtonBuilder()
            .setCustomId('move_right')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary);

        const placePixelButton = new ButtonBuilder()
            .setCustomId('place_pixel')
            .setLabel('📌 Place Pixel')
            .setStyle(ButtonStyle.Success);

        const erasePixelButton = new ButtonBuilder()
            .setCustomId('erase_pixel')
            .setLabel('🗑️ Remove Pixel')
            .setStyle(ButtonStyle.Danger);

        const colorSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_color')
            .setPlaceholder('Choose a color')
            .addOptions([
                { label: '🟥 Red', value: '#fa003f' },
                { label: '🍷 Dark Red', value: '#8B0000' },
                { label: '🟩 Green', value: '#00ff00' },
                { label: '🧼 Teal', value: '#66f1c2' },
                { label: '🟦 Blue', value: '#0000ff' },
                { label: '💧 Light Blue', value: '#48d2fe' },
                { label: '🟪 Purple', value: '#800080' },
                { label: '🌸 Pink', value: '#FF69B4' },
                { label: '🟨 Yellow', value: '#ffff00' },
                { label: '🟧 Orange', value: '#ffa500' },
                { label: '🟫 Brown', value: '#8B4513' },
                { label: '⬜ White', value: '#ffffff' },
                { label: '🔲 Grey', value: '#808080' }
                // { label: '⬛ Black', value: '#000000' }
            ]);

        const speedSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_speed')
        .setPlaceholder('Select movement speed')
        .addOptions([
            { label: '1 Pixel', value: '1' },
            { label: '2 Pixels', value: '2' },
            { label: '3 Pixels', value: '3' },
            { label: '4 Pixels', value: '4' },
            { label: '5 Pixels', value: '5' },
            { label: '6 Pixel', value: '6' },
            { label: '7 Pixels', value: '7' },
            { label: '8 Pixels', value: '8' },
            { label: '9 Pixels', value: '9' },
            { label: '10 Pixels', value: '10' }
        ]);
        

        const buttonRow = new ActionRowBuilder()
            .addComponents(moveUpButton, moveDownButton, moveLeftButton, moveRightButton);

        const actionRowForPixels = new ActionRowBuilder()
            .addComponents(placePixelButton, erasePixelButton);

        const selectMenuRow = new ActionRowBuilder().addComponents(colorSelectMenu);
        const speedSelectRow = new ActionRowBuilder().addComponents(speedSelectMenu);

        let gridImageBuffer = await drawGrid();

        const attachment = new AttachmentBuilder(gridImageBuffer, { name: 'grid.png' });
        
        let message = await interaction.reply({
            content: `> 🎨 **It's time to make some art!** Ends <t:${endTime}:R>`,
            files: [attachment],
            components: [buttonRow, speedSelectRow, selectMenuRow, actionRowForPixels],
            ephemeral: false,
        });

        const collector = message.createMessageComponentCollector({ time: time * 1000 });

        let userSpeed = new Map();

        collector.on('collect', async i => {
            const userId = i.user.id;
            const username = i.user.username;
            const avatarURL = i.user.displayAvatarURL({ extension: 'png' });
        
            const isNewUser = !users.has(userId);
            addUser(userId, username, avatarURL);
        
            const user = users.get(userId);
        
            if (i.customId === 'move_up') user.y = (user.y - (userSpeed.get(userId) || 1) + gridSize) % gridSize;
            if (i.customId === 'move_down') user.y = (user.y + (userSpeed.get(userId) || 1)) % gridSize;
            if (i.customId === 'move_left') user.x = (user.x - (userSpeed.get(userId) || 1) + gridSize) % gridSize;
            if (i.customId === 'move_right') user.x = (user.x + (userSpeed.get(userId) || 1)) % gridSize;
        
            if (isNewUser) {
                if (i.customId === 'place_pixel' || i.customId === 'erase_pixel') {
                    await i.reply({ content: "You have just spawned and cannot place or erase a pixel yet!", ephemeral: true });
                    return;
                }
            }
        
            if (i.customId === 'select_color') {
                user.color = i.values[0];
            }
        
            if (i.customId === 'select_speed') {
                const speed = parseInt(i.values[0], 10);
                userSpeed.set(userId, speed);
            }
        
            if (!isNewUser && i.customId === 'place_pixel') {
                const pixel = { x: user.x, y: user.y, color: user.color };
                placedPixels.push(pixel);
            }
        
            if (!isNewUser && i.customId === 'erase_pixel') {
                const index = placedPixels.findIndex(pixel => pixel.x === user.x && pixel.y === user.y);
                if (index !== -1) {
                    placedPixels.splice(index, 1);
                }
            }
        
            gridImageBuffer = await drawGrid();
            const updatedAttachment = new AttachmentBuilder(gridImageBuffer, { name: 'grid.png' });
        
            await i.update({
                files: [updatedAttachment],
            });
        });

        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} interactions.`);
        
            const finalPixelsImageBuffer = await drawOnlyPixels();
            const finalTransparentPixelsImageBuffer = await drawTransparentPixels();

            const videoPath = `${framesDir}/art_video.mp4`;

            await createVideoFromFrames(framesDir, videoPath);

            const pixelAttachment = new AttachmentBuilder(finalPixelsImageBuffer, { name: 'final_pixels.png' });
            const transparentPixelAttachment = new AttachmentBuilder(finalTransparentPixelsImageBuffer, { name: 'transparent_pixels.png' });
            const videoAttachment = new AttachmentBuilder(videoPath, { name: 'art_video.mp4' });
            
            await interaction.editReply({
                content: "🎨 **Ended!** Here is the final artwork:",
                files: [videoAttachment, pixelAttachment, transparentPixelAttachment],
                components: []
            });

            fs.rmSync(framesDir, { recursive: true });
        });
    },
};

async function createVideoFromFrames(framesDir, outputVideoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .setFfmpegPath(ffmpegPath)
            .input(`${framesDir}%03d.png`)
            .inputOptions('-framerate 10')
            .outputOptions('-c:v libx264')
            .outputOptions('-pix_fmt yuv420p')
            .save(outputVideoPath)
            .on('end', () => {
                console.log('Video created successfully!');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error creating video:', err);
                reject(err);
            });
    });
}