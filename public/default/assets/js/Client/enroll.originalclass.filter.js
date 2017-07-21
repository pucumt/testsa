$(document).ready(function() {
    loadData();
});

var $selectBody = $('.container.enroll .exam-list');

function loadData() {
    selfAjax("post", "/enroll/originalOrders", { originalUrl: "/enrolloriginalclass" },
        function(data) {
            if (data) {
                if (data.notLogin) {
                    location.href = "/login";
                    return;
                }

                if (data.length > 0) {
                    renderOrders(data);
                } else {
                    $selectBody.text("没有报我们课程");
                }
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
    $infoContainer.append($('<div>开课日期：' + moment(trainclass.courseStartDate).format("YYYY-M-D") + '&nbsp;到&nbsp;' + moment(trainclass.courseEndDate).format("YYYY-M-D") + '&nbsp;共' + trainclass.totalClassCount + '课时</div>'));
    $infoContainer.append($('<div>上课时间：' + trainclass.courseTime + '</div>'));
    $infoContainer.append($('<div>上课地点：' + trainclass.schoolArea + (trainclass.classRoomName || ' (待定)') + '室</div>'));
    $infoContainer.append($('<div>培训费：' + trainclass.trainPrice + '元</div>'));
    $infoContainer.append($('<div>教材费：' + trainclass.materialPrice + '元</div>'));
    $infoContainer.append($('<div>合计：' + (trainclass.trainPrice + trainclass.materialPrice).toFixed(2) + '元</div>'));
    $infoContainer.append($('<div class="enroll-info"><button type="button" class="btn btn-primary btn-xs">报名</button></div>'));
    return $li;
};

$selectBody.on("click", "li", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/enroll/originalclass/" + entity._id;
});