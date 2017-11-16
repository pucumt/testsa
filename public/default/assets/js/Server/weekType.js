var isNew = true;

$(document).ready(function () {
    $("#left_btnWeekType").addClass("active");

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function () {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

var getStatus = function (isChecked) {
    return isChecked ? "启用" : "停用";
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/weekTypeList/search?" + pStr, filter, function (data) {
        if (data && data.weekTypes.length > 0) {
            data.weekTypes.forEach(function (weekType) {
                var $tr = $('<tr id=' + weekType._id + '><td><span><input type="checkbox" name="weekTypeId" value=' + weekType._id + ' /></span>' + weekType.name + '</td><td>' +
                    getStatus(weekType.isChecked) + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", weekType);
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
                            message: '名称不能为空'
                        },
                        stringLength: {
                            min: 2,
                            max: 30,
                            message: '名称在2-30个字符之间'
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
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增");
    $('#name').val("");
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/weekType/add",
            postObj = {
                name: $.trim($('#name').val())
            };
        if (!isNew) {
            postURI = "/admin/weekType/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function (data) {
            $('#myModal').modal('hide');
            var page = parseInt($("#mainModal #page").val());
            search(page);
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModalLabel').text("修改");
    $('#name').val(entity.name);
    $('#id').val(entity._id);
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
        selfAjax("post", "/admin/weekType/delete", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$("#btnStart").on("click", function (e) {
    var trainIds = getAllCheckedIds($(".mainModal #gridBody [name='weekTypeId']"));
    if (trainIds.length > 0) {
        showConfirm("确定要启用吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/weekType/startAll", {
                ids: JSON.stringify(trainIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("启用成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        search(page);
                    });
                }
            });
        });
    }
});

$("#btnStop").on("click", function (e) {
    var trainIds = getAllCheckedIds($(".mainModal #gridBody [name='weekTypeId']"));
    if (trainIds.length > 0) {
        showConfirm("确定要停用吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/weekType/stopAll", {
                ids: JSON.stringify(trainIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("停用成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        search(page);
                    });
                }
            });
        });
    }
});