$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter/order";
    });

    $("#page").val(1);
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

    loadData();
});

var $selectBody = $('.container.enroll .exam-list');

function loadData(p) {
    var pStr = p ? "p=" + p : "",
        filter = {
            bookId: $('#bookId').val(),
            name: $('.enroll-filter #name').val(),
            minLesson: $("#minLesson").val(),
            maxLesson: $("#maxLesson").val()
        };
    selfAjax("post", "/book/lessons?" + pStr, filter, function (data) {
        if (data && data.lessons.length > 0) {
            var d = $(document.createDocumentFragment());
            data.lessons.forEach(function (lesson) {
                d.append(generateLi(lesson));
            });
            $selectBody.append(d);
            $("#btnMore").show();
        } else {
            if (!p) {
                $selectBody.text("即将上线");
                $("#btnMore").hide();
                return;
            }
        }
        if (data.isLastPage) {
            //已经全部加载
            $("#btnMore").text("已经到最后了");
            $("#btnMore").attr("disabled", "disabled");
        }
        if (p) {
            $("#page").val(p);
        }
    });
};

function generateLi(lesson) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div id=' + lesson._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    $li.data("obj", lesson);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    $infoContainer.append($('<div><h3>' + lesson.name + '</h3></div>'));
    return $li;
};

$("#btnMore").on("click", function (e) {
    var page = parseInt($("#page").val()) + 1;
    loadData(page);
});

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/book/lesson/{0}?studentId={1}&minLesson={2}&maxLesson={3}"
        .format(entity._id, $("#studentId").val(), $("#minLesson").val(), $("#maxLesson").val());
});