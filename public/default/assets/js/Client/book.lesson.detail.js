$(document).ready(function () {
    loadWord();
    loadSentence();
    loadContent();
});

var $wordBody = $('.panel-group.wordlist');
var $sentenceBody = $('.panel-group.sentencelist');
var $contentBody = $('.panel-group.content');

function loadWord() {
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
    });
};

function loadSentence() {
    var filter = {
        lessonId: $('#lessonId').val()
    };
    selfAjax("post", "/book/lesson/search/sentence", filter, function (data) {
        if (data && data.sentences.length > 0) {
            var d = $(document.createDocumentFragment());
            data.sentences.forEach(function (sentence) {
                d.append(generatePanel(sentence, "accordion2", "headingTwo"));
            });
            $sentenceBody.append(d);
        }
    });
};

function loadContent() {
    var filter = {
        lessonId: $('#lessonId').val()
    };
    selfAjax("post", "/book/lesson/search/content", filter, function (data) {
        if (data && data.content) {
            var d = $(document.createDocumentFragment());
            d.append(generatePanel(data.content, "accordion3", "headingThree"));
            $contentBody.append(d);
        }
    });
};

function generatePanel(word, id, head) {
    return $('<div class="panel panel-default">\
                <div class="panel-heading" role="tab" id="' + head + '">\
                    <h4 class="panel-title">\
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#' + id + '" href="#' + word._id + '" aria-expanded="false" aria-controls="' + word._id + '">' + word.name + '</a>\
                    </h4>\
                </div>\
                <div id="' + word._id + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="' + head + '">\
                    <div class="panel-body">\
               ' + word.name + '\
                    </div>\
                </div>\
            </div>');
};