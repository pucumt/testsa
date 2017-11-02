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
        "trainClass" == name || "trainClassExams" == name ||
        "examClass" == name || "examClassSubject" == name ||
        "adminEnrollExam" == name || "adminEnrollExamScore" == name ||

        "absentClass" == name || "couponAssign" == name ||
        "studentInfo" == name) {
        //also failed: step3 step5 step7.score
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
                    if (newObj.payWay && newObj.payWay === null) {
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
                // if (newObj.deletedDate) {
                //     // change all the deletedDate to cancelled Date
                //     newObj.cancelledDate = newObj.deletedDate;
                // }

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
                        throw new Error("error " + name);
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

// to handle the adminEnrollTrain, maybe also need find out the payway
function step3() {
    console.log("begin step 3 adminEnrollTrain... ");
    var mongoObj = require(`./models/adminEnrollTrain.js`);
    // mongoObj.sync({
    //     force: true
    // });
    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();
                    newObj.createdDate = newObj.orderDate;
                    if (newObj.cancelDate) {
                        newObj.deletedDate = newObj.cancelDate;
                    }
                    if (newObj.cancelledBy) {
                        newObj.deletedBy = newObj.cancelledBy;
                    }

                    // handle student discount
                    if (newObj.discount === null) {
                        delete newObj.discount;
                    }
                    // handle special logic
                    newObj.trainId = newObj.trainId.toJSON();
                    if (newObj.baseId) {
                        newObj.baseId = newObj.baseId.toJSON();
                    }
                    if (newObj.superCategoryId) {
                        newObj.superCategoryId = newObj.superCategoryId.toJSON();
                    }
                    if (newObj.payWay === null) {
                        delete newObj.payWay;
                    }
                    tmpArray.push(newObj);
                });

                return model["adminEnrollTrain"].bulkCreate(tmpArray)
                    .then(function () {
                        return rawPage(page + 1);
                    })
                    .catch(function (err) {
                        throw new Error(err);
                    });
            });

    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step 3 adminEnrollTrain.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

// handle adminEnrollTrainHistory
function step4() {
    console.log("begin step 4 adminEnrollTrainHistory... ");
    var mongoObj = require(`./models/adminEnrollTrainHistory.js`);

    return mongoObj.rawAll()
        .then(function (entities) {
            if (entities.length == 0) {
                return;
            }

            var tmpArray = [];
            entities.forEach(function (obj) {
                var newObj = obj.toJSON();
                newObj._id = newObj._id.toJSON();
                newObj.createdDate = newObj.orderDate;
                if (newObj.cancelDate) {
                    newObj.deletedDate = newObj.cancelDate;
                }
                if (newObj.cancelledBy) {
                    newObj.deletedBy = newObj.cancelledBy;
                }

                // handle student discount
                if (newObj.discount === null) {
                    delete newObj.discount;
                }

                if (newObj.payWay === null) {
                    delete newObj.payWay;
                }
                tmpArray.push(newObj);
            });

            return model["adminEnrollTrainHistory"].bulkCreate(tmpArray)
                .then(function () {
                    mongoObj = null;
                    console.log("step 4 adminEnrollTrainHistory .............finished!");
                })
                .catch(function (err) {
                    throw new Error(err);
                });
        });
};

// handle trainClass
function step5() {
    console.log("begin step 5 trainClass ... ");
    var mongoObj = require(`./models/trainClass.js`);

    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [],
                    classExamArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();

                    // handle student discount
                    if (newObj.discount === null) {
                        delete newObj.discount;
                    }

                    if (newObj.bookId) {
                        newObj.bookId = newObj.bookId.toJSON();
                    }
                    if (newObj.teacherId) {
                        newObj.teacherId = newObj.teacherId.toJSON();
                    } else if (newObj.teacherId === null) {
                        delete newObj.teacherId;
                    }

                    if (newObj.exams && newObj.exams.length > 0) {
                        newObj.exams
                            .forEach(function (exam) {
                                classExamArray.push({
                                    _id: exam._id.toJSON(),
                                    trainClassId: newObj._id,
                                    examId: exam.examId,
                                    examName: exam.examName,
                                    minScore: exam.minScore
                                });
                            });
                        delete newObj.exams;
                    }

                    tmpArray.push(newObj);
                });

                return model["trainClass"].bulkCreate(tmpArray)
                    .then(function () {
                        console.log("step 5 trainClass .............finished!");
                        return model["trainClassExams"].bulkCreate(classExamArray)
                            .then(function () {
                                console.log("step 5 trainClassExams .............finished!");
                                return rawPage(page + 1);
                            })
                            .catch(function (err) {
                                console.log(err);
                                throw new Error(err);
                            });
                    })
                    .catch(function (err) {
                        console.log(err);
                        throw new Error(err);
                    });
            });

    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step 5 trainClass real.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });


};

