const ChatSession = require('../models/assistant');
const Listing = require("../models/listing");
const { v4: uuidv4 } = require('uuid');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');





module.exports.help = (req, res) => {
    res.render("footerPages/help.ejs");
}



module.exports.support = async (req, res) => {
    try {
        const { GoogleGenAI } = await import('@google/genai');
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        const user = req.user || null;
        const username = user?.username?.split(/[_ ]/)[0] || 'Guest';
        const chatIdFromBody = req.body.chatId || null;
        const chatIdFromSession = req.session?.chatId || null;
        const chatIdFromQuery = req.query?.chat || null;
        const sessionID = req.sessionID;
        const userMessage = (req.body.input || "").trim();
        let guestGroupId = req.session?.guestSessionId || null;

        if (!userMessage) {
            let existingSession = await ChatSession.findOne({ sessionId: sessionID });

            // Sidebar chats
            const userChats = user
                ? await ChatSession.find({ userId: user._id }).sort({ createdAt: -1 })
                : await ChatSession.find({ sessionId: sessionID }).sort({ createdAt: -1 });

            return res.render("footerPages/assistant.ejs", {
                session: existingSession,
                currUser: user,
                sessionChatId: chatIdFromSession,
                userChats: userChats
            });
        }


        // Resolve session
        let session = null;
        if (chatIdFromBody) session = await ChatSession.findById(chatIdFromBody);
        else if (chatIdFromQuery) session = await ChatSession.findById(chatIdFromQuery);
        else if (chatIdFromSession) session = await ChatSession.findById(chatIdFromSession);
        else if (!user && guestGroupId) session = await ChatSession.findOne({ sessionId: guestGroupId });
        else session = await ChatSession.findOne({ sessionId: sessionID });

        if (!session) {
            const uniqueSessionId = uuidv4();
            if (!user && !guestGroupId) guestGroupId = uuidv4();
            session = new ChatSession({
                userId: user?._id,
                sessionId: user ? uniqueSessionId : guestGroupId,
                title: user ? `${username} — ${new Date().toLocaleDateString()}` : `Guest Chat — ${new Date().toLocaleDateString()}`,
                messages: [{
                    sender: "assistant",
                    text: `Hello ${username}, How can I help you today?`
                }]
            });
            await session.save();
        }

        // Push user message
        session.messages.push({ sender: "user", text: userMessage });

        // Prepare context data from listings
        const listings = await Listing.find({}).limit(30).populate("reviews").populate("owner");
        const contextData = listings.map(listing =>
            `${listing.title}, ${listing.description} in ${listing.location} - ${listing.price}/month, ${listing.category} available and the reviews of this listing are as follows ${listing.reviews} and the owner of this listing is ${listing.owner.username} `
        ).join("\n");

        const formatExamples = `
        Examples:
        Example 1:
        User: I am a student. Suggest PGs near North Campus.
        Assistant:
        {
            "summary": "Here are some student PG options near North Campus.",
            "listings": [
                {"title": "Colony Hostel Room", "location": "Hudson Lane, Delhi", "description": "Safe girls hostel near Delhi University", "price": "₹8,500/month"},
                {"title": "Student Room near University", "location": "Shivaji Nagar, Pune", "description": "Furnished single room, AC, laundry included", "price": "₹8,000/month"}
            ],
            "suggestion": "You can book via LeaseNest platform."
        }
        `;

        const prompt = `
        You are LeaseNest AI Assistant, and LeaseNest is a rental listing and management platform designed to help users find, list, and book rental properties across multiple cities in India.
        
        Your main job is to assist users by answering their rental-related questions quickly and accurately. below some of your responsibilities are described in detail:
        You find suitable rental listings based on user preferences like location, budget, and category.
        You help users with booking processes and provide real-time updates on listings, availability, and prices.
        You also provide personalized recommendations and support general queries to make renting easier and faster.
        By doing all this, you improve user experience and help LeaseNest run efficiently.


        Respond in clean, readable text with this structure:

        Summary:
        <2-3 line summary here>

        Listings:
        1. <Property Name> — <Location>. <Description>. Rent: ₹xxxx/month
        2. <Property Name> — <Location>. <Description>. Rent: ₹xxxx/month
        3. ...

        Suggestion:
        <Helpful tip or suggestion for the user>

        Make sure your response always follows this exact structure.you can skip listings part if it is not asked or relevant to the query.

        ${formatExamples}
        Available Listings: ${contextData}
        Chat History: ${session.messages.map(m => `${m.sender}: ${m.text}`).join("\n")}
        Now respond to the latest user message: "${userMessage}"
        `;
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            temperature: 0.7,
            candidateCount: 1,
            maxOutputTokens: 400,
        });

        // extract AI text safely
        aiText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I couldn’t generate a response.";
        //await console.log(aiText);



        //console.log(JSON.stringify(response, null, 2));

        // save assistant reply
        session.messages.push({
            sender: "assistant",
            text: aiText,
            timestamp: new Date(),
        });
        await session.save();

        // keep session id in memory
        if (req.session) {
            req.session.chatId = session._id;
            if (!user) req.session.guestSessionId = session.sessionId;
        }

        // sidebar chat list
        const userChats = user
            ? await ChatSession.find({ userId: user._id }).sort({ createdAt: -1 })
            : await ChatSession.find({
                sessionId: guestGroupId || session.sessionId,
            }).sort({ createdAt: -1 });

        res.render("footerPages/assistant.ejs", {
            session,
            currUser: user,
            userChats,
            sessionChatId: req.session?.chatId,
        });
    } catch (err) {
        console.error("AI Assistant Error:", err);
        res.render("footerPages/assistant.ejs", {
            session: null,
            currUser: req.user || null,
            userChats: [],
            result: "Something went wrong with the AI Assistant.",
            sessionChatId: req.session?.chatId || null,
        });
    }
};

