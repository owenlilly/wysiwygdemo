const RxCollection = require('rxmongo').RxCollection;
const RxMongo = require('rxmongo').RxMongo;
const Rx = require('rx');
const ObjectID = require('mongodb').ObjectID;
const sanitizeHtml = require('sanitize-html');


const StoryService = (function(){
    function StoryService(){ 
        this.rxCollection = new RxCollection('Stories');
    }

    StoryService.prototype.find = function(query){
        return this.rxCollection
                    .find(query); // returns RxCusror
    }

    StoryService.prototype.getStories = function(){
        return this.find({})
                    .toArray(); // returns RxArray
    }

    StoryService.prototype.getStories = function(username){
        return this.find({username: username})
                    .toArray(); // returns RxArray
    }

    StoryService.prototype.getStory = function(username, storyId){
        return this.find({username: username, storyId: storyId})
                    .single(); // returns Rx.Observable<T>
    }

    StoryService.prototype.publish = function(username, draft){
        if(!draft._id){
            throw new Error('cannot publish draft, _id property required.');
        }

        const now = new Date();

        draft.username = username;
        draft.datePublished = now;
        draft.isDraft = false;
        draft.storyId = `${draft.topic.toLowerCase().replace(new RegExp(' ', 'g'), '-')}-${draft._id.slice(-4)}`;

        const collection = RxMongo.collection('Stories');
        const query = {_id: ObjectID(draft._id), username: username};
        const rxUpdate = collection.flatMap(coll => RxMongo.updateOne(coll, query, {$set: {
            isDraft: draft.isDraft,
            datePublished: draft.datePublished,
            topic: sanitizeHtml(draft.topic),
            story: sanitizeHtml(draft.story),
            username: draft.username,
            storyId: draft.storyId,
            lastUpdated: now
        }}));

        return rxUpdate;
    }

    StoryService.prototype.update = function(username, updated){        
        updated.storyId = `${updated.topic.toLowerCase().replace(new RegExp(' ', 'g'), '-')}-${updated._id.slice(-4)}`;

        const updateQuery = {_id: ObjectID(updated._id), username: username};
        const rxUpdate = this.rxCollection.updateOne(updateQuery, {$set: {
            isDraft: updated.isDraft,
            topic: sanitizeHtml(updated.topic),
            story: sanitizeHtml(updated.story),
            storyId: updated.storyId,
            lastUpdated: new Date()
        }});

        return rxUpdate;
    }

    StoryService.prototype.saveDraft = function(username, draft){
        draft.username = username;
    
        const collection = RxMongo.collection('Stories');
        const updateQuery = {_id: ObjectID(draft._id), username: username};
        const rxInsert = collection.flatMap(coll => RxMongo.insert(coll, draft));
        const rxUpdate = collection.flatMap(coll => RxMongo.updateOne(coll, updateQuery, {$set: {
            isDraft: draft.isDraft,
            topic: sanitizeHtml(draft.topic),
            story: sanitizeHtml(draft.story)
        }}));

        if(!draft._id){
            return rxInsert;
        } else {
            return rxUpdate;
        }
    }

    StoryService.prototype.getPreviews = function(match){
        const rxCollection = RxMongo.collection('Stories');
        const aggregation = [
            { $match: match },
            { $project: {
                    topic: 1,
                    summary: {$substr: ['$story', 0, 500]},
                    username: 1,
                    datePublished: 1,
                    storyId: 1
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

        return rxStripHtmlTags;
    }

    return StoryService;
})();

module.exports = StoryService;