// handle examclass and  subjects
function step6() {
    console.log("begin step 6 examClass ... ");
    var mongoObj = require(`./models/examClass.js`);

    return mongoObj.rawAll()
        .then(function (entities) {
            if (entities.length == 0) {
                return;
            }

            var tmpArray = [],
                subjectArray = [];
            entities.forEach(function (obj) {
                var newObj = obj.toJSON();
                newObj._id = newObj._id.toJSON();

                if (newObj.subjects && newObj.subjects.length > 0) {
                    newObj.subjects
                        .forEach(function (subject) {
                            subjectArray.push({
                                _id: subject._id.toJSON(),
                                examId: newObj._id,
                                subjectId: subject.subjectId,
                                subjectName: subject.subjectName
                            });
                        });
                    delete newObj.subjects;
                }

                tmpArray.push(newObj);
            });

            return model["examClass"].bulkCreate(tmpArray)
                .then(function () {
                    mongoObj = null;
                    console.log("step 6 examClass .............finished!");
                    return model["examClassSubject"].bulkCreate(subjectArray)
                        .then(function () {
                            console.log("step 6 examClassSubject .............finished!");
                        })
                        .catch(function (err) {
                            console.log(err);
                            throw new Error(err);
                        });
                })
                .catch(function (err) {
                    console.log(err);
                    throw new Error(err);
                });
        });
};

// handle adminEnrollExam and score
function step7() {
    console.log("begin step 7 adminEnrollExam ... ");
    var mongoObj = require(`./models/adminEnrollExam.js`);

    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [],
                    scoreArray = [],
                    x = 0;
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    x++;
                    newObj._id = newObj._id.toJSON();
                    if (newObj.mobile === null) {
                        delete newObj.mobile;
                    }
                    newObj.createdDate = newObj.orderDate;
                    if (newObj.CancelDate) {
                        newObj.deletedDate = newObj.CancelDate;
                    }
                    if (newObj.scores && newObj.scores.length > 0) {
                        newObj.scores
                            .forEach(function (score) {
                                scoreArray.push({
                                    _id: x + score._id.toJSON(),
                                    examOrderId: newObj._id,
                                    subjectId: score.subjectId,
                                    subjectName: score.subjectName,
                                    score: score.score,
                                    report: score.report
                                });
                            });
                        delete newObj.scores;
                    }

                    tmpArray.push(newObj);
                });

                return model["adminEnrollExam"].bulkCreate(tmpArray)
                    .then(function () {
                        console.log("step 7 adminEnrollExam .............finished!");
                        return model["adminEnrollExamScore"].bulkCreate(scoreArray)
                            .then(function () {
                                console.log("step 7 adminEnrollExamScore .............finished!");
                                return rawPage(page + 1);
                            })
                            .catch(function (err) {
                                console.log(err);
                                throw new Error(err);
                            });
                    })
                    .catch(function (err) {
                        console.log(err);
                        throw new Error(err);
                    });
            });

    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step 7 adminEnrollExam.............real finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

// absentClass
function step8() {
    console.log("begin step 8 absentClass... ");
    var mongoObj = require(`./models/absentClass.js`);

    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();

                    // handle student discount
                    if (newObj.discount === null) {
                        delete newObj.discount;
                    }

                    tmpArray.push(newObj);
                });

                return model["absentClass"].bulkCreate(tmpArray)
                    .then(function () {
                        return rawPage(page + 1);
                    })
                    .catch(function (err) {
                        throw new Error(err);
                    });
            });
    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step 8 absentClass.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

// couponAssign
function step9() {
    console.log("begin step 9 couponAssign... ");
    var mongoObj = require(`./models/couponAssign.js`);

    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();

                    if (newObj.orderId === null) {
                        delete newObj.orderId;
                    }

                    tmpArray.push(newObj);
                });

                return model["couponAssign"].bulkCreate(tmpArray)
                    .then(function () {
                        return rawPage(page + 1);
                    })
                    .catch(function (err) {
                        throw new Error(err);
                    });
            });
    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step 9 couponAssign.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

// studentInfo
function step10() {
    console.log("begin step 10 studentInfo... ");
    var mongoObj = require(`./models/studentInfo.js`);

    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [];
                entities.forEach(function (obj) {
                    var newObj = obj.toJSON();
                    newObj._id = newObj._id.toJSON();

                    if (newObj.discount === null) {
                        delete newObj.discount;
                    }

                    tmpArray.push(newObj);
                });

                return model["studentInfo"].bulkCreate(tmpArray)
                    .then(function () {
                        return rawPage(page + 1);
                    })
                    .catch(function (err) {
                        throw new Error(err);
                    });
            });
    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step 10 studentInfo.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

