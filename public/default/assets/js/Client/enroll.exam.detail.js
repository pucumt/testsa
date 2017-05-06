var newStudent = true,
    editStudent;
$(document).ready(function() {
    renderExamAreas();

    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/enrollExam";
    });

    $("#btnEnroll").on("click", function(e) {
        $.post("/enroll/students", { originalUrl: "/enroll/exam/" + $("#id").val() }, function(data) {
            if (data) {
                if (data.notLogin) {
                    location.href = "/login";
                    return;
                }

                if (data.students) {
                    $("#bgBack").show();
                    $("#Enroll-select").show();
                    $ul.empty();
                    if (data.students.length > 0) {
                        var student = data.students[0];
                        renderStudents(data.students, student._id);
                        setSelectedStudent(student);
                    } else {
                        $("#Enroll-select .student .name").text("请先添加学员");
                    }
                    return;
                }
            }
        });
    });

    //<span class="name"></span><span class="glyphicon glyphicon-menu-right pull-right" aria-hidden="true"></span>
    $("#Enroll-select .student").on("click", function(e) {
        $("#Enroll-student").show();
        $("#Enroll-select").hide();
    });

    $("#Enroll-student #btnNewStudent").on("click", function(e) {
        destroy();
        addValidation();
        $("#Enroll-student-edit").show();
        $("#Enroll-student-edit div.title .title").text("新建学员信息");
        $("#Enroll-student").hide();
        $('#studentInfo #studentName').val("");
        $('#studentInfo #mobile').val("");
        $('#studentInfo #sex').val(0);
        $('#studentInfo #School').val("");
        $('#studentInfo #className').val("");
        resetDropDown();
        newStudent = true;
    });

    $("#Enroll-student-edit .glyphicon").on("click", function(e) {
        $("#Enroll-student-edit").hide();
        $("#Enroll-student").show();
    });

    $("#Enroll-student .glyphicon").on("click", function(e) {
        $("#Enroll-student").hide();
        $("#Enroll-select").show();
    });

    $("#Enroll-student-edit #btnSave").on("click", function(e) {
        var validator = $('#studentInfo').data('formValidation').validate();
        if (validator.isValid()) {
            $("#Enroll-student-edit #btnSave").attr("disabled", "disabled");
            var postURI = "/studentInfo/add",
                postObj = {
                    name: $.trim($('#studentInfo #studentName').val()),
                    mobile: $.trim($('#studentInfo #mobile').val()),
                    sex: $('#studentInfo #sex').val() == "1" ? true : false,
                    School: $.trim($('#studentInfo #School').val()),
                    className: $.trim($('#studentInfo #className').val()),
                    gradeId: $('#studentInfo #grade').val(),
                    gradeName: $('#studentInfo #grade').find("option:selected").text(),
                    originalUrl: "/enroll/exam/" + $("#id").val()
                };
            if (!newStudent) {
                postURI = "/studentInfo/edit";
                postObj.id = editStudent._id;
            }
            $.post(postURI, postObj, function(data) {
                $("#Enroll-student-edit #btnSave").removeAttr("disabled");
                if (data && data.error) {
                    showAlert(data.error);
                    return;
                }
                var entity;
                if (newStudent) {
                    entity = data.student;
                    renderNewStudent(entity);
                } else {
                    entity = postObj;
                    entity._id = postObj.id;
                    resetOKStudent(entity);
                    $ul.find("#" + entity._id + " .name").text(entity.name);
                    $ul.find("#" + entity._id).data("obj", entity);
                }
                setSelectedStudent(entity);
            });
        }
    });

    $("#Enroll-student .student .student-list").on("click", "li .btn-edit", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).parent().data("obj");
        editStudent = entity;
        destroy();
        addValidation();
        $("#Enroll-student-edit").show();
        $("#Enroll-student-edit div.title .title").text("修改学员信息");
        $("#Enroll-student").hide();
        $('#studentInfo #studentName').val(entity.name);
        $('#studentInfo #mobile').val(entity.mobile);
        $('#studentInfo #sex').val(entity.sex ? 1 : 0);
        $('#studentInfo #School').val(entity.School);
        $('#studentInfo #className').val(entity.className);
        resetDropDown(null, function() {
            $('#studentInfo #grade').val(entity.gradeId);
        });
        newStudent = false;

        e.stopPropagation();
    });

    $("#Enroll-student .student .student-list").on("click", "li", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).data("obj");
        resetOKStudent(entity);
        setSelectedStudent(entity);
    });

    $("#Enroll-select #btnNext").on("click", function(e) {
        if ($("#Enroll-select .student .name").text() == "" || $("#Enroll-select #studentId").val() == "") {
            $("#Enroll-student").show();
            $("#Enroll-select").hide();
        } else {
            $("#Enroll-select #btnNext").attr("disabled", "disabled");
            var filter = { examId: $("#id").val(), studentId: $("#Enroll-select #studentId").val() };
            var examClassExamAreaId = $("#Enroll-select #examAreas").val();
            if (examClassExamAreaId) {
                //multi areas
                filter.examClassExamAreaId = examClassExamAreaId;
                $.post("/enroll/exam/enroll2", filter, function(data) {
                    if (data.sucess) {
                        $("#Enroll-select").hide();
                        showAlert("报名成功！", null, function() {
                            location.href = "/enroll/exam/card/" + $("#id").val();
                        });
                    } else {
                        $("#Enroll-select").hide();
                        showAlert(data.error, null, function() {
                            $("#bgBack").hide();
                        });
                        $("#Enroll-select #btnNext").removeAttr("disabled");
                    }
                });
            } else {
                //one exam area
                $.post("/enroll/exam/enroll", filter, function(data) {
                    if (data.sucess) {
                        $("#Enroll-select").hide();
                        showAlert("报名成功！", null, function() {
                            location.href = "/enroll/exam/card/" + $("#id").val();
                        });
                    } else {
                        $("#Enroll-select").hide();
                        showAlert(data.error, null, function() {
                            $("#bgBack").hide();
                        });
                        $("#Enroll-select #btnNext").removeAttr("disabled");
                    }
                });
            }
        }
    });

    $("#Enroll-select .title .glyphicon-remove-circle").on("click", function(e) {
        $("#bgBack").hide();
        $("#Enroll-select").hide();
    });
});

