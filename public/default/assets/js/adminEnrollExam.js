var isNew = true;

$(document).ready(function() {
    $("#btnAdminEnrollExam").addClass("active");
    // $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    // $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
    addValidation();
});

function addValidation(callback) {
    $('#studentInfo').formValidation({
        // List of fields and their validation rules
        fields: {
            'studentName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '学生姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '学生姓名在2-30个字符之间'
                    }
                }
            },
            'mobile': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '手机号不能为空'
                    },
                    stringLength: {
                        min: 11,
                        max: 11,
                        message: '手机号必须是11位'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            }
        }
    });

    $('#enrollInfo').formValidation({
        // List of fields and their validation rules
        fields: {
            'studentName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '学生姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '学生姓名在2-30个字符之间'
                    }
                }
            },
            'mobile': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '手机号不能为空'
                    },
                    stringLength: {
                        min: 11,
                        max: 11,
                        message: '手机号必须是11位'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            },
            'examName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '测试名称不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '测试名称在2-30个字符之间'
                    }
                }
            }
        }
    });
};

function showAlert(msg) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    $('#confirmModal #confirmModalLabel').text("提示");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("确定");
    $('#confirmModal #btnConfirmSave').hide();
};

function showComfirm(msg) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    $('#confirmModal #confirmModalLabel').text("确认");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("取消");
    $('#confirmModal #btnConfirmSave').show();
};

$("#btnAddStudent").on("click", function(e) {
    var validator = $('#studentInfo').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/studentAccount/newStudent",
            postObj = {
                name: $('#studentInfo #studentName').val(),
                mobile: $('#studentInfo #mobile').val(),
                sex: $('#studentInfo #sex').val()
            };
        $.post(postURI, postObj, function(data) {
            if (data && data.sucess) {
                showAlert("添加成功");
            } else {
                showAlert(data.error);
            }
        });
    }
});

$("#btnEnroll").on("click", function(e) {
    alert("添加失败");
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        alert("添加失败");
        // var postURI = "/admin/adminEnrollExam/add",
        //     postObj = {
        //         name: $('#name').val(),
        //         address: $('#address').val()
        //     };
        // if (!isNew) {
        //     postURI = "/admin/adminEnrollExam/edit";
        //     postObj.id = $('#id').val();
        // }
        // $.post(postURI, postObj, function(data) {
        //     $('#myModal').modal('hide');
        //     if (isNew) {
        //         $('#gridBody').append($("<tr id=" + data._id + "><td>" + data.name + "</td><td>" + data.address + "</td><td><div data-obj='" + JSON.stringify(data) +
        //             "' class='btn-group'><a class='btn btn-default btnEdit'>编辑</a><a class='btn btn-default btnDelete'>删除</a></div></td></tr>"));
        //     } else {
        //         var name = $('#' + data._id + ' td:first-child');
        //         name.text(data.name);
        //         name.next().text(data.address);
        //         var $lastDiv = $('#' + data._id + ' td:last-child div');
        //         $lastDiv.data("obj", data);
        //     }
        // });
    }
});

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');

function setSelectEvent(callback) {
    $selectBody.off("click").on("click", "tr", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).data("obj");
        callback(entity);
    });
};

$("#panel_btnStudent").on("click", function(e) {
    $('#selectModal #selectModalLabel').text("选择学生");
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>学生姓名</th><th width="120px">电话号码</th><th width="120px">性别</th></tr>');
    $.get("/admin/classRoomList/withoutpage", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(student) {
                var sex = student.sex ? "女" : "男";
                $selectBody.append('<tr data-obj=' + JSON.stringify(student) + '><td>' + student.name +
                    '</td><td>' + student.mobile + '</td><td>' + sex + '</td></tr>');
            });
            setSelectEvent(function(entity) {
                $('#enrollInfo #studentName').val(entity.name); //
                $('#enrollInfo #studentId').val(entity._id); //
                $('#enrollInfo #mobile').val(entity.mobile); //
                $('#enrollInfo #sex').val(entity.sex); //
                $('#enrollInfo #selectModal').modal('hide');
            });
        }
        $('#selectModal').modal({ backdrop: 'static', keyboard: false });
    });
});