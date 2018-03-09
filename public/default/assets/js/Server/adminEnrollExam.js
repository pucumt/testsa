var isNew = true;

$(document).ready(function () {
    $("#left_btnAdminEnrollExam").addClass("active");
    $("#selectModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#selectModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $('#selectModal').on('shown.bs.modal', function () {
        resetScroll();
    })

    addValidation();
    resetDropDown();
});
//grade/getAll

function resetScroll() {
    if ($("#selectModal .modal-content").height() > $(window).height()) {
        $("#selectModal .modal-content .modal-body").height($(window).height() - 122);
    }
};

function addValidation(callback) {
    $('#studentInfo').formValidation({
        declarative: false,
        // List of fields and their validation rules
        fields: {
            'studentName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '学员姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '学员姓名在2-30个字符之间'
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
                        message: '手机号必须是11位'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            },
            'School': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '学校不能为空'
                    }
                }
            },
            'className': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '班级不能为空'
                    }
                }
            }
        }
    });

    $('#enrollInfo').formValidation({
        declarative: false,
        // List of fields and their validation rules
        fields: {
            'studentName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '学员姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '学员姓名在2-30个字符之间'
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
                        max: 50,
                        message: '测试名称在2-50个字符之间'
                    }
                }
            }
        }
    });
};

$("#btnAddStudent").on("click", function (e) {
    var validator = $('#studentInfo').data('formValidation').validate();
    if (validator.isValid()) {
        $("#btnAddStudent").attr("disabled", "disabled");
        var postURI = "/admin/studentAccount/newStudent",
            postObj = {
                name: $('#studentInfo #studentName').val(),
                mobile: $('#studentInfo #mobile').val(),
                sex: $('#studentInfo #sex').val(),
                School: $('#studentInfo #School').val(),
                className: $('#studentInfo #className').val(),
                gradeId: $('#studentInfo #grade').val(),
                gradeName: $('#studentInfo #grade').find("option:selected").text()
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data && data.sucess) {
                showAlert("添加成功");
            } else {
                showAlert(data.error);
            }
            $("#btnAddStudent").removeAttr("disabled");
        });
    }
});

$("#btnEnroll").on("click", function (e) {
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        $("#btnEnroll").attr("disabled", "disabled");

        var examArea = $('#enrollInfo #examAreas').val();
        //new enroll with multi areas
        var postURI = "/admin/adminEnrollExam/enroll",
            postObj = {
                studentId: $('#enrollInfo #studentId').val(),
                studentName: $('#enrollInfo #studentName').val(),
                mobile: $('#enrollInfo #mobile').val(),
                examId: $('#enrollInfo #examId').val(),
                examName: $('#enrollInfo #examName').val(),
                examCategoryId: $('#enrollInfo #examCategoryId').val(),
                examCategoryName: $('#enrollInfo #examCategoryName').val(),
                examClassExamAreaId: examArea
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data && data.sucess) {
                if (data.orderId) {
                    // to pay
                    location.replace("/admin/payexam/" + data.orderId);
                } else {
                    location.replace("/admin/examOrderList");
                }
            } else {
                showAlert(data.error);
            }
            $("#btnEnroll").removeAttr("disabled");
        });
    }
});

$("#btnHideEnroll").on("click", function (e) {
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        $("#btnEnroll").attr("disabled", "disabled");

        var examArea = $('#enrollInfo #examAreas').val();
        //new enroll with multi areas
        var postURI = "/admin/adminEnrollExam/hideEnroll",
            postObj = {
                studentId: $('#enrollInfo #studentId').val(),
                studentName: $('#enrollInfo #studentName').val(),
                mobile: $('#enrollInfo #mobile').val(),
                examId: $('#enrollInfo #examId').val(),
                examName: $('#enrollInfo #examName').val(),
                examCategoryId: $('#enrollInfo #examCategoryId').val(),
                examCategoryName: $('#enrollInfo #examCategoryName').val(),
                examClassExamAreaId: examArea
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data && data.sucess) {
                if (data.orderId) {
                    // to pay
                    location.replace("/admin/payexam/" + data.orderId);
                } else {
                    location.replace("/admin/examOrderList");
                }
            } else {
                showAlert(data.error);
            }
            $("#btnEnroll").removeAttr("disabled");
        });
    }
});

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

