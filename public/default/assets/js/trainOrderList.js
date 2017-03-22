var isNew = true;

$(document).ready(function() {
    $("#btnTrainOrder").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder();
});

var $selectBody = $('.content table tbody');

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: $("#InfoSearch #isSucceed").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    $.post("/admin/adminEnrollTrain/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollTrains.length > 0) {
            data.adminEnrollTrains.forEach(function(trainOrder) {
                $selectBody.append('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' +
                    trainOrder.studentName + '</td><td>' + trainOrder.trainName + '</td><td>' +
                    trainOrder.trainPrice + '</td><td>' + trainOrder.materialPrice + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' + (trainOrder.isPayed ? "是" : "否") + '</td><td><div data-obj=' +
                    JSON.stringify(trainOrder) + ' class="btn-group"><a class="btn btn-default btnDelete">取消</a></div></td></tr>');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging(data);
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