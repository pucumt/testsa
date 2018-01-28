$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter/book/id/{0}?studentId={1}&minLesson={2}&maxLesson={3}"
            .format($("#bookId").val(), $("#studentId").val(), $("#minLesson").val(), $("#maxLesson").val());
    });

    loadCategory();

    $(".row.categories").on("click", ".picker", function (e) {
        var obj = $(this).data("type");
        location.replace("/book/lesson/{0}?studentId={1}&minLesson={2}&maxLesson={3}&curType={4}"
            .format($("#lessonId").val(), $("#studentId").val(), $("#minLesson").val(), $("#maxLesson").val(), obj));
    });
});

var $categoryBody = $('.row.categories');

function loadCategory() {
    //加载单词，句子，课文
    var filter = {
        lessonId: $('#lessonId').val(),
        studentId: $("#studentId").val()
    };
    selfAjax("post", "/app/contentTypes2", filter, function (data) {
        if (data) {
            if (data.wordCount) {
                var process = "进度(" + (data.stuLesson && data.stuLesson.wordProcess || 0) + "/" + data.wordCount + ")",
                    score = (data.stuLesson && parseFloat(data.stuLesson.wordAve) || ''),
                    $word = $('<div class="picker"><div><span>单词</span><span  class="score">' + score + '</span><span class="process">' + process + '</span></div></div>');
                $categoryBody.append($word);
                $word.data("type", 1);
            }

            if (data.sentCount) {
                var process = "进度(" + (data.stuLesson && data.stuLesson.sentProcess || 0) + "/" + data.sentCount + ")",
                    score = (data.stuLesson && parseFloat(data.stuLesson.sentAve) || ''),
                    $word = $('<div class="picker"><div><span>朗诵</span><span  class="score">' + score + '</span><span class="process">' + process + '</span></div></div>');
                $categoryBody.append($word);
                $word.data("type", 2);
            }

            if (data.isPara) {
                var process = "",
                    score = (data.stuLesson && parseFloat(data.stuLesson.paragraphAve) || ''),
                    $word = $('<div class="picker"><div><span>背诵</span><span  class="score">' + score + '</span><span class="process">' + process + '</span></div></div>');
                $categoryBody.append($word);
                $word.data("type", 0);
            }
        }
    });
};