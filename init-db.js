const model = require('./model.js');

model.sync().then(function () {
    var pArray = [];
    model.models.forEach(function (name) {
        if (name == "adminEnrollTrain") {
            return;
        }

        var mongoObj = require(`./models/${name}.js`),
            pMongo = mongoObj.rawAll().then(function (entities) {
                var tmpArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();

                    // handle student discount
                    if (newObj.discount === null) {
                        delete newObj.discount;
                    }
                    // handle special logic
                    if (name == "adminEnrollTrain") {
                        newObj.trainId = newObj.trainId.toJSON();
                    }
                    if (name == "rebateEnrollTrain") {
                        newObj.trainOrderId = newObj.trainOrderId.toJSON();
                    }
                    if (name == "gradeSubjectCategoryRelation") {
                        newObj.gradeId = newObj.gradeId.toJSON();
                    }
                    if (name == "adminEnrollExam" && newObj.mobile === null) {
                        delete newObj.mobile;
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