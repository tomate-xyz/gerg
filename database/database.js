import {
    Sequelize,
    DataTypes
} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/database.sqlite'
});

const User = sequelize.define('User', {
    userID: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    questions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15
    },
    askedQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    invitedUserID: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
});

const Whitelist = sequelize.define('Whitelist', {
    userID: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

sequelize.sync({
    alter: true
}).then(() => {
    console.log("Database and tables migrated & synced.");
});

export {
    User,
    Whitelist
};