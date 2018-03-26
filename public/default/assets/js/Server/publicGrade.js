var isNew = true;

$(document).ready(function () {
    $("#left_btnPublicGrade").addClass("active");

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    search();
})

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function () {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/publicGrade/search?" + pStr, filter, function (data) {
        if (data && data.publicGrades.length > 0) {
            data.publicGrades.forEach(function (publicGrade) {
                var $tr = $('<tr id=' + publicGrade._id + '><td>' + publicGrade.name + '</td><td>' +
                    publicGrade.sequence + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", publicGrade);
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
}

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
}

$("#btnAdd").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增类别");
    $('#name').val("");
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/publicGrade/add",
            postObj = {
                name: $('#name').val(),
                sequence: $('#sequence').val()
            };
        if (!isNew) {
            postURI = "/admin/publicGrade/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function (data) {
            location.reload();
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModalLabel').text("修改类别");
    $('#name').val(entity.name);
    $('#sequence').val(entity.sequence);
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
        selfAjax("post", "/admin/publicGrade/delete", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                location.reload();
            }
        });
    });
});