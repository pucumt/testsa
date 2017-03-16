var isNew = true;

$(document).ready(function() {
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $('#myModal').formValidation({
        // List of fields and their validation rules
        fields: {
            'user-name': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '用户名不能为空'
                    },
                    stringLength: {
                        min: 5,
                        max: 15,
                        message: '用户名在5-15个字符之间'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_]+$/,
                        message: '用户名只能是字母数字和下划线'
                    }
                }
            },
            'user-pwd': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: 'The password is required and cannot be empty'
                    },
                    stringLength: {
                        min: 6,
                        max: 15,
                        message: '密码在6-15个字符之间'
                    },
                }
            }
        }
    });
})

$("#btnAdmin").addClass("active");

$("#btnAdd").on("click", function(e) {
    isNew = true;
    $('#user-name').removeAttr("disabled");
    $('#myModalLabel').text("新增");
    $('#user-name').val("");
    $('#user-pwd').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    $('#myModal').data('formValidation').validate();
    // var postURI = "/admin/user/add";
    // if (!isNew) {
    //     postURI = "/admin/user/edit";
    // }
    // $.post(postURI, {
    //     username: $('#user-name').val(),
    //     password: hex_md5($('#user-pwd').val())
    // }, function(data) {
    //     $('#myModal').modal('hide');
    //     if (isNew) {
    //         $('#gridBody').append($('<tr><td>' + data.name + '</td><td><div data="' + data.name +
    //             '" class="btn-group"><a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a></div></td></tr>'));
    //     }
    // });
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    isNew = false;
    var obj = e.currentTarget;
    $('#user-name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改");
    $('#user-name').val($(obj).parent().attr("data"));
    $('#user-pwd').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/user/delete", {
            username: $(obj).parent().attr("data")
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});