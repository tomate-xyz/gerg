import {
    User,
    Whitelist
} from './database.js';

const createUser = async (userID) => {
    try {
        const user = await User.create({
            userID,
            questions: 10,
            askedQuestions: 0
        });
        console.log(`User ${userID} created`);
        return user;
    } catch (error) {
        console.error("Error creating user:", error);
    }
};

const deleteUser = async (userID) => {
    try {
        const result = await User.destroy({
            where: {
                userID
            }
        });

        if (result > 0) {
            console.log(`User ${userID} deleted`);
        } else {
            console.log(`User ${userID} not found`);
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    }
};

const modifyUserQuestions = async (userID, amountChange) => {
    try {
        let user = await User.findOne({
            where: {
                userID
            }
        });

        if (!user) {
            user = await createUser(userID);
            console.log(`User ${userID} not found. Created new user with default values`);
        }

        let newQuestions = user.questions + amountChange;
        if (newQuestions < 0) newQuestions = 0;

        await user.update({
            questions: newQuestions
        });

        console.log(`User ${userID}'s questions modified by ${amountChange}. New value: ${newQuestions}`);
    } catch (error) {
        console.error("Error modifying user questions:", error);
    }
};

const modifyAskedQuestions = async (userID, amountChange) => {
    try {
        let user = await User.findOne({
            where: {
                userID
            }
        });

        if (!user) {
            user = await createUser(userID);
            console.log(`User ${userID} not found. Created new user with default values`);
        }

        let newAskedQuestions = user.askedQuestions + amountChange;
        if (newAskedQuestions < 0) newAskedQuestions = 0;

        await user.update({
            askedQuestions: newAskedQuestions
        });

        console.log(`User ${userID}'s askedQuestions modified by ${amountChange}. New value: ${newAskedQuestions}`);
    } catch (error) {
        console.error("Error modifying user askedQuestions:", error);
    }
};

const getUserQuestions = async (userID) => {
    try {
        let user = await User.findOne({
            where: {
                userID
            }
        });

        if (!user) {
            user = await createUser(userID);
            console.log(`User ${userID} not found. Created new user with default values`);
        }

        return user.questions;
    } catch (error) {
        console.error("Error retrieving user questions:", error);
    }
};

const getAskedQuestions = async (userID) => {
    try {
        let user = await User.findOne({
            where: {
                userID
            }
        });

        if (!user) {
            user = await createUser(userID);
            console.log(`User ${userID} not found. Created new user with default values`);
        }

        return user.askedQuestions;
    } catch (error) {
        console.error("Error retrieving user askedQuestions:", error);
    }
};

const addUserToWhitelist = async (userID) => {
    try {
        const existing = await Whitelist.findOne({
            where: {
                userID
            }
        });
        if (existing) {
            return {
                success: false,
                message: "User is already whitelisted"
            };
        }

        await Whitelist.create({
            userID
        });
        console.log(`User ${userID} added to whitelist`);
        return {
            success: true,
            message: `User ${userID} has been whitelisted`
        };
    } catch (error) {
        console.error("Error adding user to whitelist:", error);
        return {
            success: false,
            message: "Error occurred while adding user to the whitelist"
        };
    }
};

const removeUserFromWhitelist = async (userID) => {
    try {
        const existing = await Whitelist.findOne({
            where: {
                userID
            }
        });
        if (!existing) {
            return {
                success: false,
                message: "User is not whitelisted"
            };
        }

        await Whitelist.destroy({
            where: {
                userID
            }
        });
        console.log(`User ${userID} removed from whitelist`);
        return {
            success: true,
            message: `User ${userID} has been removed from the whitelist`
        };
    } catch (error) {
        console.error("Error removing user from whitelist:", error);
        return {
            success: false,
            message: "Error occurred while removing user from the whitelist"
        };
    }
};

const inviteUser = async (inviterID, inviteeID, client) => {
    try {
        const inviter = await User.findOne({
            where: {
                userID: inviterID
            }
        });

        if (inviter && inviter.invitedUserID) {
            return {
                success: false,
                message: `You have already invited someone`
            };
        }

        const invitee = await client.users.fetch(inviteeID);
        if (invitee.bot) {
            return {
                success: false,
                message: "You cannot invite a bot"
            };
        }

        const inviteeWhitelist = await Whitelist.findOne({
            where: {
                userID: inviteeID
            }
        });

        if (inviteeWhitelist) {
            return {
                success: false,
                message: `<@${inviteeID}> has already been invited`
            };
        }

        await addUserToWhitelist(inviteeID);
        if (inviter) {
            await inviter.update({
                invitedUserID: inviteeID
            });
        } else {
            await User.create({
                userID: inviterID,
                invitedUserID: inviteeID
            });
        }

        return {
            success: true,
            message: `<@${inviteeID}> has been successfully invited`
        };
    } catch (error) {
        console.error("Error inviting user:", error);
        return {
            success: false,
            message: "An error occurred while inviting the user"
        };
    }
};

const removeInvitee = async (inviterID) => {
    try {
        const inviter = await User.findOne({
            where: {
                userID: inviterID
            }
        });

        if (!inviter || !inviter.invitedUserID) {
            return {
                success: false,
                message: "No invitee to remove"
            };
        }

        await inviter.update({
            invitedUserID: null
        });

        console.log(`Invitee of user ${inviterID} removed`);
        return {
            success: true,
            message: "Invitee has been successfully removed"
        };
    } catch (error) {
        console.error("Error removing invitee:", error);
        return {
            success: false,
            message: "An error occurred while removing the invitee"
        };
    }
};

const getInviteStatus = async (userID) => {
    try {
        const user = await User.findOne({
            where: {
                userID
            }
        });
        return user ? user.invitedUserID : null;
    } catch (error) {
        console.error("Error getting invite status:", error);
        return null;
    }
};

const isUserWhitelisted = async (userID) => {
    try {
        const user = await Whitelist.findOne({
            where: {
                userID
            }
        });
        console.log(!!user)
        return !!user;
    } catch (error) {
        console.error("Error checking whitelist status:", error);
        return false;
    }
};

export {
    createUser,
    deleteUser,
    modifyUserQuestions,
    modifyAskedQuestions,
    getUserQuestions,
    getAskedQuestions,
    addUserToWhitelist,
    inviteUser,
    getInviteStatus,
    isUserWhitelisted
};