$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/Teacher/personalCenter";
    });

    loadData();
    $(".pageTitle .title").text("选课程查作业");
});

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    selfAjax("post", "/Teacher/rollCall/classes", {}).then(function (data) {
        if (data && data.classs.length > 0) {
            var d = $(document.createDocumentFragment());
            data.classs.forEach(function (trainclass) {
                d.append(generateLi(trainclass));
            });
            $selectBody.append(d);
        } else {
            $selectBody.text("没有您的课程！");
        }
    });
};

function generateLi(trainclass) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div id=' + trainclass._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    $li.data("obj", trainclass);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);

    $infoContainer.append($('<div><h3>' + trainclass.name + '</h3></div>'));
    $infoContainer.append($('<div>上课时间：' + trainclass.courseTime + '</div>'));
    $infoContainer.append($('<div>上课地点：' + trainclass.schoolArea + (trainclass.classRoomName || ' (待定)') + '室</div>'));
    return $li;
};

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    switch ($("#type").val()) {
        case "r":
        case "s":
            location.href = "/Teacher/rollCall/students/" + entity._id + "?type=" + $("#type").val();
            break;
        case "h":
            if (entity.bookId) {
                // only redirect for class with book
                location.href = "/Teacher/homework/students/" + entity._id;
            }
            break;
    }
});