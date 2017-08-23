$(document).ready(function () {
    loadData();

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/Teacher/rollCallClasses?type=h";
    });
});

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    selfAjax("post", "/Teacher/rollCall/students", {
        id: $("#id").val()
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

    $infoContainer.append($('<div class="checkbox"><label>' + student.name + '(' + student.mobile + ')' + '</label></div>'));
    return $li;
};

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/Teacher/book/" + $("#bookId").val() + "?classId=" + $("#id").val() + "&studentId=" + entity._id;
});