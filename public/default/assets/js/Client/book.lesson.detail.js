var audioUrl = new Array();

$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/book/lesson/category?id={0}&studentId={1}&minLesson={2}&maxLesson={3}"
            .format($("#lessonId").val(), $("#studentId").val(), $("#minLesson").val(), $("#maxLesson").val());
    });

    // var curAudio = new Audio("http://www.w3school.com.cn/i/song.mp3");
    // $('.btnPlay').click(function (e) {
    //     curAudio.play();
    // });

    // $('.btnPause').click(function (e) {
    //     curAudio.pause();
    // });

    loadWord();

    $.ajax({
        url: "/signature/get", //微信官方签名方法
        type: "POST",
        data: {
            clientUrl: location.href
        },
        success: function (data) {
            if (data.error) {
                console.log(data.error);
                return;
            }
            data.debug = true;
            data.jsApiList = ["startRecord", "stopRecord", "uploadVoice", "playVoice", "stopVoice"]; // 
            wx.error(function (res) {
                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                console.log(res);
            });
            wx.config(data); //完成接口注入权限验证配置
            aiengine.aiengine_new({
                url: "/signature/chiSign", //驰声签名方法
                serverTimeout: 30,
                success: function () {
                    console.log("sucess");
                },
                fail: function (err) {
                    console.log(err);
                },
            });
        }
    });
});

var $wordBody = $('.panel-group.wordlist');

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
                    data[0].replaceName = "分数：";
                    var d = $(document.createDocumentFragment());
                    d.append(generatePanel(data[0]));
                    $wordBody.append(d);
                }
            }
        }
    });
};

function generatePanel(word) {
    var panel = $('<div class="panel panel-default">\
                <div class="wordlevel">\
                    <h4 class="title" role="button" >\
                        ' + (word.replaceName || word.name) + '&nbsp;<span class="score">' + (word.score || '') + '</span>\
                    </h4>\
                </div>\
                <div  class="flex-wrp buttons">\
                    <button class="btn btn-default" bindtap="toplay">原声</button>\
                    <button class="btn btn-default" bindtap="toRecord">录音</button>\
                    <button class="btn btn-default" bindtap="toReplay">回放</button>\
                </div>\
            </div>');
    panel.data("obj", word);
    return panel;
};

// function generateContentPanel(word, score) {
//     var panel = $('<div class="panel panel-default">\
//                 <div class="panel-heading" role="tab" id="headingOne">\
//                     <h4 class="panel-title collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#' + word._id + '" aria-expanded="false" aria-controls="' + word._id + '">\
//                     课文背诵&nbsp;<span class="score">' + (score && score.score && '({0})'.format(score.score) || '') + '</span>\
//                     </h4>\
//                 </div>\
//                 <div id="' + word._id + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">\
//                     <div class="panel-body">\
//                         <div id="panelContainer">\
//                         </div>\
//                     </div>\
//                 </div>\
//             </div>');
//     panel.data("obj", word);
//     if (score) {
//         word.score = score.score;
//         word.scoreId = score._id;
//     }
//     return panel;
// };

// var coreType = function (content) {
//     switch (content.contentType) {
//         case 0: //课文
//             return "para.eval";
//         case 1: //单词
//             return "word.eval";
//         case 2: //句子
//             return "sent.eval";
//     }
// };

// function setWordScore(wordId, contentType, score, recordId) {
//     //存储成绩和录音
//     var filter = {
//         wordId: wordId,
//         score: score,
//         recordId: recordId,
//         contentType: contentType,
//         lessonId: $("#lessonId").val(),
//         studentId: $("#studentId").val()
//     };
//     selfAjax("post", "/book/lesson/score", filter, function (data) {
//         // set vidio url TBD
//     });
// };