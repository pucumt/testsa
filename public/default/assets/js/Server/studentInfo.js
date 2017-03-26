var isNew = true;

$(document).ready(function() {
    $("#left_btnStudent").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function() {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/studentInfo/search?" + pStr, filter, function(data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function(studentInfo) {
                $mainSelectBody.append('<tr id=' + studentInfo._id + '><td>' + studentInfo.name + '</td><td>' + studentInfo.mobile + '</td><td><div data-obj=' +
                    JSON.stringify(studentInfo) + ' class="btn-group">' + getButtons() + '</div></td></tr>');
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
    $('#myModal').formValidation({
        // List of fields and their validation rules
        fields: {
            'name': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '姓名不能为空'
                    }
                }
            },
            'mobile': {
                trigger: "blur change",
                validators: {
                    stringLength: {
                        min: 11,
                        message: '手机号必须是11位'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            }
        }
    });
};

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/studentInfo/edit",
            postObj = {
                name: $('#myModal #name').val(),
                mobile: $('#myModal #mobile').val(),
                studentNo: $('#myModal #studentNo').val(),
                sex: $('#myModal #sex').val(),
                School: $('#myModal #School').val(),
                address: $('#myModal #address').val(),
                discount: $('#myModal #discount').val(),
                id: $('#myModal #id').val()
            };
        $.post(postURI, postObj, function(data) {
            if (data.error) {
                showAlert(data.error);
            } else {
                $('#myModal').modal('hide');
                var name = $('#' + data._id + ' td:first-child');
                name.text(data.name);
                name.next().text(data.mobile);
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
    $('#myModal #myModalLabel').text("修改信息");
    $('#myModal #name').val(entity.name);
    $('#myModal #mobile').val(entity.mobile);
    $('#myModal #studentNo').val(entity.studentNo);
    $('#myModal #sex').val(entity.sex ? 1 : 0);
    $('#myModal #School').val(entity.School);
    $('#myModal #address').val(entity.address);
    $('#myModal #discount').val(entity.discount);
    $('#myModal #id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showComfirm("真的要删除" + entity.name + "吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/studentInfo/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
                showAlert("删除成功", null, true);
            }
        });
    });
});