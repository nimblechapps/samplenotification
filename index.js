const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./notificationapp-b7fa0-firebase-adminsdk-7fujs-3cd2ead83a.json');
const Notification = require('./notificationModel');
const mongoose = require('mongoose');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

mongoose.connect('mongodb+srv://developer:ef1cP4Axy5HMXRbA@samplenotificationapp.2s8qmiq.mongodb.net/?retryWrites=true&w=majority&appName=samplenotificationapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

const app = express();
app.use(bodyParser.json());

app.post('/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);

    const notification = new Notification({ title, content: body, deviceToken: token });
    await notification.save();

    res.status(200).send({ success: true, response });
  } catch (error) {
    res.status(400).send({ success: false, error: error.message });
  }
});

// Endpoint to mark a single notification as read
app.post('/read-notification', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.body.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).send({ success: false, message: 'Notification not found' });
    }
    res.status(200).send({ success: true, notification });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

// Endpoint to mark all notifications as read
app.post('/read-all-notifications', async (req, res) => {
  try {
    await Notification.updateMany({deviceToken:req.body.deviceToken}, { isRead: true });
    res.status(200).send({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

