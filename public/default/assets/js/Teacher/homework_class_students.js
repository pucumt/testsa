$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/Teacher/rollCallClasses?type=h";
    });
    $(".enroll-filter .btn-search")
        .on("click", function (e) {
            $('.enroll .exam-list').empty();
            loadData();
            $('.enroll-filter').addClass("hidden");
            $('.container.enroll').show();
        });
    $(".enroll .pageTitle .filter")
        .on("click", function (e) {
            $('.enroll-filter').removeClass("hidden");
            $('.container.enroll').hide();
        });

    $(".enroll-filter .glyphicon-remove-circle")
        .on("click", function (e) {
            $('.enroll-filter').addClass("hidden");
            $('.container.enroll').show();
        });

    if ($("#lessonId").val()) {
        $('.enroll-filter').addClass("hidden");
        $('.container.enroll').show();
    }
    loadFilter();
});

function loadFilter() {
    selfAjax("post", "/Teacher/book/allLessons", {
        bookId: $("#bookId").val(),
        minLesson: $("#minLesson").val(),
        maxLesson: $("#maxLesson").val()
    }).then(function (data) {
        if (data) {
            if (data.length > 0) {
                data.forEach(function (lesson) {
                    var checked = "";
                    if ($("#lessonId").val() && $("#lessonId").val() == lesson._id) {
                        checked = "checked";
                    }
                    $(".enroll-filter #name").append("<option " + checked + " value='" + lesson._id + "'>" + lesson.name + "</option>");
                });
            }
        }

        if ($("#lessonId").val()) {
            loadData();
        }
    });
};

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    selfAjax("post", "/Teacher/rollCall/studentsWithScore", {
        id: $("#id").val(),
        lesson: $("#name").val()
    }).then(function (data) {
        if (data && data.students.length > 0) {
            var d = $(document.createDocumentFragment());
            data.students.sort(function (a, b) {
                return a.mobile.localeCompare(b.mobile);
            }).forEach(function (student) {
                d.append(generateLi(student));
            });
            $selectBody.append(d);
        } else {
            $selectBody.text("没有学生！");
        }
    });
};

function generateLi(student) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    $li.data("obj", student);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);

    $infoContainer.append($('<div class=""><strong>' + student.name + '(' + student.mobile + ')' + '</strong></div>'));
    if (student.stuLesson) {
        var stuLesson = student.stuLesson;
        $infoContainer.append($('<div style="">单词:{0}({1}/{2})&nbsp;句子:{3}({4}/{5})&nbsp;课文:{6}</div>'
            .format(stuLesson.wordAve, stuLesson.wordProcess, student.wordCount, stuLesson.sentAve,
                stuLesson.sentProcess, student.sentCount, stuLesson.paragraphAve)));
    }
    return $li;
};

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/Teacher/book/lesson/" + $("#name").val() + "?classId=" + $("#id").val() + "&studentId=" + entity._id;
    //location.href = "/Teacher/book/" + $("#bookId").val() + "?classId=" + $("#id").val() + "&studentId=" + entity._id;
});