var isNew = true;

$(document).ready(function() {
    $("#btnClassroom").addClass("active");
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
                        message: '教室名不能为空'
                    },
                    stringLength: {
                        min: 3,
                        max: 30,
                        message: '教室名在3-30个字符之间'
                    }
                }
            },
            'sCount': {
                trigger: "blur change",
                validators: {
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            }
        }
    });
};

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
    addValidation();
    resetSchool();
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增教室");
    $('#name').val("");
    $('#sCount').val("");
    $('#school').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/classRoom/add",
            postObj = {
                name: $('#name').val(),
                sCount: $('#sCount').val(),
                schoolId: $('#school').val(),
                schoolArea: $('#school').find("option:selected").text()
            };
        if (!isNew) {
            postURI = "/admin/classRoom/edit";
            postObj.id = $('#id').val();
        }
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            if (isNew) {
                $('#gridBody').append($("<tr id=" + data._id + "><td>" + data.name + "</td><td>" + data.sCount + "</td><td>" + data.schoolArea + "</td><td><div data-obj='" + JSON.stringify(data) +
                    "' class='btn-group'><a class='btn btn-default btnEdit'>编辑</a><a class='btn btn-default btnDelete'>删除</a></div></td></tr>"));
            } else {
                var name = $('#' + data._id + ' td:first-child');
                name.text(data.name);
                var sCount = name.next().text(data.sCount);
                sCount.next().text(data.schoolArea);
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
    $('#myModalLabel').text("修改教室");
    $('#name').val(entity.name);
    $('#sCount').val(entity.sCount);
    $('#school').val(entity.schoolArea);
    resetSchool(entity.schoolId);
    $('#id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/classRoom/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});