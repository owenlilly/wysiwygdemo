const router = require('express').Router();
const RxMongo = require('rxmongo');

router
.get('/:username/:article_id', (req, res, next) => {
    res.send(`${req.params.username}: ${req.params.article_id}`);
    next();
});

module.exports = router;