function renderExamAreas() {
    $.get("/enroll/exam/examClassExamAreas/" + $("#id").val(), function(data) {
        if (data && data.length > 0) {
            var d1 = $(document.createDocumentFragment()),
                d2 = $(document.createDocumentFragment());
            data.forEach(function(examClassExamArea) {
                d1.append('<div>' + examClassExamArea.examAreaName + ': 已报' + examClassExamArea.enrollCount + '&nbsp;&nbsp;共' + examClassExamArea.examCount + '</div>');
                d2.append("<option value='" + examClassExamArea._id + "'>" + examClassExamArea.examAreaName + "</option>");
            });
            $(".enroll .exam-detail .exam-info").append(d1);
            $("#Enroll-select #examAreas").append(d2);
        } else {
            $("#Enroll-select .examAreas").hide();
        }
    });
};

function destroy() {
    var validator = $('#studentInfo').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation() {
    setTimeout(function() {
        $('#studentInfo').formValidation({
            // List of fields and their validation rules
            fields: {
                'studentName': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '姓名不能为空'
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
    }, 0);
};

function setSelectedStudent(stdent) {
    $("#Enroll-student-edit").hide();
    $("#Enroll-student").hide();
    $("#Enroll-select").show();
    $("#Enroll-select .student .name").text(stdent.name);
    $("#Enroll-select #studentId").val(stdent._id);
};

function resetOKStudent(stdent) {
    var $ok = $ul.find(".glyphicon-ok");
    if ($ok.length > 0) {
        $ok.remove();
    }
    $ul.find("#" + stdent._id).prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
};

var $ul = $("#Enroll-student .student .student-list");

function renderStudents(students, id) {
    if (students.length > 0) {
        var d = $(document.createDocumentFragment());
        students.forEach(function(student) {
            var selected = "";
            if (student._id == id) {
                selected = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
            }
            var li = $('<li id=' + student._id + ' >' + selected + '<span class="name">' + student.name +
                '</span><button type="button" class="btn btn-primary btn-edit btn-xs pull-right"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button></li>');
            li.data("obj", student);
            d.append(li);
        });
        $ul.append(d);
    }
};

function renderNewStudent(student) {
    var $ok = $ul.find(".glyphicon-ok");
    if ($ok.length > 0) {
        $ok.remove();
    }
    if (student) {
        var li = $('<li id=' + student._id + ' ><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="name">' + student.name +
            '</span><button type="button" class="btn btn-primary btn-edit btn-xs pull-right"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button></li>');
        li.data("obj", student);
        $ul.append(li);
    }
};

function resetDropDown(id, callback) {
    $('#studentInfo').find("#grade option").remove();
    $.get("/enroll/grade/all", function(data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function(grade) {
                    var select = "";
                    if (grade._id == id) {
                        select = "selected";
                    }
                    $("#studentInfo #grade").append("<option " + select + " value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
            callback && callback();
        }
    });
};