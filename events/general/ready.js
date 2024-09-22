import {
  CronJob
} from "cron";
import {
  ActivityType
} from "discord.js";
import {
  User,
  Whitelist
} from "../../database/database.js";

export default {
  name: "ready",
  once: true,

  async execute(client) {
    console.log(`✅ ${client.user.tag} is online.\n`);

    client.user.setPresence({
      activities: [{
        type: ActivityType.Custom,
        name: "custom",
        state: "🗣️"
      }]
    })

    try {
      const whitelistedUsers = await Whitelist.findAll({
        attributes: ['userID']
      });

      const userInviteePairs = [];

      for (const whitelistedUser of whitelistedUsers) {
        const user = await User.findOne({
          where: {
            userID: whitelistedUser.userID
          },
          attributes: ['invitedUserID']
        });

        userInviteePairs.push({
          userID: whitelistedUser.userID,
          inviteeID: user ? user.invitedUserID : null
        });
      }

      console.log("Whitelisted User IDs and their Invitees:", userInviteePairs);
      return userInviteePairs;
    } catch (error) {
      console.error("Error fetching whitelisted users:", error);
    }

    const job = new CronJob(
      '0 0 * * *',
      function () {
        User.findAll()
          .then(users => {
            users.forEach(user => {
              user.questions = 15;
              user.save();
            });
            console.log('Questions reset for all users.');
          })
          .catch(error => {
            console.error('Error resetting questions:', error);
          });
      },
      null,
      true,
      'Europe/Berlin'
    );
  }
};