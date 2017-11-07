var isNew = true;

$(document).ready(function () {
    $("#left_btnPeopleCount").addClass("active");
    $("#InfoSearch #isSucceed").val(1);

    searchOrder();
});


var $selectBody = $('.content table tbody');

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            trainId: $("#id").val(),
            isSucceed: $("#InfoSearch #isSucceed").val(),
            orderId: $("#InfoSearch #orderId").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/search?" + pStr, filter, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollTrains.length > 0) {
            data.adminEnrollTrains.forEach(function (trainOrder) {
                var $tr = $('<tr><td class="id">' + trainOrder._id + '</td><td>' +
                    trainOrder.trainName + '</td><td>' + trainOrder.studentName + '</td><td>' + getTrainOrderStatus(trainOrder.isSucceed) +
                    '</td><td>' + moment(trainOrder.createdDate).format("YYYY-MM-DD HH:mm") + '</td><td>' + getPayway(trainOrder.payWay) + '</td></tr>');
                $selectBody.append($tr);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$("#InfoSearch #btnSearch").on("click", function (e) {
    searchOrder();
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    searchOrder(page);
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    searchOrder(page);
});