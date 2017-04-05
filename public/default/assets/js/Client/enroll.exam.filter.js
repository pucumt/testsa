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
        } else {
            if (!p) {
                $('.container.enroll .row').text("即将上线");
            }
        }
        if (data.isLastPage) {
            //已经全部加载
            $("#btnMore").text("已经到最后了");
            $("#btnMore").attr("disabled", "disabled");
        }
    });
};

function generateLi(examClass) {
    var $li = $('<li class="exam-card card " data-obj=' + JSON.stringify(examClass) + '></li>'),
        $goodContainer = $('<div id=' + examClass._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    //$countContainer = $('<div class="info-count"></div>');

    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    //$goodContainer.append($countContainer);
    $infoContainer.append($('<div><h3>' + examClass.name + '</h3></div>'));
    $infoContainer.append($('<div>日期：' + moment(examClass.examDate).format("YYYY-M-D") + '&nbsp;&nbsp;时间：' + examClass.examTime + '</div>'));
    var isFull = examClass.enrollCount == examClass.examCount ? "<span class='full'>(已满)</span>" : "";
    $infoContainer.append($('<div class="enroll-info"><p class="exam-count">已报' + examClass.enrollCount + '&nbsp;&nbsp;共' + examClass.examCount + isFull + '</p><button type="button" class="btn btn-danger btn-xs">报名</button></div>'));
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