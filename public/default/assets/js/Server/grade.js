var isNew = true;

$(document).ready(function() {
    $("#left_btnGrade").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动 
});

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
                            message: '年级不能为空'
                        },
                        stringLength: {
                            min: 3,
                            max: 30,
                            message: '年级在3-30个字符之间'
                        }
                    }
                },
                'sequence': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '顺序不能为空'
                        },
                        integer: {
                            message: '填写的不是数字',
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
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增年级");
    $('#name').val("");
    $('#sequence').val($("#total").val());
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/grade/add",
            postObj = {
                name: $('#name').val(),
                sequence: $('#sequence').val()
            };
        if (!isNew) {
            postURI = "/admin/grade/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            location.href = location.href;
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    //$('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改年级");
    $('#name').val(entity.name);
    $('#sequence').val(entity.sequence);
    $('#id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        selfAjax("post", "/admin/grade/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnReset", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/grade/settings/" + entity._id;
});