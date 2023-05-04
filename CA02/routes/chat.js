/*
  gpt.js -- Router for the GPT
  To run this you need to:
* first visit openai.com and get an APIkey, 
* which you export into the environment as shown in the shell code below.
* next create a folder and put this file in the folder as gpt.py
* finally run the following commands in that folder
On Mac
% pip3 install openai
% export OPENAI_API_KEY="......."  # in bash
% python3 gpt.py
*/

const express = require('express');
const router = express.Router();
const CHAT = require('../models/chat');
const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// show all the queries
router.get('/chat', isLoggedIn, async (req, res, next) => {
    const chatItems = await CHAT.find({ userId: req.user._id });
    res.render('chat', { user: req.user, chatItems });
});

// ask a query
router.post("/chat", async (req, res) => {
    try {
        const prefix = "Translate the following into Chinese:";
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
        return res.render("chatResponse", { answer: response.data.choices[0].text });
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