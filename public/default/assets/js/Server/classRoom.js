var isNew = true;

$(document).ready(function() {
    $("#left_btnClassroom").addClass("active");
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
    $.post("/admin/classRoomList/search?" + pStr, filter, function(data) {
        if (data && data.classRooms.length > 0) {

            data.classRooms.forEach(function(classRoom) {
                $mainSelectBody.append('<tr id=' + classRoom._id + '><td>' + classRoom.name + '</td><td>' +
                    classRoom.sCount + '</td><td>' + classRoom.schoolArea + '</td><td><div data-obj=' +
                    JSON.stringify(classRoom) + ' class="btn-group">' + getButtons() + '</div></td></tr>');
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
    setTimeout(function() {
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
    }, 0);
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
    $('#myModal #name').removeAttr("disabled");
    $('#myModalLabel').text("新增教室");
    $('#myModal #name').val("");
    $('#myModal #sCount').val("");
    $('#myModal #school').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/classRoom/add",
            postObj = {
                name: $('#myModal #name').val(),
                sCount: $('#myModal #sCount').val(),
                schoolId: $('#myModal #school').val(),
                schoolArea: $('#myModal #school').find("option:selected").text()
            };
        if (!isNew) {
            postURI = "/admin/classRoom/edit";
            postObj.id = $('#myModal #id').val();
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
    $('#myModal #name').attr("disabled", "disabled");
    $('#myModal #myModalLabel').text("修改教室");
    $('#myModal #name').val(entity.name);
    $('#myModal #sCount').val(entity.sCount);
    $('#myModal #school').val(entity.schoolArea);
    resetSchool(entity.schoolId);
    $('#myModal #id').val(entity._id);
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