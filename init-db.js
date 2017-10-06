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

function step2(i) {
    i = i || 0;
    var pArray = [];
    var name = model.models[i];
    if (!name) {
        return;
        // end of array
    }
    // model.models.forEach(function (name) {
    if ("adminEnrollTrain" == name || "adminEnrollTrainHistory" == name ||
        "trainClass" == name) {
        i++;
        console.log(i + "..." + name + ".............finished!");
        return step2(i);

        return;
    }

    var mongoObj = require(`./models/${name}.js`);
    return mongoObj.rawAll().then(function (entities) {
            var tmpArray = [],
                nextArray = [];
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
                    if (newObj.baseId) {
                        newObj.baseId = newObj.baseId.toJSON();
                    }
                    if (newObj.superCategoryId) {
                        newObj.superCategoryId = newObj.superCategoryId.toJSON();
                    }
                    if (newObj.payWay) {
                        delete newObj.payWay;
                    }
                }
                if (name == "rebateEnrollTrain") {
                    newObj.trainOrderId = newObj.trainOrderId.toJSON();
                }
                if (name == "gradeSubjectCategoryRelation") {
                    newObj.gradeId = newObj.gradeId.toJSON();
                    newObj.subjectId = newObj.subjectId.toJSON();
                    newObj.categoryId = newObj.categoryId.toJSON();
                }
                if (name == "gradeSubjectRelation") {
                    newObj.gradeId = newObj.gradeId.toJSON();
                    newObj.subjectId = newObj.subjectId.toJSON();
                }
                if (name == "adminEnrollExam" && newObj.mobile === null) {
                    delete newObj.mobile;
                }
                if (name == "couponAssign" && newObj.orderId === null) {
                    delete newObj.orderId;
                }
                if (name == "lesson") {
                    newObj.bookId = newObj.bookId.toJSON();
                }
                if (name == "lessonContent") {
                    newObj.lessonId = newObj.lessonId.toJSON();
                }
                if (name == "schoolGradeRelation") {
                    newObj.schoolId = newObj.schoolId.toJSON();
                    newObj.gradeId = newObj.gradeId.toJSON();
                }
                if (name == "studentLesson") {
                    newObj.studentId = newObj.studentId.toJSON();
                    newObj.lessonId = newObj.lessonId.toJSON();
                }
                if (name == "studentLessonScore") {
                    newObj.studentId = newObj.studentId.toJSON();
                    newObj.lessonId = newObj.lessonId.toJSON();
                    newObj.contentId = newObj.contentId.toJSON();
                }
                if (name == "user") {
                    if (newObj.schoolId) {
                        newObj.schoolId = newObj.schoolId.toJSON();
                    }
                }

                if (tmpArray.length < 5000) {
                    tmpArray.push(newObj);
                } else {
                    nextArray.push(newObj);
                }
            });

            function bulkCreate(entityArray) {
                var curArray = [],
                    newArray = [];
                entityArray.forEach(function (newObj) {
                    if (curArray.length < 5000) {
                        curArray.push(newObj);
                    } else {
                        newArray.push(newObj);
                    }
                });
                entityArray = [];
                return model[name].bulkCreate(curArray)
                    .then(function () {
                        curArray = [];
                        if (newArray.length > 0) {
                            return bulkCreate(newArray);
                        }
                    })
                    .catch(function (err) {
                        throw new Error(err);
                    });
            }

            return model[name].bulkCreate(tmpArray)
                .then(function () {
                    tmpArray = [];
                    if (nextArray.length > 0) {
                        return bulkCreate(nextArray);
                    }
                })
                .catch(function (err) {
                    throw new Error(err);
                });
            // return Promise.all(tmpArray);
        })
        .then(function () {
            tmpArray = null;
            mongoObj = null;
            i++;
            console.log(i + "..." + name + ".............finished!");
            // if (i < 5) {
            // only test 7 objects
            return step2(i);
            // }
        })
        .catch(function (err) {
            console.log(err);
        });
};

step1().then(function () {
    try {
        return step2();
    } catch (err) {
        console.log(err);
    }
}).then(function () {
    // TBD

});