var isNew = true;

$(document).ready(function () {
    $("#left_btnCoupon").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#couponStartDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });

    $("#couponEndDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function (coupon) {
    var assignButton = "";
    switch (coupon.category) {
        case "随机":
            if (coupon.isPublished) {
                assignButton = '<a class="btn btn-default btnUnPublish">停用</a>';
            } else {
                assignButton = '<a class="btn btn-default btnPublish">发布</a>';
            }
            break;
        case "固定":
            assignButton = '<a class="btn btn-default btnAssign">分配</a>';
            break;
        default:
            break;
    }
    if (category) {}
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnCheck">查看</a><a class="btn btn-default btnDelete">删除</a>' + assignButton;
    return buttons;
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/couponList/search?" + pStr, filter, function (data) {
        if (data && data.coupons.length > 0) {
            data.coupons.forEach(function (coupon) {
                var $tr = $('<tr id=' + coupon._id + '><td>' + coupon.name + '</td><td>' +
                    coupon.categoryName + '</td><td>' + moment(coupon.couponStartDate).format("YYYY-M-D") + '</td><td>' +
                    moment(coupon.couponEndDate).format("YYYY-M-D") + '</td><td>' + coupon.reducePrice + '</td><td>' + coupon.reduceMax + '</td><td><div class="btn-group">' + getButtons(coupon) + '</div></td></tr>');
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

function refresh() {
    var page = parseInt($("#mainModal #page").val());
    search(page);
}
//------------end

function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation(callback) {
    setTimeout(function () {
        $('#myModal').formValidation({
            declarative: false,
            // List of fields and their validation rules
            fields: {
                'name': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '优惠券不能为空'
                        },
                        stringLength: {
                            max: 30,
                            message: '优惠券最多30个字符'
                        }
                    }
                },
                'couponStartDate': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '开始日期不能为空'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: '不是有效的日期格式'
                        }
                    }
                },
                'couponEndDate': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '过期日期不能为空'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: '不是有效的日期格式'
                        }
                    }
                }
            }
        });
    }, 0);
};

$("#btnAdd").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#myModal #name').removeAttr("disabled");
    $('#myModal #myModalLabel').text("新增优惠券");
    $('#myModal #name').val("");
    $('#myModal #category').val("固定");
    $('#myModal #couponStartDate').val(moment().format("YYYY-M-D"));
    $('#myModal #couponEndDate').val(moment().format("YYYY-M-D"));
    $('#myModal #reducePrice').val(0);
    $("#myModal #reduceMax").val(0);
    resetDropDown();
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    $("#myModal .reduceMax").hide();
});

$("#btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/coupon/add",
            postObj = {
                name: $('#name').val(),
                category: $('#myModal #category').val(),
                categoryName: $('#myModal #category').find("option:selected").text(),
                couponStartDate: $('#myModal #couponStartDate').val(),
                couponEndDate: $('#myModal #couponEndDate').val(),
                subjects: JSON.stringify(getAllCheckedSubjects()),
                reducePrice: $('#myModal #reducePrice').val(),
                reduceMax: ($('#myModal #category').val() == "随机" ? $("#myModal #reduceMax").val() : 0)
            };
        if (!isNew) {
            postURI = "/admin/coupon/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function (data) {
            $('#myModal').modal('hide');
            refresh();
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModalLabel').text("修改优惠券");
    $('#myModal #name').val(entity.name);
    $('#myModal #couponStartDate').val(moment(entity.couponStartDate).format("YYYY-M-D"));
    $('#myModal #couponEndDate').val(moment(entity.couponEndDate).format("YYYY-M-D"));
    $('#id').val(entity._id);
    $('#myModal #reducePrice').val(entity.reducePrice);
    $("#myModal #reduceMax").val(entity.reduceMax);
    $("#myModal #category").val(entity.category);

    resetDropDown(entity._id);

    if (entity.category = "固定") {
        $("#myModal .reduceMax").hide();
    } else {
        $("#myModal .reduceMax").show();
    }
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/coupon/delete", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                refresh();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnPublish", function (e) {
    showConfirm("确定要发布吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/coupon/publish", {
            id: entity._id
        }, function (data) {
            if (data.sucess) {
                showAlert("发布成功！");
                refresh();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnUnPublish", function (e) {
    showConfirm("确定要停用吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/coupon/unpublish", {
            id: entity._id
        }, function (data) {
            if (data.sucess) {
                showAlert("停用成功！");
                refresh();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnAssign", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/couponAssign/" + entity._id;
});

$("#gridBody").on("click", "td .btnCheck", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/couponAssignList/" + entity._id;
});

/**---------------dropdowns------------------- */
function resetDropDown(entityId) {
    $('#myModal').find(".subject").empty();
    selfAjax("post", "/admin/coupon/couponSubjectAndSubjects", {
        id: entityId
    }, function (data) {
        if (data) {
            if (data && data.subjects.length > 0) {
                data.subjects.forEach(function (subject) {
                    var select = "";
                    if (data.couponSubjects && data.couponSubjects.some(function (entity) {
                            return entity.subjectId == subject._id;
                        })) {
                        select = "checked";
                    }
                    $("#myModal .subject").append('<label class="checkbox-inline"><input type="checkbox" id=' + subject._id + ' ' + select + ' value=' + subject.name + '> ' + subject.name + '</label>');
                });
            }
        }
    });
};
/**---------------dropdowns - end------------------- */
$("#myModal #category").on("change blur", function () {
    if ($("#myModal #category").val() == "随机") {
        $("#myModal .reduceMax").show();
    } else {
        $("#myModal .reduceMax").hide();
    }
});

function getAllCheckedSubjects() {
    var subjects = [];
    $("#myModal .subject .checkbox-inline input").each(function (index) {
        if (this.checked) {
            subjects.push({
                subjectId: $(this).attr("id"),
                subjectName: $(this).val()
            });
        }
    });
    return subjects;
};