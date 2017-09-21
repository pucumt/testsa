const model = require('./model.js');

model.sync().then(function () {
    var pArray = [];
    model.models.forEach(function (name) {
        var mongoObj = require(`./models/${name}.js`),
            pMongo = mongoObj.rawAll().then(function (entities) {
                var tmpArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();
                    // handle discount
                    if (newObj.discount === null) {
                        delete newObj.discount;
                    }
                    var tmp = model[name].create(newObj)
                        .catch(function (err) {
                            throw new Error(newObj);
                        });
                    tmpArray.push(tmp);
                });
                return Promise.all(tmpArray);
            });
        pArray.push(pMongo);
    });

    Promise.all(pArray).then(function () {
        console.log('init db ok.');
        process.exit(0);
    });
});