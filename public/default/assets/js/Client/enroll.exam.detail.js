var newStudent = true;
$(document).ready(function() {
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
            var postURI = "/admin/studentInfo/add",
                postObj = {
                    name: $('#studentInfo #studentName').val(),
                    mobile: $('#studentInfo #mobile').val(),
                    sex: $('#studentInfo #sex').val(),
                    School: $('#studentInfo #School').val(),
                    address: $('#studentInfo #address').val(),
                    gradeId: $('#studentInfo #grade').val(),
                    gradeName: $('#studentInfo #grade').find("option:selected").text(),
                };
            if (!newStudent) {
                postURI = "/admin/studentInfo/edit";
                postObj.id = $('#id').val();
            }
            $.post(postURI, postObj, function(data) {
                var entity;
                if (newStudent) {
                    entity = data.student;
                } else {
                    entity = postObj;
                    entity._id = postObj.id;
                }
                setSelectedStudent(entity);
            });
        }
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

function setSelectedStudent(entity) {
    $("#Enroll-student-edit").hide();
    $("#Enroll-student").hide();
    $("#Enroll-select").show();
    $("#Enroll-select .student .name").text(entity.name);
    $("#Enroll-select #studentId").val(entity._id);
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
            d.append('<li>' + selected + '<span class="name">' + student.name +
                '</span><span class="glyphicon glyphicon-menu-right pull-right" aria-hidden="true"></span></li>');
        });
    }

};