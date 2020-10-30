const express = require("express");
const mongodb = require("mongodb");
const mongoUrl = "mongodb+srv://qstatus_admin:UPrNqZHpMVF0xhp0@qstatus.v9xaa.mongodb.net/QStatus?retryWrites=true&w=majority\n";

const router = express.Router();

// Get all quotes
router.get("/", async (req, res) => {
    const quotes = await loadQuotesCollection();
    res.send(await quotes.find({}).sort({createdAt: 1}).toArray());
});

router.get("/filter?", async (req, res) => {
    const quotes = await loadQuotesCollection();
    let filters = {};
    // Building query with filters if available
    req.query.author ? filters.quoteAuthor = { $in: req.query.author.split(",")} : filters;
    req.query.lang ? filters.lang = { $eq: req.query.lang} : filters;
    req.query.categories ? filters.category = { $in: req.query.categories.split(",")} : filters;

    res.send(await quotes.find( filters ).toArray());
});

// Create a quote
router.post("/", async (req, res) => {
    const quotes = await loadQuotesCollection();
    const result = await quotes.findOne({quote: req.body.quoteText});
    if (result) {
        return res.status(403).send({
            message: `${req.body.quoteText} already exists`
        });
    }
    const newRecord = await quotes.insertOne({
        quoteText : req.body.quoteText,
        quoteAuthor : req.body.quoteAuthor,
        thumbnail_url : req.body.thumbnail_url,
        blob_image : req.body.blob_image,
        bg_color : req.body.bg_color,
        color : req.body.color,
        font_family : req.body.font_family,
        font_size : req.body.font_size,
        lang : req.body.lang,
        category : req.body.category,
        createdAt: new Date()
    });
    res.send(await newRecord.ops[0]);
});

// Bulk Insert of quotes
router.post("/bulk", async (req, res) => {
    const quotes = await loadQuotesCollection();

    if (req.body.api_key === process.env.API_KEY && req.body.quotes.length !== 0 && req.body.quotes.constructor === Array) {
        await req.body.quotes.forEach((quote) => {

            const newRecord = quotes.insertOne({
                quoteText : quote.quoteText,
                quoteAuthor : quote.quoteAuthor,
                thumbnail_url : quote.thumbnail_url,
                blob_image : quote.blob_image,
                bg_color : quote.bg_color,
                color : quote.color,
                font_family : quote.font_family,
                font_size : quote.font_size,
                lang : quote.lang,
                category : quote.category,
                createdAt: new Date()
            });

        });

        res.status(201).send({
            message: `All quotes successfully inserted`
        });
    } else {
        return res.status(403).send({
            message: `unable to authorized and please check the payload`
        });
    }
});

// Get a quote
router.get("/:id", async (req, res) => {
    const quotes = await loadQuotesCollection();
    res.send(await quotes.findOne({
        _id: mongodb.ObjectId(req.params.id)
    }));
});

// Update a quote
router.put("/:id", async (req, res) => {
    const quotes = await loadQuotesCollection();
    const result = await quotes.findOne({
        _id: mongodb.ObjectId(req.params.id)
    });
    if (!result) {
        return res.status(403).send({
            message: `Quote does not exists`
        });
    }
    await quotes.findOneAndUpdate({_id: new mongodb.ObjectID(req.params.id)},{
        $set : {
            quoteText : req.body.quoteText || result.quoteText,
            quoteAuthor : req.body.quoteAuthor || result.quoteAuthor,
            thumbnail_url : req.body.thumbnail_url || result.thumbnail_url,
            blob_image : req.body.blob_image || result.blob_image,
            bg_color : req.body.bg_color || result.bg_color,
            color : req.body.color || result.color,
            font_family : req.body.font_family || result.font_family,
            font_size : req.body.font_size || result.font_size,
            lang : req.body.lang || result.lang,
            category : req.body.category || result.category
        }
    }, (err, obj) => {
        res.status(200).send({
            message : `${result.quoteText} has been updated successfully`
        });
    });
});

// Delete a quote
router.delete("/:id", async (req, res) => {
    const quotes = await loadQuotesCollection();
    const result = await quotes.findOne({
        _id: mongodb.ObjectId(req.params.id)
    });
    if (!result) {
        return res.status(403).send({
            message: `Quote does not exists`
        });
    }
    await quotes.findOneAndDelete({_id: new mongodb.ObjectID(req.params.id)},{}, (err, obj) => {
        res.status(200).send({
            message : `${result.quote} has been deleted successfully`
        });
    });
});

async function loadQuotesCollection() {
    const client = await mongodb.MongoClient.connect(
        mongoUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    return client.db("QStatus").collection("quotes");
}

module.exports = router;