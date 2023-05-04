const express = require('express');
const router = express.Router();
const CHAT = require('../models/chat1');
const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
    apiKey: process.env.APIKEY,
});
const openai = new OpenAIApi(config);

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/chat1', isLoggedIn, async (req, res, next) => {
    const chatItems = await CHAT.find({ userId: req.user._id });
    res.render('chat1', { user: req.user, chatItems });
});

router.post("/chat1", async (req, res) => {
    try {
        const prefix = "Show the auspicious and inauspicious activities according to the Chinese Huangli calendar for the following date:";
        let prompt = prefix + req.body.code;
        console.log('prompt=', prompt);
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            max_tokens: 1024,
            temperature: 0.5,
            n: 1,
            stop: null,
        });
        let chatItem = new CHAT({
            prompt: req.body.code,
            answer: response.data.choices[0].text,
            userId: req.user._id
        });
        await chatItem.save();
        return res.render("chatResponse1", { answer: response.data.choices[0].text });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.response
                ? error.response.data
                : "Server Issue",
        });
    }
});

module.exports = router;