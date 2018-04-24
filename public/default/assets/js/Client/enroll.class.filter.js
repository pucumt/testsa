$(document).ready(function () {
    $("#page").val(1);

    $(".enroll .pageTitle .filter")
        .on("click", function (e) {
            $('.enroll-filter').show();
            $('.container.enroll').hide();
        });

    $(".enroll-filter .glyphicon-remove-circle")
        .on("click", function (e) {
            $(".enroll-filter").hide();
            $('.container.enroll').show();
        });

    loadData();
});

var objFilters;

var $selectBody = $('.container.enroll .exam-list');

function loadData(p) {
    var pStr = p ? "p=" + p : "",
        filter = {};
    selfAjax("post", "/enroll/class?" + pStr, filter, function (data) {
        if (data && data.classs.length > 0) {
            var d = $(document.createDocumentFragment());
            data.classs.forEach(function (trainclass) {
                d.append(generateLi(trainclass));
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

function generateLi(trainclass) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div id=' + trainclass._id + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    $li.data("obj", trainclass);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    //$goodContainer.append($countContainer);
    $infoContainer.append($('<div><h3>' + trainclass.name + '</h3></div>'));
    var isFull = trainclass.enrollCount == trainclass.totalStudentCount ? "<span class='full'>(已满)</span>" : "";
    $infoContainer.append($('<div class="enroll-info"><p class="exam-count">已报' + trainclass.enrollCount + '&nbsp;&nbsp;共' + trainclass.totalStudentCount + isFull + '</p><button type="button" class="btn btn-primary btn-xs">报名</button></div>'));
    //$infoContainer.append($('<div>' + trainclass.address + '</div>'));
    return $li;
};

$("#btnMore").on("click", function (e) {
    var page = parseInt($("#page").val()) + 1;
    loadData(page);
});

$selectBody.on("click", "li", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/enroll/class/" + entity._id;
});