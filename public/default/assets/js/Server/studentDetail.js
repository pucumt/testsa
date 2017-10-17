var isNew = true;

$(document).ready(function () {
    $("#left_btnStudent").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    renderStudent();
    addValidation();
    renderGrids();
});

/***----------studentInfo------------ */
function resetDropDown(id) {
    $('#studentInfo').find("#grade option").remove();
    selfAjax("get", "/admin/grade/getAll", null, function (data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function (grade) {
                    var select = "";
                    if (grade._id == id) {
                        select = "selected";
                    }
                    $("#studentInfo #grade").append("<option " + select + " value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
        }
    });
};

function renderStudent() {
    var id = $("#id").val();
    selfAjax("get", "/admin/studentInfo/" + id, null, function (data) {
        if (data) {
            $("#studentInfo #studentName").val(data.name);
            $("#studentInfo #mobile").val(data.mobile);
            $("#studentInfo #studentNo").val(data.studentNo);
            $("#studentInfo #sex").val(data.sex ? 1 : 0);
            resetDropDown(data.gradeId);
            renderAccount(data.accountId);
            $("#accountId").val(data.accountId);
            $("#studentInfo #discount").val(data.discount);
            $("#studentInfo #School").val(data.School);
            $("#studentInfo #className").val(data.className);
            $("#studentInfo #address").val(data.address);
        }
    });
};

function renderAccount(id) {
    selfAjax("get", "/admin/studentAccount/" + id, null, function (data) {
        if (data) {
            $(".mainModal .panel-heading .account").text(data.name);
        }
    });
};

function addValidation() {
    $('#studentInfo').formValidation({
        // List of fields and their validation rules
        fields: {
            'studentName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '姓名不能为空'
                    }
                }
            },
            'mobile': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '手机号不能为空'
                    },
                    stringLength: {
                        min: 11,
                        message: '手机号必须是11位'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            }
        }
    });
};

$("#studentInfo #btnSave").on("click", function (e) {
    var validator = $('#studentInfo').data('formValidation').validate();
    if (validator.isValid()) {
        showConfirm("真的要保存" + $('#studentInfo #studentName').val() + "吗？");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            var postURI = "/admin/studentInfo/edit",
                postObj = {
                    name: $('#studentInfo #studentName').val(),
                    mobile: $('#studentInfo #mobile').val(),
                    studentNo: $('#studentInfo #studentNo').val(),
                    sex: $('#studentInfo #sex').val(),
                    School: $('#studentInfo #School').val(),
                    className: $("#studentInfo #className").val(),
                    address: $('#studentInfo #address').val(),
                    discount: $('#studentInfo #discount').val(),
                    id: $('#id').val(),
                    accountId: $("#accountId").val(),
                    gradeId: $('#studentInfo #grade').val(),
                    gradeName: $('#studentInfo #grade').find("option:selected").text(),
                };
            selfAjax("post", postURI, postObj, function (data) {
                if (data.error) {
                    showAlert(data.error);
                } else {
                    showAlert("保存成功");
                }
            });
        });
    }
});

$("#studentInfo #btnDelete").on("click", function (e) {
    showConfirm("真的要删除" + $('#studentInfo #studentName').val() + "吗？");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/studentInfo/delete", {
            id: $('#id').val()
        }, function (data) {
            if (data.sucess) {
                showAlert("删除成功", null, true);
                $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                    location.href = "/admin/studentsList";
                });
            }
        });
    });
});
/***----------studentInfo end------------ */

//------------search funfunction-----------
var $classSelectBody = $('.content .classModal table tbody');
var $examSelectBody = $('.content .examModal table tbody');
var $couponSelectBody = $('.content .couponModal table tbody');

function renderGrids() {
    searchClass();
    setPaingNextPre(".classModal", searchClass);

    searchExam();
    setPaingNextPre(".examModal", searchExam);

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
                $classSelectBody.append('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' + (trainOrder.fromId || "") + '</td><td>' + trainOrder.studentName +
                    '</td><td>' + trainOrder.trainName + '</td><td>' + trainOrder.yearName + '</td><td>' + trainOrder.totalPrice + '</td><td>' +
                    trainOrder.realMaterialPrice + '</td><td>' + (trainOrder.rebatePrice || "") + '</td><td>' + getPayway(trainOrder.payWay) +
                    '</td><td>' + getTrainOrderStatus(trainOrder.isSucceed) + '</td></tr>');
            });
        }
        $(".classModal #total").val(data.total);
        $(".classModal #page").val(data.page);
        setPaging(".classModal", data);
    });
};

function searchExam(p) {
    var filter = {
            studentId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $examSelectBody.empty();
    selfAjax("post", "/admin/adminEnrollExam/search?" + pStr, filter, function (data) {
        if (data && data.adminEnrollExams.length > 0) {
            data.adminEnrollExams.forEach(function (examOrder) {
                var button = (examOrder.isSucceed == 1 ? '<a id="btnDelete" class="btn btn-default">取消</a><a id="btnChange" class="btn btn-default">更新学生</a>' : '');
                var $tr = $('<tr id=' + examOrder._id + '><td>' + examOrder._id + '</td><td>' + examOrder.studentName +
                    '</td><td>' + examOrder.examName + '</td><td>' + getTrainOrderStatus(examOrder.isSucceed) +
                    '</td><td><div class="btn-group">' + button + '</div></td></tr>');
                $tr.data("obj", examOrder);
                $examSelectBody.append($tr);
            });
        }
        $(".examModal #total").val(data.total);
        $(".examModal #page").val(data.page);
        setPaging(".examModal", data);
    });
};

$('.content .examModal table tbody').on("click", "td #btnDelete", function (e) {
    var obj = e.currentTarget;
    $(obj).attr("disabled", "disabled");
    var entity = $(obj).parents("tr").data("obj");
    showConfirm("确定要取消订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/adminEnrollExam/cancel", {
            id: entity._id,
            examId: entity.examId,
            examAreaId: entity.examAreaId
        }, function (data) {
            if (data.sucess) {
                showAlert("删除成功", null, true);
                $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                    location.href = "/admin/studentDetail/" + $('#id').val();
                });
            }
            $(obj).removeAttr("disabled");
        });
    });
    e.stopPropagation();
});

$('.content .examModal table tbody').on("click", "td #btnChange", function (e) {
    var obj = e.currentTarget;
    $(obj).attr("disabled", "disabled");
    var entity = $(obj).parents("tr").data("obj");
    showConfirm("确定要更新订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/adminEnrollExam/changeStudent", {
            id: entity._id,
            studentId: $('#id').val(),
            studentName: $('#studentName').val()
        }, function (data) {
            if (data.sucess) {
                showAlert("修改成功", null, true);
                $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                    location.href = "/admin/studentDetail/" + $('#id').val();
                });
            }
            $(obj).removeAttr("disabled");
        });
    });
    e.stopPropagation();
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
                    '</td><td>' + coupon.gradeName + '</td><td>' + coupon.subjectName + '</td><td>' + (coupon.isUsed ? "已使用" : "未使用") + '</td><td>' + coupon.reducePrice + '</td></tr>');
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


$(".examModal #gridBody").on("click", "tr", function (e) {
    //need change later
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/admin/studentScore/" + entity._id + "/student";
    ///admin/studentDetail/58f594230530d0093e13f36
});