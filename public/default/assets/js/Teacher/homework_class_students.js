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

    loadFilter();
});

function loadFilter() {
    selfAjax("post", "/Teacher/book/allLessons", {
        bookId: $("#bookId").val()
    }).then(function (data) {
        if (data) {
            if (data.length > 0) {
                data.forEach(function (lesson) {
                    $(".enroll-filter #name").append("<option value='" + lesson._id + "'>" + lesson.name + "</option>");
                });
            }
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
        $infoContainer.append($('<div style="">单词:' + stuLesson.wordAve + '(' + stuLesson.wordProcess +
            ')&nbsp;句子:' + stuLesson.sentAve + '(' + stuLesson.sentProcess + ')&nbsp;课文:' + stuLesson.paragraphAve + '</div>'));
    }
    return $li;
};

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/Teacher/book/" + $("#bookId").val() + "?classId=" + $("#id").val() + "&studentId=" + entity._id;
});