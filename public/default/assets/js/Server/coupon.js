var isNew = true;

$(document).ready(function() {
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
var getButtons = function(coupon) {
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
    $.post("/admin/couponList/search?" + pStr, filter, function(data) {
        if (data && data.coupons.length > 0) {
            data.coupons.forEach(function(coupon) {
                $mainSelectBody.append('<tr id=' + coupon._id + '><td>' + coupon.name + '</td><td>' +
                    coupon.categoryName + '</td><td>' + moment(coupon.couponStartDate).format("YYYY-M-D") + '</td><td>' +
                    moment(coupon.couponEndDate).format("YYYY-M-D") + '</td><td>' + coupon.gradeName + '</td><td>' +
                    coupon.subjectName + '</td><td>' + coupon.reducePrice + '</td><td>' + coupon.reduceMax + '</td><td><div data-obj=' +
                    JSON.stringify(coupon) + ' class="btn-group">' + getButtons(coupon) + '</div></td></tr>');
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    search(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    search(page);
});
//------------end

function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation(callback) {
    setTimeout(function() {
        $('#myModal').formValidation({
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

$("#btnAdd").on("click", function(e) {
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
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
    $("#myModal .reduceMax").hide();
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/coupon/add",
            postObj = {
                name: $('#name').val(),
                category: $('#myModal #category').val(),
                categoryName: $('#myModal #category').find("option:selected").text(),
                couponStartDate: $('#myModal #couponStartDate').val(),
                couponEndDate: $('#myModal #couponEndDate').val(),
                gradeId: $('#grade').val(),
                gradeName: $('#grade').find("option:selected").text(),
                subjectId: $('#subject').val(),
                subjectName: $('#subject').find("option:selected").text(),
                reducePrice: $('#myModal #reducePrice').val(),
                reduceMax: ($('#myModal #category').val() == "随机" ? $("#myModal #reduceMax").val() : 0)
            };
        if (!isNew) {
            postURI = "/admin/coupon/edit";
            postObj.id = $('#id').val();
        }
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            if (isNew) {
                $('#gridBody').append($("<tr id=" + data._id + "><td>" + data.name + "</td><td>" + data.categoryName + "</td><td>" +
                    moment(data.couponStartDate).format("YYYY-M-D") + "</td><td>" + moment(data.couponEndDate).format("YYYY-M-D") +
                    "</td><td>" + data.gradeName + "</td><td>" + data.subjectName + "</td><td>" + data.reducePrice +
                    "</td><td>" + data.reduceMax + "</td><td><div data-obj='" + JSON.stringify(data) +
                    "' class='btn-group'>" + getButtons(data) + "</div></td></tr>"));
            } else {
                var name = $('#' + data._id + ' td:first-child');
                name.text(data.name);
                var category = name.next().text(data.categoryName);
                var start = category.next().text(data.couponStartDate);
                var end = start.next().text(data.couponEndDate);
                var grade = end.next().text(data.gradeName);
                var subject = grade.next().text(data.subjectName);
                var price = subject.next().text(data.reducePrice);
                price.next().text(data.reduceMax);
                var $lastDiv = $('#' + data._id + ' td:last-child div');
                $lastDiv.data("obj", data);
            }
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
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
    resetDropDown({
        gradeid: entity.gradeId,
        subjectid: entity.subjectId,
        attributeid: entity.category
    });
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    showComfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/coupon/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnPublish", function(e) {
    showComfirm("确定要发布吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/coupon/publish", {
            id: entity._id
        }, function(data) {
            if (data.sucess) {
                showAlert("发布成功！");
                var name = $('#' + entity._id + ' td:first-child');
                name.next().text("发布");
                var operation = $('#' + entity._id + ' td:last-child .btn-group');
                operation.find(".btnPublish").remove();
                operation.append("<a class='btn btn-default btnUnPublish'>停用</a>");
            }
        });
    });
});

$("#gridBody").on("click", "td .btnUnPublish", function(e) {
    showComfirm("确定要停用吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/coupon/unpublish", {
            id: entity._id
        }, function(data) {
            if (data.sucess) {
                showAlert("停用成功！");
                var name = $('#' + entity._id + ' td:first-child');
                name.next().text("停用");
                var operation = $('#' + entity._id + ' td:last-child .btn-group');
                operation.find(".btnUnPublish").remove();
                operation.append("<a class='btn btn-default btnPublish'>发布</a>");
            }
        });
    });
});

$("#gridBody").on("click", "td .btnAssign", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/couponAssign/" + entity._id;
});

$("#gridBody").on("click", "td .btnCheck", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/couponAssignList/" + entity._id;
});

/**---------------dropdowns------------------- */
function resetDropDown(objs) {
    $('#myModal').find("#grade option").remove();
    $('#myModal').find("#subject option").remove();
    $('#myModal').find("#category option").remove();
    $("#myModal #grade").append("<option value=''></option>");
    $("#myModal #subject").append("<option value=''></option>");
    $("#myModal #examCategoryName").append("<option value=''></option>");
    $("#myModal #category").append('<option value="固定">固定</option><option value="随机">随机</option>');

    $.get("/admin/trainClass/gradesubjectattribute", function(data) {
        if (data) {
            if (data.grades && data.grades.length > 0) {
                data.grades.forEach(function(grade) {
                    var select = "";
                    if (objs && grade._id == objs.gradeid) {
                        select = "selected";
                    }
                    $("#myModal #grade").append("<option " + select + " value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
            if (data.subjects && data.subjects.length > 0) {
                data.subjects.forEach(function(subject) {
                    var select = "";
                    if (objs && subject._id == objs.subjectid) {
                        select = "selected";
                    }
                    $("#myModal #subject").append("<option " + select + " value='" + subject._id + "'>" + subject.name + "</option>");
                });
            }

            if (data.attributes && data.attributes.length > 0) {
                data.attributes.forEach(function(attribute) {
                    $("#myModal #category").append("<option  value='" + attribute._id + "'>" + attribute.name + "</option>");
                });
                if (objs && objs.attributeid) {
                    $("#myModal #category").val(objs.attributeid);
                }
            }
        }
    });
};
/**---------------dropdowns - end------------------- */
$("#myModal #category").on("change blur", function() {
    if ($("#myModal #category").val() == "随机") {
        $("#myModal .reduceMax").show();
    } else {
        $("#myModal .reduceMax").hide();
    }
});