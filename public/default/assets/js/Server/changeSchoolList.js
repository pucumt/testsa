var isNew = true;

$(document).ready(function () {
    $("#left_btnChangeSchool").addClass("active");

    searchOrder();
});

//------------search funfunction
var $selectBody = $('.content.mainModal table tbody');

function searchOrder(p) {
    var pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/changeSchoolList/search?" + pStr, null, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollTrains.length > 0) {

            data.adminEnrollTrains.forEach(function (trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + moment(trainOrder.deletedDate).format("YYYY-MM-DD HH:mm") + '</td><td>' +
                    trainOrder.studentName + '</td><td>' + trainOrder.schoolArea + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.totalPrice + '</td><td>' + trainOrder.realMaterialPrice + '</td><td>' +
                    getPayway(trainOrder.payWay) + '</td></tr>');
                $selectBody.append($tr);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    searchOrder(page);
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    searchOrder(page);
});
//------------end