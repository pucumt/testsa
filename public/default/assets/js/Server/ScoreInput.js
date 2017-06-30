var isNew = true;

$(document).ready(function() {
    $("#left_btnScoreInput").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    addValidation();
});

function addValidation() {
    $('#editfile').formValidation({
        // List of fields and their validation rules
        fields: {
            'examName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '测试名称不能为空'
                    }
                }
            },
            'subject': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '科目不能为空'
                    }
                }
            }
        }
    });
};
//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            studentName: $(".mainModal #InfoSearch #studentName").val(),
            mobile: $(".mainModal #InfoSearch #mobile").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/adminEnrollExam/searchCard?" + pStr, filter, function(data) {
        if (data && data.adminEnrollExams.length > 0) {
            data.adminEnrollExams.forEach(function(examOrder) {
                var $tr = $('<tr id=' + examOrder._id + '><td>' + examOrder._id + '</td><td>' + examOrder.studentName + '</td><td>' +
                    examOrder.examName + '</td></tr>');
                $tr.data("obj", examOrder);
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".content.mainModal table tbody").on("click", "tr", function(e) {
    //need change later
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    location.href = "/admin/studentScore/" + entity._id + "/score";
});

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$("#editfile #btnResult").on("click", function(e) {
    location.href = "/admin/score";
});
$("#editfile #btnClear").on("click", function(e) {
    $.get("/admin/score/clearAll", function(data) {
        if (data && data.sucess) {
            showAlert("删除记录成功");
        }
    });
});

$("#editfile #btnScore").on("click", function(e) {
    var validator = $('#editfile').data('formValidation').validate();
    if (validator.isValid()) {
        var file = document.getElementById('upfile').files;
        if (file.length > 0) {
            var formData = new FormData();
            formData.append("avatar", file[0]);
            formData.append("examId", $("#editfile #examId").val());
            formData.append("subject", $("#editfile #subject").val());
            $.ajax({
                type: "POST",
                data: formData,
                url: "/admin/score",
                contentType: false,
                processData: false,
            }).then(function(data) {
                location.href = "/admin/score";
            });
        }
    }
});

$("#editfile #btnCheckStudent").on("click", function(e) {
    var file = document.getElementById('upfileStudent').files;
    if (file.length > 0) {
        var formData = new FormData();
        formData.append("avatar", file[0]);
        $.ajax({
            type: "POST",
            data: formData,
            url: "/admin/checkstudent",
            contentType: false,
            processData: false,
        }).then(function(data) {
            location.href = "/admin/score";
        });
    }
});

$("#editfile #btnExportScore").on("click", function(e) {
    var validator = $('#editfile').data('formValidation').validate();
    if (validator.isValid()) {
        selfAjax("post", "/admin/export/scoreTemplate", {
            examId: $("#editfile #examId").val(),
            exam: $("#editfile #examName").val(),
            subject: $("#editfile #subject").find("option:selected").text()
        }, function(data) {
            if (data && data.sucess) {
                var fileName = $("#editfile #examName").val().substr(0, 19) + '_' + $("#editfile #subject").find("option:selected").text() + '.xlsx';
                location.href = "/admin/export/scoreTemplate?name=" + encodeURI(fileName);
            }
        });
    }
});

$("#editfile #btnExportSchool").on("click", function(e) {
    var validator = $('#editfile').data('formValidation').validate();
    if (validator.isValid()) {
        selfAjax("post", "/admin/export/scoreSchoolTemplate", {
            examId: $("#editfile #examId").val(),
            exam: $("#editfile #examName").val(),
            subject: $("#editfile #subject").find("option:selected").text()
        }, function(data) {
            if (data && data.sucess) {
                var fileName = $("#editfile #examName").val().substr(0, 19) + '_' + $("#editfile #subject").find("option:selected").text() + '.xlsx';
                location.href = "/admin/export/scoreTemplate?name=" + encodeURI(fileName);
            }
        });
    }
});

$("#editfile #btnExportReport").on("click", function(e) {
    var validator = $('#editfile').data('formValidation').validate();
    if (validator.isValid()) {
        selfAjax("post", "/admin/export/reportTemplate", {
            examId: $("#editfile #examId").val(),
            exam: $("#editfile #examName").val(),
            subject: $("#editfile #subject").find("option:selected").text()
        }, function(data) {
            if (data && data.sucess) {
                var fileName = $("#editfile #examId").val() + '.zip';
                location.href = "/admin/export/scoreTemplate?name=" + encodeURI(fileName);
            }
        });
    }
});


$("#editfile #btnExportClass").on("click", function(e) {
    var validator = $('#editfile').data('formValidation').validate();
    if (validator.isValid()) {
        $.post("/admin/export/classTemplate3", {
            examId: $("#editfile #examId").val()
        }).then(function(data) {
            if (data && data.sucess) {
                location.href = "/admin/export/scoreTemplate?name=" + encodeURI("报名情况3.xlsx");
            }
        });
    }
});

$("#editfile #btnExportClass3").on("click", function(e) {
    // var validator = $('#editfile').data('formValidation').validate();
    // if (validator.isValid()) {
    //     $.post("/admin/export/classTemplate3", {
    //         examId: $("#editfile #examId").val()
    //     }).then(function(data) {
    //         if (data && data.sucess) {
    //             location.href = "/admin/export/scoreTemplate?name=" + encodeURI("报名情况3.xlsx");
    //         }
    //     });
    // }
});

$("#editfile #btnExportClass5").on("click", function(e) {
    selfAjax("post", "/admin/export/classTemplate5", {}, function(data) {
        if (data && data.sucess) {
            location.href = "/admin/export/scoreTemplate?name=" + encodeURI("报名情况5.xlsx");
        }
    });
});

$("#editfile #btnExportClass6").on("click", function(e) {
    selfAjax("post", "/admin/export/classTemplate6", {}, function(data) {
        if (data && data.sucess) {
            location.href = "/admin/export/scoreTemplate?name=" + encodeURI("报名情况6.xlsx");
        }
    });
});

$("#editfile #btnReport").on("click", function(e) {
    var validator = $('#editfile').data('formValidation').validate();
    if (validator.isValid()) {
        var file = document.getElementById('upfileReport').files;
        if (file.length > 0) {
            postReport(file, 0);
        }
    }
});

function postReport(file, i) {
    if (file.length == i) {
        location.href = "/admin/score";
        return;
    }

    var formData = new FormData();
    formData.append("report", file[i]);
    formData.append("examId", $("#editfile #examId").val());
    formData.append("subject", $("#editfile #subject").val());
    $.ajax({
        type: "POST",
        data: formData,
        url: "/admin/report",
        contentType: false,
        processData: false,
    }).then(function(data) {
        postReport(file, i + 1);
    });
};
//------------end

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

function openExam(p) {
    $('#selectModal #selectModalLabel').text("选择测试");
    var filter = { name: $("#selectModal #InfoSearch #studentName").val(), mobile: $("#selectModal #InfoSearch #mobile").val() },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>测试名称</th><th width="180px">测试类别</th><th width="120px">报名情况</th></tr>');
    $.post("/admin/examClass/search?" + pStr, filter, function(data) {
        if (data && data.examClasss.length > 0) {
            data.examClasss.forEach(function(examClass) {
                var $tr = $('<tr><td>' + examClass.name +
                    '</td><td>' + examClass.examCategoryName + '</td><td>' + examClass.enrollCount + '/' +
                    examClass.examCount + '</td></tr>');
                $tr.data("obj", examClass);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function(entity) {
                $('#editfile #examName').val(entity.name); //
                $('#editfile #examId').val(entity._id); //
                $('#selectModal').modal('hide');
                resetDropDown(entity.subjects);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({ backdrop: 'static', keyboard: false });
    });
};

$("#panel_btnExam").on("click", function(e) {
    openEntity = "exam";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="examName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="examName" id="examName"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openExam();
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function(e) {
    openExam();
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    openExam(page);
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    openExam(page);
});

function resetDropDown(data) {
    $('#editfile').find("#subject option").remove();
    data.forEach(function(subject) {
        $("#editfile #subject").append("<option value='" + subject.subjectId + "'>" + subject.subjectName + "</option>");
    });
};