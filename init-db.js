const model = require('./model.js');

function step1() {
    console.log("begin step 1 ... ");
    return model.sync().then(function () {
        var pArray = [];

        return Promise.all(pArray).then(function () {
            console.log('finished step 1 ....');
        });
    });
};

function step2() {
    model.db.sequelize.query("select T._id, S.name from trainClasss T join schoolAreas S \
        on S._id=T.schoolId \
        where T.schoolArea='' ", {
            replacements: {},
            type: model.db.sequelize.QueryTypes.SELECT
        })
        .then(entities => {
            var tmpArray = [];
            entities.forEach(function (obj) {
                var p = model.trainClass.update({
                    schoolArea: obj.name
                }, {
                    where: {
                        _id: obj._id
                    }
                });
                tmpArray.push(p);
            });

            return Promise.all(tmpArray);
        });
};

function toRun() {
    return step2();
};

toRun();