function openStudent(p) {
    $('#selectModal #selectModalLabel').text("选择学生");
    var filter = {
            name: $("#selectModal #InfoSearch #studentName").val(),
            mobile: $("#selectModal #InfoSearch #mobile").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>学生姓名</th><th width="120px">电话号码</th><th width="120px">性别</th></tr>');
    selfAjax("post", "/admin/studentInfo/search?" + pStr, filter, function (data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function (student) {
                student.School = "";
                student.className = "";
                var sex = student.sex ? "女" : "男";
                var $tr = $('<tr><td>' + student.name +
                    '</td><td>' + student.mobile + '</td><td>' + sex + '</td></tr>');
                $tr.data("obj", student);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
                $('#enrollInfo #studentName').val(entity.name); //
                $('#enrollInfo #studentId').val(entity._id); //
                $('#enrollInfo #mobile').val(entity.mobile); //
                $('#enrollInfo #sex').val(entity.sex ? 1 : 0); //
                $('#selectModal').modal('hide');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    });
};

function openExam(p) {
    $('#selectModal #selectModalLabel').text("选择测试");
    var filter = {
            name: $("#selectModal #InfoSearch #studentName").val(),
            mobile: $("#selectModal #InfoSearch #mobile").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>测试名称</th><th width="180px">测试类别</th><th width="120px">报名情况</th></tr>');
    selfAjax("post", "/admin/examClass/search?" + pStr, filter, function (data) {
        if (data && data.examClasss.length > 0) {
            data.examClasss.forEach(function (examClass) {
                examClass.courseContent = "";
                var $tr = $('<tr ><td>' + examClass.name +
                    '</td><td>' + examClass.examCategoryName + '</td><td>' + examClass.enrollCount + '/' +
                    examClass.examCount + '</td></tr>');
                $tr.data("obj", examClass);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
                $('#enrollInfo #examName').val(entity.name); //
                $('#enrollInfo #examId').val(entity._id); //
                $('#enrollInfo #examCategoryName').val(entity.examCategoryName); //
                $('#enrollInfo #examCategoryId').val(entity.examCategoryId); //
                renderExamAreas(entity._id);
                $('#selectModal').modal('hide');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    });
};

var openEntity = "student";
$("#panel_btnStudent").on("click", function (e) {
    openEntity = "student";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="studentName" class="control-label">姓名:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="studentName" id="studentName"></div></div>' +
        '<div class="col-md-8"><div class="form-group"><label for="mobile" class="control-label">手机号:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="mobile" id="mobile"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openStudent();
});

$("#panel_btnExam").on("click", function (e) {
    openEntity = "exam";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="examName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="examName" id="examName"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openExam();
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function (e) {
    if (openEntity == "student") {
        openStudent();
    } else if (openEntity == "exam") {
        openExam();
    }
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "exam") {
        openExam(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "exam") {
        openExam(page);
    }
});

function resetDropDown() {
    $('#studentInfo').find("#grade option").remove();
    selfAjax("get", "/admin/grade/getAll", null, function (data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function (grade) {
                    $("#studentInfo #grade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
        }
    });
};

function renderExamAreas(examId) {
    selfAjax("post", "/admin/examClassExamArea/examAreas", {
        examId: examId
    }, function (data) {
        if (data) {
            var d = $(document.createDocumentFragment());
            if (data && data.length > 0) {
                data.forEach(function (examArea) {
                    d.append("<option value='" + examArea._id + "'>" + examArea.examAreaName + "</option>");
                });
            } else {
                //d.append("<option value='" + exam.examAreaId + "'>" + exam.examAreaName + "</option>");
            }
            $("#enrollInfo #examAreas").append(d);
        }
    });
};