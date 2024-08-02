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

    const notification = new Notification({ title, content: body });
    await notification.save();

    res.status(200).send({ success: true, response });
  } catch (error) {
    res.status(400).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

