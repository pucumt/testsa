var newStudent = true,
    editStudent;
$(document).ready(function() {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/enrollClass";
    });

    $("#btnEnroll").on("click", function(e) {
        $.get("/enroll/students", function(data) {
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
        $("#Enroll-student-edit div.title .title").text("新建学生信息");
        $("#Enroll-student").hide();
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
            var postURI = "/studentInfo/add",
                postObj = {
                    name: $('#studentInfo #studentName').val(),
                    mobile: $('#studentInfo #mobile').val(),
                    sex: $('#studentInfo #sex').val() == "1" ? true : false,
                    School: $('#studentInfo #School').val(),
                    address: $('#studentInfo #address').val(),
                    gradeId: $('#studentInfo #grade').val(),
                    gradeName: $('#studentInfo #grade').find("option:selected").text(),
                };
            if (!newStudent) {
                postURI = "/studentInfo/edit";
                postObj.id = editStudent._id;
            }
            $.post(postURI, postObj, function(data) {
                var entity;
                if (newStudent) {
                    entity = data.student;
                    renderNewStudent(entity);
                } else {
                    entity = postObj;
                    entity._id = postObj.id;
                    resetOKStudent(entity);
                    $ul.find("#" + entity._id).data("obj", entity);
                }
                setSelectedStudent(entity);
            });
        }
    });

    $("#Enroll-student .student .student-list").on("click", "li .glyphicon-edit", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).parent().data("obj");
        editStudent = entity;
        destroy();
        addValidation();
        $("#Enroll-student-edit").show();
        $("#Enroll-student-edit div.title .title").text("修改学生信息");
        $("#Enroll-student").hide();
        $('#studentInfo #studentName').val(entity.name);
        $('#studentInfo #mobile').val(entity.mobile);
        $('#studentInfo #sex').val(entity.sex ? 1 : 0);
        $('#studentInfo #School').val(entity.School);
        $('#studentInfo #address').val(entity.address);
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
        location.href = "/enroll/order?classId=" + $("#id").val() + "&studentId=" + $("#Enroll-select #studentId").val();
    });

    $("#Enroll-select .title .glyphicon-remove-circle").on("click", function(e) {
        $("#bgBack").hide();
        $("#Enroll-select").hide();
    });
});

function destroy() {
    var validator = $('#studentInfo').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation() {
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
            d.append('<li id=' + student._id + ' data-obj=' + JSON.stringify(student) + '>' + selected + '<span class="name">' + student.name +
                '</span><span class="glyphicon glyphicon-edit pull-right" aria-hidden="true"></span></li>');
        });
        $ul.append(d);
    }
};

function renderNewStudent(student) {
    var $ok = $ul.find(".glyphicon-ok");
    if ($ok.length > 0) {
        $ok.remove();
    }
    if (students.length > 0) {
        $ul.append('<li id=' + student._id + ' data-obj=' + JSON.stringify(student) + '><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="name">' + student.name +
            '</span><span class="glyphicon glyphicon-edit pull-right" aria-hidden="true"></span></li>');
    }
};

function resetDropDown(id, callback) {
    $('#studentInfo').find("#grade option").remove();
    $.get("/admin/grade/getAll", function(data) {
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