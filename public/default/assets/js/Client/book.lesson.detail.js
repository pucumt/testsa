var curAudio = new Audio(),
    log = "",
    request,
    pageData,
    rePlayAudio = new Audio(); // 音频播放器
$(document).ready(function () {
    document.oncontextmenu = function (e) {
        //或者return false;
        e.preventDefault();
    };

    document.body.addEventListener("click", function () {});

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/book/lesson/category?id={0}&studentId={1}&minLesson={2}&maxLesson={3}"
            .format($("#lessonId").val(), $("#studentId").val(), $("#minLesson").val(), $("#maxLesson").val());
    });

    getRequest();
    // -- audio functions
    curAudio.onerror = function (e) {
        if (curAudio.ctButton) {
            curAudio.ctButton.text("原声");
        }
    };

    curAudio.onpause = function (e) {
        if (curAudio.ctButton) {
            curAudio.ctButton.text("原声");
        }
    };

    rePlayAudio.onerror = function (e) {
        if (curAudio.ctButton) {
            curAudio.ctButton.text("回放");
        }
    };

    rePlayAudio.onpause = function (e) {
        if (curAudio.ctButton) {
            curAudio.ctButton.text("回放");
        }
    };
    // end -- audio functions

    // to play 原声
    $('.wordlist').on("click", ".buttons .toplay", function (e) {
        pauseAll();

        setTimeout(() => {
            var word = $(e.target).parents(".panel").data("obj");
            $(e.target).text("播放...");
            curAudio.ctButton = $(e.target);
            curAudio.src = "/uploads/books/{0}/{1}/{2}.mp3"
                .format($('#bookId').val(), $('#lessonId').val(), word._id);
            curAudio.play();
        }, 0);
    });

    // 录音
    $('.wordlist').on("touchstart", ".buttons .toRecord", function (e) {
        var panel = $(e.target).parents(".panel"),
            word = panel.data("obj");
        // pauseAll();
        if ($("#curType").val() == "0") {
            request.refText.lm = word.name;
        } else {
            request.refText = word.name;
        }

        $(e.target).text("录音...");
        // aiengine.ctButton = $(e.target);
        startRecord(word, panel);
    });

    $('.wordlist').on("touchend", ".buttons .toRecord", function (e) {
        $(e.target).text("录音");
        stopRecord();
    });

    // 回放
    $('.wordlist').on("click", ".buttons .toReplay", function (e) {
        pauseAll();

        var word = $(e.target).parents(".panel").data("obj");
        log += "回放：" + JSON.stringify(word) + "\r\n";
        $("#jsalert").val(log);
        if (word.localId) { // use wx
            if (wx) {
                wx.playVoice({
                    localId: word.localId
                });
            }
        } else if (word.score) {
            // use audio
            setTimeout(() => {
                $(e.target).text("回放...");
                rePlayAudio.ctButton = $(e.target);
                rePlayAudio.src = "/uploads/scores/{0}/{1}.mp3"
                    .format($('#studentId').val(), word.scoreId);
                rePlayAudio.play();
            }, 0);
        }
    });

    loadWord();

    $.ajax({
        url: "/signature/get", //微信官方签名方法
        type: "POST",
        data: {
            clientUrl: location.href
        },
        success: function (data) {
            log = "get sign sucess; \r\n";
            if (data.error) {
                console.log(data.error);
                log += JSON.stringify(data) + "\r\n";
                $("#jsalert").val(log);
                return;
            }
            if (!wx) {
                // wx not loaded
                return;
            }
            // data.debug = true;
            data.jsApiList = ["startRecord", "stopRecord", "uploadVoice", "playVoice", "stopVoice"]; // 
            wx.error(function (res) {
                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                console.log(res);
                log += JSON.stringify(res) + "\r\n";
                $("#jsalert").val(log);
            });
            wx.config(data); //完成接口注入权限验证配置
            aiengine.aiengine_new({
                url: "/signature/chiSign", //驰声签名方法
                serverTimeout: 30,
                success: function () {
                    console.log("sucess");
                    log += "ai new sucess \r\n";
                    $("#jsalert").val(log);
                },
                fail: function (err) {
                    console.log(err);
                    log += JSON.stringify(err) + "\r\n";
                    $("#jsalert").val(log);
                },
            });
        }
    });
});

function pauseAll() {
    curAudio.pause();
    rePlayAudio.pause();
    // stopRecord();
}
var $wordBody = $('.panel-group.wordlist'),
    $sentenceBody;

