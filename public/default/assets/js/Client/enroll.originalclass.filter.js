$(document).ready(function() {
    loadData();

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalcenter";
    });
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
                if (data.error) {
                    $selectBody.text(data.error);
                    return;
                }

                if (data.orders.length > 0) {
                    renderOrders(data.orders, data.isSwitch);
                } else {
                    $selectBody.text("没有报我们课程");
                }
            }
        });
};

function renderOrders(data, isSwitch) {
    var d = $(document.createDocumentFragment());
    data.forEach(function(order) {
        d.append(generateLi(order, isSwitch));
    });
    $selectBody.append(d);
};

function getButtons(isSwitch) {
    var strButtons = '<button type="button" id="btnOriginal" class="btn btn-primary btn-xs">原班报名</button>';
    if (isSwitch) {
        strButtons += '<button type="button" id="btnChange" class="btn btn-primary btn-xs">调班报名</button>';
    }
    return strButtons;
};

function generateLi(order, isSwitch) {
    var $li = $('<li class="exam-card card" ></li>'),
        $goodContainer = $('<div id=' + order.trainId + ' class="exam link"></div>'),
        $infoContainer = $('<div class="exam-info"></div>');
    $li.data("obj", order);
    $li.append($goodContainer);
    $goodContainer.append($infoContainer);
    $infoContainer.append($('<div><h3>学员：' + order.studentName + '</h3></div>'));
    $infoContainer.append($('<div><h3>' + order.trainName + '</h3></div>'));
    $infoContainer.append($('<div class="enroll-info">' + getButtons(isSwitch) + '</div>'));
    return $li;
};

$selectBody.on("click", "li #btnOriginal", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parents("li").data("obj");
    location.href = "/enroll/originalclass/classes/" + entity.trainId + "/student/" + entity.studentId;
});

$selectBody.on("click", "li #btnChange", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parents("li").data("obj");
    location.href = "/enroll/originalclass/switch/" + entity.orderId;
});