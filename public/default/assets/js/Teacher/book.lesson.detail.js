$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/Teacher/book/" + $("#bookId").val() + "?classId=" + $("#classId").val() + "&studentId=" + $("#studentId").val();
    });
    loadWord();
});

var $wordBody = $('.panel-group.wordlist');

function loadWord() {

    var filter = {
        lessonId: $('#lessonId').val(),
        studentId: $("#studentId").val()
    };
    selfAjax("post", "/Teacher/book/lesson/search/content", filter, function (data) {
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

$wordBody.on("click", ".panel .panel-body #btnPlay", function (e) {
    var obj = e.currentTarget;

    // var entity = $(obj).data("obj");
    showAlert("play", $(obj).next());
});

$wordBody.on("click", ".panel .panel-body #btnScore", function (e) {
    // var obj = e.currentTarget;
    // var entity = $(obj).data("obj");
    showAlert("score");
});