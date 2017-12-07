var isNew = true;

$(document).ready(function () {
    $("#left_btnRebateDetail").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#startDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });
    $("#endDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });

    $("#startDate").datepicker("setDate", new Date());
    $("#endDate").datepicker("setDate", new Date());

    renderSearchSchoolDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("get", "/admin/schoolArea/all", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (school) {
                $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
            });
        };
    });

    selfAjax("post", "/admin/classAttribute/getChecked", null, function (data) {
        if (data) {
            if (data.length > 0) {
                data.forEach(function (classAttribute) {
                    $("#InfoSearch #drpAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
                });
            } else {
                $('#InfoSearch .attribute').hide();
            }
        }
    });
};

var $selectBody = $('.content.mainModal table tbody');

function searchOrder(p) {
    var filter = {
            startDate: moment($(".mainModal #InfoSearch #startDate").val()).utcOffset(0).format("YYYY-MM-DD HH:mm:ss"),
            endDate: moment($(".mainModal #InfoSearch #endDate").val()).add(1, 'day').utcOffset(0).format("YYYY-MM-DD HH:mm:ss"),
            schoolId: $(".mainModal #InfoSearch #searchSchool").val(),
            attributeId: $("#InfoSearch #drpAttribute").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/rebateDetailList/search?" + pStr, filter, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollTrains.length > 0) {

            data.adminEnrollTrains.forEach(function (trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + moment(trainOrder.createdDate).format("YYYY-MM-DD HH:mm") + '</td><td>' +
                    trainOrder.studentName + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.schoolArea + '</td><td>' + trainOrder.rebateTotalPrice + '</td><td>' +
                    getPayway(trainOrder.rebateWay) + '</td></tr>');
                $selectBody.append($tr);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
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
//------------end