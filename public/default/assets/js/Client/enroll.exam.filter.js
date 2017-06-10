$(document).ready(function() {
    loadData();
    $("#page").val(1);
});

var $selectBody = $('.container.enroll .exam-list');

function loadData(p) {
    var pStr = p ? "p=" + p : "";
    $.get("/enroll/exam?" + pStr, function(data) {
        if (data && data.examClasss.length > 0) {
            var d = $(document.createDocumentFragment());
            data.examClasss.forEach(function(examClass) {
                d.append(generateLi(examClass));
            });
            $selectBody.append(d);
            $("#btnMore").show();
        } else {
            if (!p) {
                $('.container.enroll .row').text("即将上线");
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

function generateLi(examClass) {
    // examClass.courseContent = htmlEncode(examClass.courseContent);
    var $li = $('<li class="exam-card card " ></li>'),
        $goodContainer = $('<div id=' + examClass._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info clearfix"></div>');
    $li.data("obj", examClass);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    //$goodContainer.append($countContainer);
    $infoContainer.append($('<div><h3>' + examClass.name + '</h3></div>'));
    $infoContainer.append($('<div>日期：' + moment(examClass.examDate).format("YYYY-M-D") + '&nbsp;&nbsp;时间：' + examClass.examTime + '</div>'));
    var isFull = "";
    if (moment().subtract(1, 'd').isAfter(examClass.examDate)) {
        isFull = "<span class='full'>(已过期)</span>";
    } else if (examClass.enrollCount == examClass.examCount) {
        isFull = "<span class='full'>(已满)</span>";
    }

    $infoContainer.append($('<div class="enroll-info"><p class="exam-count">已报' + examClass.enrollCount + '&nbsp;&nbsp;共' + examClass.examCount + isFull +
        '</p><span></span></div>'));
    $infoContainer.append('<div class="enroll-buttons pull-right"><button type="button" class="btn btn-primary btn-xs btnEnroll">报名</button><button type="button" class="btn btn-primary btn-xs btnExam">准考证</button><button type="button" class="btn btn-primary btn-xs btnScore">成绩</button></div>');
    //$infoContainer.append($('<div>' + examClass.address + '</div>'));
    return $li;
};

$("#btnMore").on("click", function(e) {
    var page = parseInt($("#page").val()) + 1;
    loadData(page);
});

$selectBody.on("click", "li", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/enroll/exam/" + entity._id;
});

$selectBody.on("click", "li .btnExam", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parents("li").data("obj");
    location.href = "enroll/exam/card/" + entity._id;

    e.stopPropagation();
});

$selectBody.on("click", "li .btnScore", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parents("li").data("obj");
    location.href = "enroll/exam/score/" + entity._id;

    e.stopPropagation();
});