function loadWord() {
    //加载单词，句子，课文
    var filter = {
        lessonId: $('#lessonId').val(),
        studentId: $("#studentId").val(),
        contentType: $("#curType").val()
    };
    selfAjax("post", "/app/contents", filter, function (data) {
        if (data && data.length > 0) {
            if ($("#curType").val() == "1") {
                $wordBody.append('<div class="lesson-title">单词</div>');
                var d = $(document.createDocumentFragment());
                data.forEach(function (word) {
                    d.append(generatePanel(word));
                });
                $wordBody.append(d);
            }

            if ($("#curType").val() == "2") {
                $wordBody.append('<div class="lesson-title">句子</div>');
                var d = $(document.createDocumentFragment());
                data.forEach(function (word) {
                    d.append(generatePanel(word));
                });
                $wordBody.append(d);
            }

            if ($("#curType").val() == "0") {
                $wordBody.append('<div class="lesson-title">课文</div>');
                if (data[0]) {
                    pageData = data;

                    data[0].replaceName = "分数：";
                    var d = $(document.createDocumentFragment());
                    d.append(generatePanel(data[0]));
                    $wordBody.append(d);

                    $sentenceBody = $("<div class='sentence'></div>");
                    $wordBody.append($sentenceBody);

                    if (data[0].scoreResult) {
                        initParaDetails(data[0].scoreResult);
                    }
                }
            }
        }
    });
};

function generatePanel(word) {
    var panel = $('<div class="panel panel-default">\
                <div class="wordlevel">\
                    <h4 class="title mainTitle" role="button" >\
                        ' + (word.replaceName || word.name) + '&nbsp;<span class="score">' + (word.score || '') + '</span>\
                    </h4>\
                </div>\
                <div class="flex-wrp buttons">\
                    <button class="btn btn-default toplay">原声</button>\
                    <button class="btn btn-default toRecord">录音</button>\
                    <button class="btn btn-default toReplay">回放</button>\
                </div>\
            </div>');
    panel.data("obj", word);
    return panel;
};

function generateSentence(result, word) {
    var panel = $('<div class="panel panel-default">\
                <div class="wordlevel">\
                    <h4 class="title" role="button" >\
                        ' + result.text + '&nbsp;<span class="score">' + result.score + '</span>\
                    </h4>\
                </div>\
                <div class="flex-wrp buttons">\
                    <button class="btn btn-default toplay pull-right">原声</button>\
                    <button class="btn btn-default toRecord" disabled="disabled">录音</button>\
                    <button class="btn btn-default toReplay" disabled="disabled">回放</button>\
                </div>\
            </div>');
    panel.data("obj", word);
    return panel;
};

function initParaDetails(result) {
    // 段落的评测结果，通过句子的形式保留下来
    var objResult = JSON.parse(result);
    $sentenceBody.empty();
    $sentenceBody.append('<div class="lesson-title">句子</div>');
    var d = $(document.createDocumentFragment());
    for (var i = 0; i < objResult.length; i++) {
        d.append(generateSentence(objResult[i], pageData[i + 1]));
    };
    $sentenceBody.append(d);
};

function getRequest() {
    if ($("#curType").val() == "0") {
        request = {
            attachAudioUrl: 1,
            coreType: "en.pred.exam",
            rank: 100,
            refText: {　　　　
                lm: "It was Sunday.", //必填，评分参考文本
                qid: "PAPER-000005-QT-000002" //必填，考题ID　
            },
            precision: 0.5,
            client_params: {　　　　
                ext_subitem_rank4: 0　　
            }
        };
    } else {
        request = {
            attachAudioUrl: 1,
            coreType: "en.sent.score",
            rank: 100,
            refText: "want"
        };
    }
};

function startRecord(obj, panel) {
    aiengine.aiengine_start({
        isShowProgressTips: 0,
        request: request,
        success: function (res) {
            // upload score
            log += "start Record sucess:" + JSON.stringify(res) + "\r\n";
            $("#jsalert").val(log);
            obj.score = res.result.overall;
            obj.recordId = res.audioUrl;
            var sentences = ($('#curType').val() == "0" && res.result.details); // word

            initParaDetails(sentences); // show sentence score
            saveScore(obj, sentences); // save score to db

            console.log("start sucess");
            panel.find(".wordlevel .title.mainTitle .score").text(obj.score); // set score to para
        },
        fail: function (err) {
            log += "start Record fail:" + JSON.stringify(err) + "\r\n";
            $("#jsalert").val(log);
            console.log(err);
        },
        complete: function (res) {
            obj.localId = res.localId || "";
            log += "start Record complete:" + JSON.stringify(res) + "\r\n";
            $("#jsalert").val(log);
            console.log("start complete");
            hideLoading();
        }
    });
};

function stopRecord() {
    aiengine.aiengine_stop({
        success: function () {
            log += "stop Record sucess\r\n";
            $("#jsalert").val(log);
            console.log("stop sucess!");

            loading();
        },
        fail: function (err) {
            log += "stop Record fail:" + JSON.stringify(err) + "\r\n";
            $("#jsalert").val(log);
            console.log("stop failed!");
        },
    });
};

function saveScore(word, sentences) {
    //存储成绩和录音
    var filter = {
        studentId: $("#studentId").val(),
        lessonId: $("#lessonId").val(),
        wordId: word._id,
        contentType: $("#curType").val(),
        score: word.score,
        recordId: word.recordId,
        scoreResult: JSON.stringify(sentences)
    };
    selfAjax("post", "/app/score", filter, function (data) {
        // show score
    });
};