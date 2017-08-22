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

function startRecord() {
    recorder.record({
        duration: 3000, //录音时长，单位ms
        serverParams: { //录音评分参数，具体取决于服务类型
            coreType: "word.eval",
            refText: "best",
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
            getScore(lastRecordId);
        }
    });
};

function getScore(lastRecordId) {
    recorder.getScores({
        recordId: lastRecordId, //指定的录音ID
        success: function (data) { //评分获得后回调。这里可能是评分成功，或者评分出错
            //详细评分结果在 data[lastRecordId].result
            //如果没有 result字段，则表明评分超时；如果 result字段中含有
            //err 或者 error字段，则评分出错。具体出错原因为result.errID
            if (data[lastRecordId]) {
                document.getElementById("score").innerText = data[lastRecordId].result.overall;
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
    loadWord();
});

var $wordBody = $('.panel-group.wordlist');

function loadWord() {
    $wordBody.append('<div class="lesson-title">单词</div>');
    var filter = {
        lessonId: $('#lessonId').val()
    };
    selfAjax("post", "/book/lesson/search/word", filter, function (data) {
        if (data && data.words.length > 0) {
            var d = $(document.createDocumentFragment());
            data.words.forEach(function (word) {
                d.append(generatePanel(word, "accordion", "headingOne"));
            });
            $wordBody.append(d);
        }

        loadSentence();
    });
};

function loadSentence() {

    var filter = {
        lessonId: $('#lessonId').val()
    };
    selfAjax("post", "/book/lesson/search/sentence", filter, function (data) {
        $wordBody.append('<div class="lesson-title">句子</div>');
        if (data && data.sentences.length > 0) {
            var d = $(document.createDocumentFragment());
            data.sentences.forEach(function (sentence) {
                d.append(generatePanel(sentence, "accordion", "headingOne"));
            });
            $wordBody.append(d);
        }
        loadContent();
    });
};

function loadContent() {
    var filter = {
        lessonId: $('#lessonId').val()
    };
    selfAjax("post", "/book/lesson/search/content", filter, function (data) {
        $wordBody.append('<div class="lesson-title">课文</div>');
        if (data && data.content) {
            var d = $(document.createDocumentFragment());
            d.append(generatePanel(data.content, "accordion", "headingOne"));
            $wordBody.append(d);
        }
    });
};

function generatePanel(word, id, head) {
    return $('<div class="panel panel-default">\
                <div class="panel-heading" role="tab" id="' + head + '">\
                    <h4 class="panel-title collapsed" role="button" data-toggle="collapse" data-parent="#' + id + '" href="#' + word._id + '" aria-expanded="false" aria-controls="' + word._id + '">\
                        ' + word.name + '\
                    </h4>\
                </div>\
                <div id="' + word._id + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="' + head + '">\
                    <div class="panel-body">\
               <div>' + word.name + '</div>\
               <div><button id="btnPlay" class="btn btn-danger" type="button">播放</button>\
               <button id="btnRecord" class="btn btn-danger" type="button">录音</button>\
               <button id="btnScore" class="btn btn-danger" type="button">试听</button>\
               </div>\
                    </div>\
                </div>\
            </div>');
};

$wordBody.on("click", ".panel .panel-body #btnPlay", function (e) {
    // var obj = e.currentTarget;
    // var entity = $(obj).data("obj");
    showAlert("play");
});
$wordBody.on("click", ".panel .panel-body #btnRecord", function (e) {
    // var obj = e.currentTarget;
    // var entity = $(obj).data("obj");
    showAlert("record");
});
$wordBody.on("click", ".panel .panel-body #btnScore", function (e) {
    // var obj = e.currentTarget;
    // var entity = $(obj).data("obj");
    showAlert("score");
});