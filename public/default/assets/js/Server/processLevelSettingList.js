var isNew = true;

$(document).ready(function () {
    $("#left_btnProcessLevel").addClass("active");

    search();
});

//------------search function
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function () {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search() {
    var filter = {
        subjectId: $("#subjectId").val(),
        categoryId: $("#categoryId").val()
    };
    $mainSelectBody.empty();
    selfAjax("post", "/admin/subjectCategoryPLevelRelation/search", filter, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (level) {
                var $tr = $('<tr><td>' + level.processLevel + '</td><td><div class="btn-group">' + getButtons() +
                    '</div></td></tr>');
                $tr.data("obj", level);
                $mainSelectBody.append($tr);
            });
        }
    });
};

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
    // $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增进度");
    $('#name').val("");
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/processLevel/add",
            postObj = {
                name: $.trim($('#name').val()),
                subjectId: $("#subjectId").val(),
                categoryId: $("#categoryId").val()
            };
        if (!isNew) {
            postURI = "/admin/processLevel/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.reload();
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parents("tr").data("obj");
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改名称");
    $('#name').val(entity.processLevel);
    $('#id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parents("tr").data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/processLevel/delete", {
            id: entity._id
        }, function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.reload();
        });
    });
});