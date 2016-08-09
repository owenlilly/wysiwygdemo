const router = require('express').Router();
const RxMongo = require('rxmongo');
const Rx = require('rx');
const ObjectID = require('mongodb').ObjectID

router
.post('/story/publish', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    const username = sess.username;
    const body = req.body;

    body.username = username;
    body.datePublished = new Date();
    body.isDraft = false;

    const collection = RxMongo.collection('Stories');
    const rxUpdate = collection.flatMap(coll => RxMongo.updateOne(coll, {_id: ObjectID(body._id), username: username}, {$set: {
        isDraft: body.isDraft,
        datePublished: body.datePublished,
        topic: body.topic,
        story: body.story,
        username: body.username
    }}));

    rxUpdate.subscribe(result => {
            res.json(body);
        },
        error => {
            res.status(500).json({error: error});
        },
        () => next());
})
.post('/story/save-draft', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    const username = sess.username;
    const body = req.body;
    body.username = username;
    
    const collection = RxMongo.collection('Stories');
    const rxInsert = collection.flatMap(coll => RxMongo.insert(coll, body));
    const rxUpdate = collection.flatMap(coll => RxMongo.updateOne(coll, {_id: ObjectID(body._id), username: username}, {$set: {
        isDraft: body.isDraft,
        topic: body.topic,
        story: body.story
    }}));

    if(!body._id){
        rxInsert.subscribe(result => {
            res.json(body);
        },
        error => {
            res.status(500).json({error: error});
        },
        () => next());
    } else {
        rxUpdate.subscribe(result => {
            res.json(body);
        },
        error => {
            res.status(500).json({error: error});
        },
        () => next());
    }
})
.delete('/story', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    res.json({status: 'Deleted!'});
    next();
})
.get('/story', (req, res, next) => {
    
    const rxCollection = RxMongo.collection('Stories');
    const aggregation = [
        { $match: { isDraft: false } },
        { $project: {
                topic: 1,
                summary: {$substr: ['$story', 0, 500]},
                username: 1,
                datePublished: 1
            }
        },
        { $sort: { datePublished: -1 } }
    ];
    const rxAggregate = rxCollection.flatMap(coll => RxMongo.aggregate(coll, aggregation));
    const rxStripHtmlTags = rxAggregate.flatMap(stories => Rx.Observable.from(stories))
                                        .map(story => {
                                            const regex = /(<([^>]+)>)/ig
                                            story.summary = story.summary.replace(regex, '');
                                            return story;
                                        })
                                        .toArray();
    
    rxStripHtmlTags.subscribe(
        stories => {
            console.log(stories);
            res.json(stories);
        },
        error => {
            res.status(500).json({error: error});
        },
        () => next()
    );
})
.get('/story/:storyId', (req, res, next) => {

    res.json({type: 'single', storyId: req.params.storyId});
    next();
});

module.exports = router;