var isNew = true;

$(document).ready(function () {
    $("#left_btnCoupon").addClass("active");
    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function (category) {
    var buttons = '<a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val(),
            couponId: $("#couponId").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/couponAssignList/search?" + pStr, filter, function (data) {
        if (data && data.couponAssigns.length > 0) {
            data.couponAssigns.forEach(function (coupon) {
                var $tr = $('<tr id=' + coupon._id + '><td>' + coupon.couponName + '</td><td>' +
                    coupon.mobile + '</td><td>' + moment(coupon.couponStartDate).format("YYYY-M-D") + '</td><td>' +
                    moment(coupon.couponEndDate).format("YYYY-M-D") + '</td><td>' +
                    coupon.subjectName + '</td><td>' + (coupon.isUsed ? "已使用" : "未使用") + '</td><td>' + coupon.reducePrice +
                    '</td><td><div class="btn-group">' + getButtons(coupon.category) + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", coupon);
                $mainSelectBody.append($tr);
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});

$("#mainModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    search(page);
});

$("#mainModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    search(page);
});
//------------end

$("#gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/couponAssign/delete", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});