var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto');

var fs = require('fs'),
    path = require("path"),
    model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Lesson = model.lesson,
    Book = model.book,
    LessonContent = model.lessonContent;

module.exports = function (app) {
    app.get('/filegenerator', function (req, res) {
        res.render('Test/filegenerator.html', {
            title: '自动生成'
        });
    });

    function handleContent(lesson, sourceFolder, lessonPath) {
        return LessonContent.getFilters({
            lessonId: lesson._id
        }).then(function (contents) {
            // copy 单词，句子 和 课文
            // var wordList = contents.filter(function (content) {
            //     return content.contentType == 1;
            // });
            // var sentencesList = contents.filter(function (content) {
            //     return content.contentType == 2;
            // });
            var sequence = parseInt(lesson.sequence) * 2 - 1;
            var para = contents.filter(function (content) {
                return content.contentType == 0;
            })[0];

            var sourceFile = path.join(sourceFolder, "Lesson" + sequence.toString() + ".mp3"),
                targetFile = path.join(lessonPath, lesson._id, para._id + ".mp3");
            fs.renameSync(sourceFile, targetFile, function (err) {
                if (err) throw err;
                fs.stat(targetFile, function (err, stats) {
                    if (err) throw err;
                    console.log('stats: ' + JSON.stringify(stats));
                });
            });
            // fs.writeFileSync(path.join(yourfileDirPath, para._id + ".mp3"), fs.readFileSync(sourceFile));
        });
    };

    app.post('/filegenerator', function (req, res) {
        var lessonPath = "E:\\project\\nodejs\\testGL\\public\\uploads\\books\\59b0ea23ba582520d58aeb36";
        Lesson.getFilters({
                bookId: '59b0ea23ba582520d58aeb36'
            })
            .then(function (lessons) {
                if (lessons) {
                    // generate folder and also convert file to new
                    var baseSourceFolder = "E:\\project\\baks\\语音识别\\NCE文本\\NCE 录音\\NCE L 1-4";
                    var pArray = [];
                    for (var i = 0; i < lessons.length; i++) {
                        var lesson = lessons[i];
                        var yourfileDirPath = path.join(lessonPath, lesson._id);
                        if (!fs.existsSync(yourfileDirPath)) {
                            fs.mkdirSync(yourfileDirPath);
                        }

                        var sourceFolder = path.join(baseSourceFolder, "课文");
                        var p = handleContent(lesson, sourceFolder, lessonPath);

                        pArray.push(p);
                        // break;
                    }

                    Promise.all(pArray)
                        .then(function (e) {
                            res.jsonp({
                                sucess: true
                            });
                        });
                }
            }).catch(function () {
                res.render("404.html");
            });
    });
};