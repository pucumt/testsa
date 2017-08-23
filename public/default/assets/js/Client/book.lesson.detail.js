var recorder = new _17kouyu.IRecorder({
    id: "iRecorder", //这里为HTML节点对应的id
    appKey: "17KouyuTestAppKey",
    secretKey: "17KouyuTestSecretKey",
    mode: 2,
    onFlashLoad: function (code, message) {
        //Flash加载完成的回调，其他所有与录音机的操作必须在这个回调之后进行。
        //code值有：50000
    },
    onConnectorStatusChange: function (code, message) {
        //连接器状态发生改变时回调
        //code值有：50100, 50103, 50104, 50109
    },
    onMicStatusChange: function (code, message) {
        //麦克风状态发生改变时回调。第一次加载Flash时也会触发该回调
        //code值有：50001, 50002, 50003
    }
});
var lastRecordId;

function startRecord(word, score) {
    recorder.record({
        duration: 3000, //录音时长，单位ms
        serverParams: { //录音评分参数，具体取决于服务类型
            coreType: "word.eval",
            refText: word,
            rank: 100,
            userId: "guest"
        },
        onRecordIdGenerated: function (code, message) {
            //服务器返回唯一的ID: message.recordId
            if (message.recordId) {
                lastRecordId = message.recordId;
            }
        },
        onStart: function () { //录音开始的回调
        },
        onStop: function () { //到达指定时间，录音自动停止的回调
            getScore(lastRecordId, score);
        }
    });
};

function getScore(lastRecordId, score) {
    recorder.getScores({
        recordId: lastRecordId, //指定的录音ID
        success: function (data) { //评分获得后回调。这里可能是评分成功，或者评分出错
            //详细评分结果在 data[lastRecordId].result
            //如果没有 result字段，则表明评分超时；如果 result字段中含有
            //err 或者 error字段，则评分出错。具体出错原因为result.errID
            if (data[lastRecordId]) {
                var scoreStr = data[lastRecordId].result.overall;
                score.text(scoreStr);
                //update the score in db TBD
                var wordId = score.parents(".panel").data("obj")._id;
                setWordScore(wordId, scoreStr);
            }
        }
    });
};

function startReplay() {
    recorder.startReplay({
        recordId: lastRecordId,
        onStart: function () { //回放开始的回调
        },
        onStop: function () { //回放自动停止的回调
        }
    });
};

$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter/book/id/" + $("#bookId").val() + "?studentId=" + $("#studentId").val();
    });

    loadWord();
});

var $wordBody = $('.panel-group.wordlist');

function loadWord() {

    var filter = {
        lessonId: $('#lessonId').val(),
        studentId: $("#studentId").val()
    };
    selfAjax("post", "/book/lesson/search/content", filter, function (data) {
        if (data && data.contents.length > 0) {
            var words = data.contents.filter(function (content) {
                return content.contentType == 1;
            });
            $wordBody.append('<div class="lesson-title">单词</div>');
            var d = $(document.createDocumentFragment());
            words.forEach(function (word) {
                var scores = data.scores.filter(function (score) {
                    return score.contentId == word._id;
                });
                d.append(generatePanel(word, scores[0]));
            });
            $wordBody.append(d);

            var sentences = data.contents.filter(function (content) {
                return content.contentType == 2;
            });
            $wordBody.append('<div class="lesson-title">句子</div>');
            var d = $(document.createDocumentFragment());
            sentences.forEach(function (word) {
                var scores = data.scores.filter(function (score) {
                    return score.contentId == word._id;
                });
                d.append(generatePanel(word, scores[0]));
            });
            $wordBody.append(d);

            var contents = data.contents.filter(function (content) {
                return content.contentType == 0;
            });
            $wordBody.append('<div class="lesson-title">课文</div>');
            var d = $(document.createDocumentFragment());
            contents.forEach(function (word) {
                var scores = data.scores.filter(function (score) {
                    return score.contentId == word._id;
                });
                d.append(generatePanel(word, scores[0]));
            });
            $wordBody.append(d);
        }
    });
};

function generatePanel(word, score) {
    var panel = $('<div class="panel panel-default">\
                <div class="panel-heading" role="tab" id="headingOne">\
                    <h4 class="panel-title collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#' + word._id + '" aria-expanded="false" aria-controls="' + word._id + '">\
                        ' + word.name + '\
                    </h4>\
                </div>\
                <div id="' + word._id + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">\
                    <div class="panel-body">\
               <div>' + word.name + '</div>\
               <div><button id="btnPlay" class="btn btn-danger" type="button">播放</button>\
               <button id="btnRecord" class="btn btn-danger" type="button">录音</button>\
               <button id="btnScore" class="btn btn-danger" type="button">试听</button>\
               </div>\
                    </div>\
                </div>\
            </div>');
    panel.data("obj", word);
    if (score) {
        panel.find("#btnScore").text(score.score);
    }
    return panel;
};

{
    /*<audio controls style="vertical-align: middle; width:50px; height:34px;">\
                    <source src="horse.mp3" type="audio/mpeg">\
                    您的浏览器不支持 audio 元素。\
                    </audio>\*/
}

$wordBody.on("click", ".panel .panel-body #btnPlay", function (e) {
    var obj = e.currentTarget;

    // var entity = $(obj).data("obj");
    showAlert("play", $(obj).next());
});
$wordBody.on("click", ".panel .panel-body #btnRecord", function (e) {
    var obj = e.currentTarget;
    var word = $(obj).parents(".panel").data("obj");
    startRecord(word.name, $(obj).next());
});
$wordBody.on("click", ".panel .panel-body #btnScore", function (e) {
    // var obj = e.currentTarget;
    // var entity = $(obj).data("obj");
    showAlert("score");
});

function setWordScore(wordId, score) {
    var filter = {
        wordId: wordId,
        score: score,
        lessonId: $("#lessonId").val(),
        studentId: $("#studentId").val()
    };
    selfAjax("post", "/book/lesson/score", filter, function (data) {
        // set vidio url TBD
    });
};