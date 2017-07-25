var isNew = true;

$(document).ready(function() {
    $("#left_btnChangeClass").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    renderSearchYearDropDown(); //search orders after get years

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动 
});

function renderSearchYearDropDown() {
    selfAjax("post", "/admin/year/all", null, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(year) {
                var select = "";
                if (year.isCurrentYear) {
                    select = "selected";
                }
                $("#InfoSearch #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
            });
        };
        searchOrder();
    });
};

var $selectBody = $('.content table tbody');

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: 1,
            isPayed: true,
            yearId: $("#InfoSearch #searchYear").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollTrains.length > 0) {
            var getButtons = function(isPayed, isSucceed) {
                if (isPayed && isSucceed !== 9) { //isPayed &&
                    return '<a class="btn btn-default btnChange">调班</a>';
                }
                return '';
            };
            var d = $(document.createDocumentFragment());
            data.adminEnrollTrains.forEach(function(trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' +
                    getTrainOrderStatus(trainOrder.isSucceed) + '</td><td>' + trainOrder.studentName + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.trainPrice + '</td><td>' + trainOrder.materialPrice + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' +
                    trainOrder.realMaterialPrice + '</td><td>' + (trainOrder.rebatePrice || '') + '</td><td><div class="btn-group">' + getButtons(trainOrder.isPayed, trainOrder.isSucceed) + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", trainOrder);
                d.append($tr);
            });
            $selectBody.append(d);
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$("#InfoSearch #btnSearch").on("click", function(e) {
    searchOrder();
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    searchOrder(page);
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    searchOrder(page);
});

$("#gridBody").on("click", "td .btnChange", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/changeClassDetail/" + entity._id;
});