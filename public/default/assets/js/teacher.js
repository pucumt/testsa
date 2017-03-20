var isNew = true;

$(document).ready(function() {
    $("#btnTeacher").addClass("active");
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
};

$("#btnAdd").on("click", function(e) {
    isNew = true;
    destroy();
    addValidation();
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增老师");
    $('#name').val("");
    $('#mobile').val("");
    $('#address').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/teacher/add",
            postObj = {
                name: $('#name').val(),
                mobile: $('#mobile').val(),
                address: $('#address').val()
            };
        if (!isNew) {
            postURI = "/admin/teacher/edit";
            postObj.id = $('#id').val();
        }
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            if (isNew) {
                $('#gridBody').append($("<tr id=" + data._id + "><td>" + data.name + "</td><td>" + data.mobile + "</td><td>" + data.address + "</td><td><div data-obj='" + JSON.stringify(data) +
                    "' class='btn-group'><a class='btn btn-default btnEdit'>编辑</a><a class='btn btn-default btnDelete'>删除</a></div></td></tr>"));
            } else {
                var name = $('#' + data._id + ' td:first-child');
                name.text(data.name);
                var mobile = name.next().text(data.mobile);
                mobile.next().text(data.address);
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
    $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改老师");
    $('#name').val(entity.name);
    $('#mobile').val(entity.mobile);
    $('#address').val(entity.address);
    $('#id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/teacher/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});