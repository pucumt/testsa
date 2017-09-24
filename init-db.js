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
    if (name == "adminEnrollTrain" || "adminEnrollTrainHistory" == name ||
        name == "couponAssign" || "studentInfo" == name || "trainClass" == name) {
        i++;
        console.log(i + "..." + name + ".............finished!");
        step2(i);

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

                var tmp = model[name].create(newObj)
                    .catch(function (err) {
                        throw new Error(newObj);
                    });
                tmpArray.push(tmp);
            });
            return Promise.all(tmpArray);
        })
        .then(function () {
            i++;
            console.log(i + "..." + name + ".............finished!");
            step2(i);
        });
    //pArray.push(pMongo);
    // });

    // Promise.all(pArray).then(function () {
    //     console.log('finished step 2 ....');
    // });
};

step1().then(function () {
    try {
        step2();
    } catch (err) {
        console.log(err);
    }
});