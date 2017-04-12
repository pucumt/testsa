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
        $("#Enroll-student-edit div.title .title").text("新建学生信息");
        $("#Enroll-student").hide();
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

    $("#Enroll-student .student .student-list").on("click", "li .btn-delete", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).parent().data("obj");
        $("#bgBack").show();
        showComfirm("真的要删除" + entity.name + "吗？", null, function() {
            $("#bgBack").hide();
        });

        $("#btnConfirmSave").off("click").on("click", function(e) {
            $.post("/studentInfo/delete", {
                id: entity._id
            }, function(data) {
                if (data.sucess) {
                    $(obj).parents("li").remove();
                    showAlert("删除成功", null, function() {
                        $("#bgBack").hide();
                    });
                }
            });
        });

        e.stopPropagation();
    });


    $("#Enroll-student-edit .glyphicon").on("click", function(e) {
        $("#Enroll-student-edit").hide();
        $("#Enroll-student").show();
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
                    originalUrl: "/personalCenter/students"
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
                    $ul.find("#" + entity._id + " .name").text(entity.name);
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
            d.append('<li id=' + student._id + ' data-obj=' + JSON.stringify(student) + '><span class="name">' + student.name +
                '</span><button type="button" class="btn btn-danger btn-delete btn-xs pull-right"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button><button type="button" style="margin-right:30px" class="btn btn-danger btn-edit btn-xs pull-right"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button></li>');
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
        $ul.append('<li id=' + student._id + ' data-obj=' + JSON.stringify(student) + '><span class="name">' + student.name +
            '</span><button type="button" class="btn btn-danger btn-xs btn-delete pull-right"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button><button type="button" style="margin-right:30px" class="btn btn-danger btn-edit btn-xs pull-right"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button></li>');
    }
};