function rebateRun() {
    console.log("begin to recover rebate date... ");
    var mongoObj = require(`./models/rebateEnrollTrain.js`);

    function rawPage(page) {
        page = page || 1;
        return mongoObj.rawAll(page)
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [];
                entities.forEach(function (obj) {
                    var p = model.rebateEnrollTrain.update({
                        originalPrice: obj.originalPrice,
                        originalMaterialPrice: obj.originalMaterialPrice,
                        rebateTotalPrice: obj.rebateTotalPrice,
                        rebatePrice: obj.rebatePrice,
                        rebateMaterialPrice: obj.rebateMaterialPrice
                    }, {
                        where: {
                            _id: obj._id.toJSON()
                        }
                    });
                    tmpArray.push(p);
                });

                return Promise.all(tmpArray)
                    .then(function () {
                        return rawPage(page + 1);
                    })
                    .catch(function (err) {
                        console.log(err);
                        throw new Error(err);
                    });
            });
    };

    return rawPage(1)
        .then(function () {
            mongoObj = null;
            console.log("step recover rebate date.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

function orderHistoryRun() {
    console.log("begin to order history... ");
    var mongoObj = require(`./models/adminEnrollTrainHistory.js`);

    function rawPage() {
        return mongoObj.rawAll()
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [];
                entities.forEach(function (obj) {
                    var p = model.adminEnrollTrainHistory.update({
                        totalPrice: obj.totalPrice,
                        realMaterialPrice: obj.realMaterialPrice,
                        rebatePrice: obj.rebatePrice
                    }, {
                        where: {
                            _id: obj._id.toJSON()
                        }
                    });
                    tmpArray.push(p);
                });

                return Promise.all(tmpArray)
                    .catch(function (err) {
                        console.log(err);
                        throw new Error(err);
                    });
            });
    };

    return rawPage()
        .then(function () {
            mongoObj = null;
            console.log("step order history.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

function orderRebatePrice() {
    console.log("begin to order rebate  ... ");
    var mongoObj = require(`./models/adminEnrollTrain.js`);

    function rawPage() {
        return mongoObj.rawRebate()
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [],
                    rebateCount = 0;
                entities.forEach(function (obj) {
                    var p = model.adminEnrollTrain.findOne({
                            'where': {
                                _id: obj._id.toJSON()
                            }
                        })
                        .then(order => {
                            if (Math.abs(order.rebatePrice - obj.rebatePrice) < 1) {
                                return model.adminEnrollTrain.update({
                                    rebatePrice: obj.rebatePrice
                                }, {
                                    where: {
                                        _id: obj._id.toJSON()
                                    }
                                });
                            } else {
                                rebateCount++;
                            }
                        })
                    tmpArray.push(p);
                });

                return Promise.all(tmpArray)
                    .then(function () {
                        console.log(rebateCount);
                    })
                    .catch(function (err) {
                        console.log(err, rebateCount);
                        throw new Error(err);
                    });
            });
    };

    return rawPage()
        .then(function () {
            mongoObj = null;
            console.log("step order rebate.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};


function ordertotalPrice() {
    console.log("begin to order totalPrice  ... ");
    var mongoObj = require(`./models/adminEnrollTrain.js`);

    function rawPage() {
        return mongoObj.rawTotal()
            .then(function (entities) {
                if (entities.length == 0) {
                    return;
                }

                var tmpArray = [],
                    rebateCount = 0;
                entities.forEach(function (obj) {
                    var p = model.adminEnrollTrain.findOne({
                            'where': {
                                _id: obj._id.toJSON()
                            }
                        })
                        .then(order => {
                            if (Math.abs(order.totalPrice - obj.totalPrice) < 1) {
                                return model.adminEnrollTrain.update({
                                    totalPrice: obj.totalPrice
                                }, {
                                    where: {
                                        _id: obj._id.toJSON()
                                    }
                                });
                            } else {
                                rebateCount++;
                            }
                        })
                    tmpArray.push(p);
                });

                return Promise.all(tmpArray)
                    .then(function () {
                        console.log(rebateCount);
                    })
                    .catch(function (err) {
                        console.log(err, rebateCount);
                        throw new Error(err);
                    });
            });
    };

    return rawPage()
        .then(function () {
            mongoObj = null;
            console.log("step order totalPrice.............finished!");
        })
        .catch(function (err) {
            console.log(err);
        });
};

function toRun() {
    return rebateRun()
        .then(function () {
            return orderHistoryRun();
        }).then(function () {
            return orderRebatePrice();
        })
        .then(function () {
            return ordertotalPrice();
        });
};

toRun();

// step1().then(function () {
//         try {
//             return step2();
//         } catch (err) {
//             console.log(err);
//         }
//     })
//     .then(function () {
//         return step3();
//     })
//     .then(function () {
//         return step4();
//     })
//     .then(function () {
//         return step5();
//     })
//     .then(function () {
//         return step6();
//     })
//     .then(function () {
//         return step7();
//     })
//     .then(function () {
//         return step8();
//     })
//     .then(function () {
//         return step9();
//     })
//     .then(function () {
//         return step10();
//     });