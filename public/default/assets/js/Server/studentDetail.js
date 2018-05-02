var isNew = true;

$(document).ready(function () {
    $("#left_btnStudent").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    renderAccount();
    renderGrids();
});

/***----------studentInfo------------ */
function renderAccount() {
    selfAjax("get", "/admin/studentAccount/" + $("#id").val(), null, function (data) {
        if (data) {
            $(".mainModal .panel-heading .account").text(data.name);
        }
    });
};
/***----------studentInfo end------------ */

//------------search funfunction-----------
var $classSelectBody = $('.content .classModal table tbody');
var $examSelectBody = $('.content .examModal table tbody');
var $couponSelectBody = $('.content .couponModal table tbody');

function renderGrids() {
    searchClass();
    setPaingNextPre(".classModal", searchClass);

    searchStudents();
    setPaingNextPre(".examModal", searchStudents);

    searchCoupon();
    setPaingNextPre(".couponModal", searchCoupon);
};

function searchClass(p) {
    var filter = {
            studentId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $classSelectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/search?" + pStr, filter, function (data) {
        if (data && data.adminEnrollTrains.length > 0) {
            data.adminEnrollTrains.forEach(function (trainOrder) {
                $classSelectBody.append('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.totalPrice + '</td><td>' + (trainOrder.rebatePrice || "") + '</td><td>' + getPayway(trainOrder.payWay) +
                    '</td><td>' + getTrainOrderStatus(trainOrder.isSucceed) + '</td></tr>');
            });
        }
        $(".classModal #total").val(data.total);
        $(".classModal #page").val(data.page);
        setPaging(".classModal", data);
    });
};

function searchStudents(p) {
    var filter = {
            accountId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $examSelectBody.empty();
    selfAjax("post", "/admin/studentInfo/search?" + pStr, filter, function (data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function (studentInfo) {
                var $tr = $('<tr id=' + studentInfo._id + '><td>' + studentInfo.name + '</td><td>' + studentInfo.mobile +
                    '</td><td><div class="btn-group"><a id="btnDelete" class="btn btn-default">取消</a></div></td></tr>');
                $tr.data("obj", studentInfo);
                $examSelectBody.append($tr);
            });
        }
        $(".examModal #total").val(data.total);
        $(".examModal #page").val(data.page);
        setPaging(".examModal", data);
    });
};

$('.content .examModal table tbody').on("click", "td #btnDelete", function (e) {

});

function searchCoupon(p) {
    var filter = {
            studentId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $couponSelectBody.empty();
    selfAjax("post", "/admin/couponAssignList/search?" + pStr, filter, function (data) {
        if (data && data.couponAssigns.length > 0) {
            data.couponAssigns.forEach(function (coupon) {
                var dateStr = moment(coupon.couponStartDate).format("YYYY-M-D") + " - " + moment(coupon.couponEndDate).format("YYYY-M-D");
                $couponSelectBody.append('<tr id=' + coupon._id + '><td>' + coupon.couponName + '</td><td>' + dateStr +
                    '</td><td>' + coupon.subjectName + '</td><td>' + (coupon.isUsed ? "已使用" : "未使用") + '</td><td>' + coupon.reducePrice + '</td></tr>');
            });
        }
        $(".couponModal #total").val(data.total);
        $(".couponModal #page").val(data.page);
        setPaging(".couponModal", data);
    });
};

function setPaingNextPre(modal, searchFuc) {
    $(modal + " .paging .prepage").off("click").on("click", function (e) {
        var page = parseInt($(modal + " #page").val()) - 1;
        searchFuc(page);
    });

    $(modal + " .paging .nextpage").off("click").on("click", function (e) {
        var page = parseInt($(modal + " #page").val()) + 1;
        searchFuc(page);
    });
};
//------------end------------