var isNew = true;

$(document).ready(function() {
    $("#left_btnAdmin").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    searchAdmins();
})

//--begin search functions
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function() {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function searchAdmins(p) {
    var filter = {
            name: $.trim($(".mainModal #InfoSearch #className").val())
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/adminList/search?" + pStr, filter, function(data) {
        $mainSelectBody.empty();
        if (data && data.users.length > 0) {
            var d = $(document.createDocumentFragment());
            data.users.forEach(function(user) {
                var buttons = getButtons();
                if (user.name == "bfbadmin") {
                    buttons = "";
                }
                var trObject = $('<tr id=' + user._id + '><td><span><input type="checkbox" name="trainId" value=' + user._id + ' /></span>' + user.name +
                    '</td><td>' + (user.schoolArea || "") + '</td><td>' + (user.role || "") +
                    '</td><td><div class="btn-group">' + buttons + '</div></td></tr>');
                trObject.find(".btn-group").data("obj", user);
                d.append(trObject);
            });
            $mainSelectBody.append(d);
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    searchAdmins();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    searchAdmins(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    searchAdmins(page);
});
//--end search functions
function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
}

function addValidation(callback) {
    setTimeout(function() {
        var userValidator = {
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
        };
        if (callback) {
            callback(userValidator);
        }
        $('#myModal').formValidation({
                // List of fields and their validation rules
                fields: {
                    'user-name': {
                        trigger: "blur change",
                        validators: userValidator
                    },
                    'user-pwd': {
                        trigger: "blur change",
                        validators: {
                            notEmpty: {
                                message: '密码不能为空'
                            },
                            stringLength: {
                                min: 6,
                                max: 15,
                                message: '密码在6-15个字符之间'
                            },
                        }
                    }
                }
            })
            .on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();
                addUser();
            });
    }, 0);
}

function addUser() {
    var postURI = "/admin/user/add";
    if (!isNew) {
        postURI = "/admin/user/edit";
    }
    $.post(postURI, {
        username: $('#user-name').val(),
        password: hex_md5($('#user-pwd').val()),
        schoolId: $('#myModal #school').val(),
        schoolArea: $('#myModal #school').find("option:selected").text(),
        role: $("#myModal #role").val()
    }, function(data) {
        $('#myModal').modal('hide');
        var page = parseInt($("#mainModal #page").val());
        searchAdmins(page);
    });
}

function resetSchool(id) {
    $('#myModal').find("#school option").remove();
    $.get("/admin/schoolArea/all", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(school) {
                var select = "";
                if (school._id == id) {
                    select = "selected";
                }
                $("#myModal #school").append("<option " + select + " value='" + school._id + "'>" + school.name + "</option>");
            });
        }
    });
};

$("#btnAdd").on("click", function(e) {
    isNew = true;
    destroy();
    addValidation(function(validator) {
        validator.remote = {
            message: '用户名已经存在',
            url: '/admin/user/find',
            data: function(validator, $field, value) {
                return {
                    username: $('#user-name').val()
                };
            },
            type: 'POST'
        };
    });
    resetSchool();
    $('#user-name').removeAttr("disabled");
    $('#myModalLabel').text("新增管理员");
    $('#user-name').val("");
    $('#user-pwd').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation');
    validator.validate();
});

$("#btnChangeRole").on("click", function(e) {
    $.post("/admin/user/setRole", {
        username: $('#user-name').val(),
        schoolId: $('#myModal #school').val(),
        schoolArea: $('#myModal #school').find("option:selected").text(),
        role: $("#myModal #role").val()
    }, function(data) {
        $('#myModal').modal('hide');
        var page = parseInt($("#mainModal #page").val());
        searchAdmins(page);
    });
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    destroy();
    addValidation();
    isNew = false;
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#user-name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改管理员");
    $('#user-name').val(entity.name);
    $('#user-pwd').val("");
    resetSchool(entity.schoolId);
    $("#myModal #role").val(entity.role);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    showComfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/user/delete", {
            username: entity.name
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});