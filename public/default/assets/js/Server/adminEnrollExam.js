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
            'publicSchool': {
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
                School: $('#studentInfo #publicSchool').val(),
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

function openExam(p) {
    $('#selectModal #selectModalLabel').text("选择测试");
    var filter = {
            name: $("#selectModal #InfoSearch #examName").val()
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
                $('#enrollInfo #examPrice').val(entity.examPrice); //
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

    renderStudentSearchCriteria();
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

$("#panel_btnSchool").on("click", function (e) {
    openEntity = "school";

    renderSchoolSearchCriteria();
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function (e) {
    if (openEntity == "student") {
        openStudent();
    } else if (openEntity == "exam") {
        openExam();
    } else if (openEntity == "school") {
        openSchool();
    }
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "exam") {
        openExam(page);
    } else if (openEntity == "school") {
        openSchool(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "exam") {
        openExam(page);
    } else if (openEntity == "school") {
        openSchool(page);
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