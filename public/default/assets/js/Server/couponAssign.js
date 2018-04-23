var isNew = true;

$(document).ready(function () {
    $("#left_btnCoupon").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #mobile").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/studentAccountList/search?" + pStr, filter, function (data) {
        if (data && data.studentAccounts.length > 0) {
            selfAjax("post", "/admin/couponAssignList/withoutpage/onlyaccountId", {
                couponId: $('#id').val()
            }, function (assigns) {
                data.studentAccounts.forEach(function (account) {
                    var id = account._id,
                        checked = "";
                    if (assigns.filter(function (assign) {
                            return assign.accountId == id;
                        }).length > 0) {
                        checked = "checked";
                    }
                    $mainSelectBody.append('<tr><td><input id=' + id + ' ' + checked + ' type="checkbox" name="student" value=' + id + '></td><td>' + account.name + '</td></tr>');
                });
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

$("#btnSave").on("click", function (e) {
    var obj = $('#id'),
        entity = obj.data("obj"),
        postURI = "/admin/couponAssign/assign",
        postCoupon = {
            couponId: entity._id,
            couponName: entity.name,
            gradeId: entity.gradeId,
            gradeName: entity.gradeName,
            subjectId: entity.subjectId,
            subjectName: entity.subjectName,
            reducePrice: entity.reducePrice,
            couponStartDate: entity.couponStartDate,
            couponEndDate: entity.couponEndDate
        };

    var accounts = [];
    $(":input[name='student']").each(function (index) {
        var $this = $(this);
        accounts.push({
            accountId: $this.val(),
            mobile: $this.parent().next().text(),
            checked: this.checked
        });
    });

    selfAjax("post", postURI, {
        coupon: JSON.stringify(postCoupon),
        accounts: JSON.stringify(accounts)
    }, function (data) {
        if (data && data.sucess) {
            showAlert("保存成功");
        }
    });
});

$("#btnReturn").on("click", function () {
    location.href = "/admin/couponList";
});

$("#btnBatchAssign").on("click", function () {
    location.href = "/admin/couponAssign/batchAssign/" + $('#id').val();
});