var isNew = true;

$(document).ready(function() {
    $("#left_btnYear").addClass("active");
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
                            message: '年度不能为空'
                        },
                        stringLength: {
                            min: 4,
                            max: 30,
                            message: '年度在4-30个字符之间'
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
    $('#myModalLabel').text("新增年度");
    $('#name').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/year/add",
            postObj = {
                name: $('#name').val()
            };
        if (!isNew) {
            postURI = "/admin/year/edit";
            postObj.id = $('#id').val();
        }
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            if (isNew) {
                var $tr = $("<tr id=" + data._id + "><td>" + data.name + "</td><td><div class='btn-group'><a class='btn btn-default btnEdit'>编辑</a><a class='btn btn-default btnDelete'>删除</a></div></td></tr>");
                $tr.find(".btn-group").data("obj", data);
                $('#gridBody').append($tr);
            } else {
                var name = $('#' + data._id + ' td:first-child');
                name.text(data.name);
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
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改年度");
    $('#name').val(entity.name);
    $('#id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    showComfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/year/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});