module.exports.newChat = async (req, res) => {
    try {
        const user = req.user || null;
        const username = user && user.username ? user.username.split(/[_ ]/)[0] : 'Guest';

        // Generate unique session ID
        const uniqueSessionId = uuidv4();

        const newSession = new ChatSession({
            userId: user ? user._id : undefined,
            sessionId: uniqueSessionId,  // <-- use UUID instead of req.sessionID
            title: `New Chat — ${new Date().toLocaleDateString()}`,
            messages: [
                {
                    sender: "assistant",
                    text: `Hello ${username}, How can I help you today?`,
                    timestamp: new Date()
                }
            ]
        });

        await newSession.save();
        // persist into express-session
        if (req.session) {
            req.session.chatId = newSession._id;
            req.session.guestSessionId = newSession.sessionId;
            // save session and then redirect so client has the cookie updated
            return req.session.save((err) => {
                if (err) console.error('session save error', err);
                return res.redirect("/assistant?chat=" + newSession._id);
            });
        }

        // Redirect to assistant page with new session _id
        res.redirect("/assistant?chat=" + newSession._id);
    } catch (err) {
        console.error(err);
        res.redirect("/assistant");
    }
};

module.exports.sidebarMessages = async (req, res) => {
    try {
        const user = req.user || null;

        // Sidebar chats for current user (safe)
        const userChats = user ? await ChatSession.find({ userId: user._id }).sort({ createdAt: -1 }) : [];

        let session = null;

        // Load specific chat if ?chat=ID is present
        if (req.query.chat) {
            session = await ChatSession.findById(req.query.chat);
        } else if (userChats.length > 0) {
            session = userChats[0]; // default last chat
        } else {
            // no chats found; create a guest chat tied to the express session so sidebar shows something
            const uniqueSessionId = uuidv4();
            const guestChat = new ChatSession({
                userId: undefined,
                sessionId: uniqueSessionId,
                title: `Guest Chat — ${new Date().toLocaleDateString()}`,
                messages: [
                    { sender: 'assistant', text: 'Hello Guest, how can I help you today?', timestamp: new Date() }
                ]
            });
            await guestChat.save();
            session = guestChat;
            userChats.push(guestChat);
            if (req.session) {
                req.session.chatId = guestChat._id;
                req.session.guestSessionId = guestChat.sessionId;
            }
        }

        res.render("footerPages/assistant.ejs", { session, userChats, currUser: user, sessionChatId: (req.session && req.session.chatId) ? req.session.chatId : null });
    } catch (err) {
        console.error(err);
        res.render("footerPages/assistant.ejs", { session: null, userChats: [], currUser: req.user || null, sessionChatId: (req.session && req.session.chatId) ? req.session.chatId : null });
    }
};

module.exports.deleteChat = async (req, res) => {
    try {
        const chatId = req.params.id;
        const user = req.user || null;

        const chat = await ChatSession.findById(chatId);
        if (!chat) {
            req.flash('error', 'Chat not found');
            return res.redirect('/assistant');
        }

        // Authorization: allow if owner (userId matches) OR guest created via guestSessionId
        const isOwner = user && chat.userId && user._id.equals(chat.userId);
        const isGuestOwner = !user && req.session && req.session.guestSessionId && req.session.guestSessionId === chat.sessionId;

        if (!isOwner && !isGuestOwner) {
            req.flash('error', 'Not authorized to delete this chat');
            return res.status(403).redirect('/assistant');
        }

        await ChatSession.findByIdAndDelete(chatId);

        // cleanup session if it referenced this chat
        if (req.session) {
            if (req.session.chatId && req.session.chatId.toString() === chatId.toString()) {
                delete req.session.chatId;
            }
        }

        // If the request accepts JSON, respond with JSON (AJAX)
        const acceptsJson = req.headers.accept && req.headers.accept.indexOf('application/json') !== -1;
        if (acceptsJson || req.xhr) {
            return res.json({ success: true });
        }

        req.flash('success', 'Chat deleted');
        return res.redirect('/assistant');
    } catch (err) {
        console.error(err);
        console.error(err);
        if (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
            return res.status(500).json({ success: false, error: 'Unable to delete chat' });
        }
        req.flash('error', 'Unable to delete chat');
        return res.redirect('/assistant');
    }
};
