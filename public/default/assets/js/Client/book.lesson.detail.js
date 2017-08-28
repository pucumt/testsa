window.iPanel = new _17kouyu.IPanel({
    mode: 2,
    appKey: "17KouyuTestAppKey",
    secretKey: "17KouyuTestSecretKey",
    //showFlash:false,
    data: {
        audioUrl: "", //标准音频URL
        //duration: 5000, //传入参数手动设置录音时长
        serverParams: { // 录音服务参数
            coreType: "sent.eval", // 选择内核sent.eval
            refText: "Where are you from", // 参考文本
            attachAudioUrl: 1, // 获取音频下载地址
            userId: "guest" // 用户id
        }
    },
    onBeforeRecord: function () { // 录音之前需要清除评分，可以在这里设置录音参数
        $("#iPanel").find(".replay").text("");
        $("#iPanel").find(".replay").append('<i class="fa bigger-160"></i>');
    },
    onScore: function (data) { // 评分成功需要显示评分结果
        var resultObj = new _17kouyu.SentEval(data),
            score = resultObj.getOverall();
        $("#iPanel").find(".replay").text(score);
        var content = $("#iPanel").parents(".panel").data("obj");
        content.score = score;
        setWordScore(content._id, score, data.recordId);
        //http://records.17kouyu.com/59a3807ccd5d44b5760be251.mp3//data.recordId
    },
    onScoreError: function (errorType) { //评分失败的显示 "TIMEOUT", "NO_DATA", ErrorID
        var errorObj = _17kouyu.IStatusCode.get(errorType, "cn");
        alert(errorObj.feedback);
    }
});

$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter/book/id/" + $("#bookId").val() + "?studentId=" + $("#studentId").val();
    });

    loadWord();
});

var $wordBody = $('.panel-group.wordlist');

function loadWord() {
    //加载单词，句子，课文
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
                        <div id="panelContainer">\
                        </div>\
                    </div>\
                </div>\
            </div>');
    panel.data("obj", word);
    if (score) {
        word.score = score.score;
    }
    return panel;
};

var coreType = function (content) {
    switch (content.contentType) {
        case 0: //课文
            return "para.eval";
        case 1: //单词
            return "word.eval";
        case 2: //句子
            return "sent.eval";
    }
};

$wordBody.on('show.bs.collapse', function (e) {
    $("#iPanel").removeClass("hidden");

    var obj = $(e.target),
        content = obj.parent().data("obj");
    obj.find("#panelContainer").append($("#iPanel"));
    iPanel.setData({
        audioUrl: "https://localhost:2370/uploads/books/5998e8646872c7389c34de12/" + $('#lessonId').val() + "/" + content._id + ".mp3",
        serverParams: {
            coreType: coreType(content),
            refText: content.name,
            userId: "guest"
        }
    });

    if (content.score || content.score == 0) {
        $("#iPanel").find(".replay").text(content.score);
        $("#iPanel").find(".replay").removeClass("replayDisabled").addClass("replayOff");
    } else {
        $("#iPanel").find(".replay").append('<i class="fa bigger-160"></i>');
    }
});

function setWordScore(wordId, score, recordId) {
    //存储成绩和录音
    var filter = {
        wordId: wordId,
        score: score,
        recordId: recordId,
        lessonId: $("#lessonId").val(),
        studentId: $("#studentId").val()
    };
    selfAjax("post", "/book/lesson/score", filter, function (data) {
        // set vidio url TBD
    });
};