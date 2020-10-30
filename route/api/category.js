const express = require("express");
const mongodb = require("mongodb");
const mongoUrl = "mongodb+srv://qstatus_admin:UPrNqZHpMVF0xhp0@qstatus.v9xaa.mongodb.net/QStatus?retryWrites=true&w=majority\n";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
    const categories = await loadCategoriesCollection();
    res.send(await categories.find({}).toArray());
});

// Create a category
router.post("/", async (req, res) => {
    const categories = await loadCategoriesCollection();
    const result = await categories.findOne({name: req.body.name});
    if (result) {
        return res.status(403).send({
            message: `${req.body.name} already exists`
        });
    }
    const newRecord = await categories.insertOne({
        name : req.body.name,
        thumbnail : req.body.thumbnail,
        createdAt: new Date()
    });
    res.send(await newRecord.ops[0]);
});

// Get a category
router.get("/:id", async (req, res) => {
    const categories = await loadCategoriesCollection();
    res.send(await categories.findOne({
        _id: mongodb.ObjectId(req.params.id)
    }));
});

// Update a category
router.put("/:id", async (req, res) => {
    const categories = await loadCategoriesCollection();
    const result = await categories.findOne({
        _id: mongodb.ObjectId(req.params.id)
    });
    if (!result) {
        return res.status(403).send({
            message: `Category does not exists`
        });
    }
    await categories.findOneAndUpdate({_id: new mongodb.ObjectID(req.params.id)},{
        $set : {
            name : req.body.name || result.name,
            thumbnail : req.body.thumbnail || result.thumbnail,
        }
    }, (err, obj) => {
        res.status(200).send({
            message : `${result.name} has been updated successfully`
        });
    });
});

// Delete a category
router.delete("/:id", async (req, res) => {
    const categories = await loadCategoriesCollection();
    const result = await categories.findOne({
        _id: mongodb.ObjectId(req.params.id)
    });
    if (!result) {
        return res.status(403).send({
            message: `Category does not exists`
        });
    }
    await categories.findOneAndDelete({_id: new mongodb.ObjectID(req.params.id)},{}, (err, obj) => {
        res.status(200).send({
            message : `${result.name} has been deleted successfully`
        });
    });
});

async function loadCategoriesCollection() {
    const client = await mongodb.MongoClient.connect(
        mongoUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    return client.db("QStatus").collection("category");
}

module.exports = router;