var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter";
    });
    loadStudents();

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

    $("#Enroll-student .student .student-list").on("click", "li .btn-edit", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).parent().data("obj");
        editStudent = entity;
        destroy();
        addValidation();
        $("#Enroll-student-edit").show();
        $("#Enroll-student-edit div.title .title").text("修改学员信息");
        $("#Enroll-student").hide();
        $('#studentInfo #studentName').val(decodeURI(entity.name));
        $('#studentInfo #mobile').val(entity.mobile);
        $('#studentInfo #sex').val(entity.sex ? 1 : 0);
        $('#studentInfo #School').val(decodeURI(entity.School));
        $('#studentInfo #className').val(decodeURI(entity.className));
        resetDropDown(null, function() {
            $('#studentInfo #grade').val(entity.gradeId);
        });
        newStudent = false;

        e.stopPropagation();
    });


    $("#Enroll-student-edit .glyphicon").on("click", function(e) {
        $("#Enroll-student-edit").hide();
        $("#Enroll-student").show();
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
                    originalUrl: "/personalCenter/students"
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
                    $ul.find("#" + entity._id + " .name").text(entity.name);
                    entity.name = encodeURI(entity.name);
                    entity.School = encodeURI(entity.School);
                    entity.className = encodeURI(entity.className);
                    $ul.find("#" + entity._id).data("obj", entity);
                }
                $("#Enroll-student-edit").hide();
                $("#Enroll-student").show();
            });
        }
    });
});

function loadStudents() {
    $.post("/enroll/students", { originalUrl: "/personalCenter/students" }, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            if (data.students) {
                if (data.students.length > 0) {
                    var student = data.students[0];
                    renderStudents(data.students, student._id);
                }
                return;
            }
        }
    });
};

var $ul = $("#Enroll-student .student .student-list");

function renderStudents(students) {
    if (students.length > 0) {
        var d = $(document.createDocumentFragment());
        students.forEach(function(student) {
            student.name = encodeURI(student.name);
            student.School = encodeURI(student.School);
            student.className = encodeURI(student.className);
            d.append('<li id=' + student._id + ' data-obj=' + JSON.stringify(student) + '><span class="name">' + decodeURI(student.name) +
                '</span><button type="button" style="margin-right:30px" class="btn btn-primary btn-edit btn-xs pull-right"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button></li>');
        });
        $ul.append(d);
    }
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

function renderNewStudent(student) {
    var $ok = $ul.find(".glyphicon-ok");
    if ($ok.length > 0) {
        $ok.remove();
    }
    if (student) {
        student.name = encodeURI(student.name);
        student.School = encodeURI(student.School);
        student.className = encodeURI(student.className);
        $ul.append('<li id=' + student._id + ' data-obj=' + JSON.stringify(student) + '><span class="name">' + decodeURI(student.name) +
            '</span><button type="button" class="btn btn-primary btn-xs btn-delete pull-right"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button><button type="button" style="margin-right:30px" class="btn btn-primary btn-edit btn-xs pull-right"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button></li>');
    }
};