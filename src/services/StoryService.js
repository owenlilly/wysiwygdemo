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

    StoryService.prototype.getStoryById = function(id){
        return this.find({_id: ObjectID(id)})
                    .single();
    }

    StoryService.prototype.getByIdAndUsername = function(id, username){
        return this.find({_id: ObjectID(id), username: username})
                    .single();
    }

    StoryService.prototype.getDraft = function(id, username){
        return new RxCollection('Drafts')
                    .find({_id: ObjectID(id), username: username})
                    .single();
    }

    StoryService.prototype.getStory = function(username, storyId){
        return this.find({username: username, storyId: storyId})
                    .single(); // returns Rx.Observable<T>
    }

    StoryService.prototype.deleteOne = function(filter){
        return this.rxCollection.deleteOne(filter);
    }

    StoryService.prototype.deleteById = function(username, id) {
        return this.deleteOne({username: username, _id: ObjectID(id)});
    }

    StoryService.prototype.publish = function(username, draft){
        if(!draft._id){
            throw new Error('cannot publish draft, _id property required.');
        }

        const now = new Date();
        const draftId = draft._id;
        const storyId = `${draft.topic.toLowerCase().replace(new RegExp(' ', 'g'), '-')}-${draftId.slice(-4)}`;;

        const draftCollection = new RxCollection('Drafts');
        const storyCollection = new RxCollection('Stories');
        const rxFindDraftOrThrow = draftCollection.findOne({_id: ObjectID(draftId), username: username})
                                                  .filter(d => {
                                                      if(!d){
                                                          throw new Error('Draft not found');
                                                      }

                                                      return true;
                                                  });
        const rxSaveStory = storyCollection.insert({
            datePublished: now,
            topic: sanitizeHtml(draft.topic),
            story: sanitizeHtml(draft.story),
            username: username,
            storyId: storyId,
            lastUpdated: now
        });
        const rxDeleteDraft = draftCollection.deleteById(draftId);
        const rxPublishFlow = Rx.Observable.zip(
            rxFindDraftOrThrow,
            rxSaveStory,
            (x, y) => {
                return rxDeleteDraft;
            }
        );

        return rxPublishFlow.flatMap(obs => obs);
    }

    StoryService.prototype.update = function(username, updated){        
        updated.storyId = `${updated.topic.toLowerCase().replace(new RegExp(' ', 'g'), '-')}-${updated._id.slice(-4)}`;

        let prunedUpdates = JSON.parse(JSON.stringify(updated));
        prunedUpdates.topic = sanitizeHtml(updated.topic);
        prunedUpdates.story = sanitizeHtml(updated.story);
        prunedUpdates.storyId = updated.storyId;
        prunedUpdates.lastUpdated = new Date();
        delete prunedUpdates._id;

        const updateQuery = {_id: ObjectID(updated._id), username: username};
        const rxUpdate = this.rxCollection.updateOne(updateQuery, {$set: prunedUpdates});

        return rxUpdate;
    }

    StoryService.prototype.saveDraft = function(username, draft){
        draft.username = username;
        const now = new Date();
        const collection = RxMongo.collection('Drafts');
        const updateQuery = {_id: ObjectID(draft._id), username: username};
        const rxInsert = collection.flatMap(coll => RxMongo.insert(coll, draft));
        const rxUpdate = collection.flatMap(coll => RxMongo.updateOne(coll, updateQuery, {$set: {
            topic: sanitizeHtml(draft.topic),
            story: sanitizeHtml(draft.story),
            lastUpdated: now
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

    StoryService.prototype.getDraftPreviews = function(match){
        const rxCollection = RxMongo.collection('Drafts');
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
            { $sort: { lastUpdated: -1 } }
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