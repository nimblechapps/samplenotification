const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    deviceToken: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
