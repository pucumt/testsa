var isNew = true;

$(document).ready(function() {
    $("#left_btnTeacher").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function() {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnReset">重置</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/teacher/search?" + pStr, filter, function(data) {
        if (data && data.teachers.length > 0) {
            data.teachers.forEach(function(teacher) {
                var $tr = $('<tr id=' + teacher._id + '><td>' + teacher.name + '</td><td>' + (teacher.engName || "") + '</td><td>' +
                    teacher.mobile + '</td><td>' + (teacher.address || "") + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", teacher);
                $mainSelectBody.append($tr);
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
                            message: '名字不能为空'
                        },
                        stringLength: {
                            max: 30,
                            message: '名字不能超过30个字符'
                        }
                    }
                },
                'mobile': {
                    trigger: "blur change",
                    validators: {
                        stringLength: {
                            max: 30,
                            message: '电话不能超过30个字符'
                        },
                    }
                },
                'address': {
                    trigger: "blur change",
                    validators: {
                        stringLength: {
                            max: 100,
                            message: '地址不能超过100个字符'
                        },
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
    $('#myModalLabel').text("新增老师");
    $('#myModal #name').val("");
    $('#myModal #engName').val("");
    $('#myModal #mobile').val("");
    $('#myModal #address').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnBatchAdd").on("click", function(e) {
    location.href = "/admin/batchAddTeacher";
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/teacher/add",
            postObj = {
                name: $('#myModal #name').val(),
                engName: $('#myModal #engName').val(),
                mobile: $('#myModal #mobile').val(),
                address: $('#myModal #address').val()
            };
        if (!isNew) {
            postURI = "/admin/teacher/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            var page = parseInt($("#mainModal #page").val());
            search(page);
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModal #name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改老师");
    $('#myModal #name').val(entity.name);
    $('#myModal #engName').val(entity.engName);
    $('#myModal #mobile').val(entity.mobile);
    $('#myModal #address').val(entity.address);
    $('#myModal #id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});


$("#gridBody").on("click", "td .btnReset", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showComfirm("真的要重置 (" + entity.name + ") 的密码吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        selfAjax("post", "/admin/teacher/reset", {
            id: entity._id
        }, function(data) {
            var msg;
            if (data.sucess) {
                msg = "密码重置成功！";
            } else {
                msg = "密码重置失败！";
            }
            showAlert(msg, null, true);
        });
    });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    showComfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        selfAjax("post", "/admin/teacher/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});