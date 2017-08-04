var isNew = true;

$(document).ready(function() {
    $("#left_btnChangeClass").addClass("active");
    addValidation();
    checkAttributeCoupon();
});

function addValidation(callback) {
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
            'trainName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '课程名称不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '课程名称在2-30个字符之间'
                    }
                }
            },
            'trainPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '培训费不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            },
            'materialPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '教材费不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            },
            'discount': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '折扣不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字',
                    }
                }
            },
            'totalPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '总费用不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            }
        }
    });
};

function checkAttributeCoupon() {
    if ($('#enrollInfo #attributeId').val() != "") {
        selfAjax("post", "/admin/adminEnrollTrain/isAttributCouponUsed", {
            studentId: $('#enrollInfo #studentId').val(),
            attributeId: $('#enrollInfo #attributeId').val()
        }, function(data) {
            if (data) {
                $('#enrollInfo #comment').val("订单使用优惠券：" + data);
            }
        });
    }
};

$("#btnEnroll").on("click", function(e) {
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/adminEnrollTrain/changeClass",
            postObj = {
                studentId: $('#enrollInfo #studentId').val(),
                studentName: $('#enrollInfo #studentName').val(),
                mobile: $('#enrollInfo #mobile').val(),
                trainId: $('#enrollInfo #trainId').val(),
                oldTrainId: $('#enrollInfo #oldTrainId').val(),
                attributeId: $('#enrollInfo #attributeId').val(),
                attributeName: $('#enrollInfo #attributeName').val(),
                trainName: $('#enrollInfo #trainName').val(),
                trainPrice: $('#enrollInfo #trainPrice').val(),
                materialPrice: $('#enrollInfo #materialPrice').val(),
                discount: $('#enrollInfo #discount').val(),
                totalPrice: $('#enrollInfo #totalPrice').val(),
                realMaterialPrice: $('#enrollInfo #realMaterialPrice').val(),
                oldOrderId: $('#enrollInfo #oldOrderId').val(),
                comment: $('#enrollInfo #comment').val()
            };
        selfAjax("post", postURI, postObj, function(data) {
            if (data && data.sucess) {
                showAlert("调班成功");
                $("#confirmModal .modal-footer .btn-default").on("click", function(e) {
                    location.href = "/admin/trainOrderList";
                });
            } else {
                showAlert(data.error);
            }
        });
    }
});

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

function openStudent(p) {
    $('#selectModal #selectModalLabel').text("选择学生");
    var filter = { name: $("#selectModal #InfoSearch #studentName").val(), mobile: $("#selectModal #InfoSearch #mobile").val() },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>学生姓名</th><th width="120px">电话号码</th><th width="120px">性别</th></tr>');
    selfAjax("post", "/admin/studentInfo/search?" + pStr, filter, function(data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function(student) {
                var sex = student.sex ? "女" : "男";
                var $tr = $('<tr><td>' + student.name +
                    '</td><td>' + student.mobile + '</td><td>' + sex + '</td></tr>');
                $tr.data("obj", student);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function(entity) {
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
        $('#selectModal').modal({ backdrop: 'static', keyboard: false });
    });
};

function openTrain(p) {
    $('#selectModal #selectModalLabel').text("选择课程");
    var filter = {
            name: $("#selectModal #InfoSearch #trainName").val(),
            grade: $("#selectModal #InfoSearch #grade").val(),
            subject: $("#selectModal #InfoSearch #subject").val(),
            category: $("#selectModal #InfoSearch #category").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>课程名称</th><th width="240px">年级/科目/难度</th><th width="180px">校区</th><th width="140px">培训费/教材费</th><th width="100px">报名情况</th></tr>');
    selfAjax("post", "/admin/trainClass/search?" + pStr, filter, function(data) {
        if (data && data.trainClasss.length > 0) {
            data.trainClasss.forEach(function(trainClass) {
                trainClass.courseContent = "";
                var grade = trainClass.gradeName + "/" + trainClass.subjectName + "/" + trainClass.categoryName,
                    price = trainClass.trainPrice + "/" + trainClass.materialPrice,
                    countStr = trainClass.enrollCount + '/' + trainClass.totalStudentCount;
                var $tr = $('<tr><td>' + trainClass.name +
                    '</td><td>' + grade +
                    '</td><td>' + trainClass.schoolArea +
                    '</td><td>' + price + '</td><td>' + countStr + '</td></tr>');
                $tr.data("obj", trainClass);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function(entity) {
                $('#enrollInfo #trainName').val(entity.name); //
                $('#enrollInfo #trainId').val(entity._id); //
                $('#enrollInfo #trainPrice').val(entity.trainPrice); //
                $('#enrollInfo #materialPrice').val(entity.materialPrice); //
                $('#selectModal').modal('hide');
                setPrice();
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({ backdrop: 'static', keyboard: false });
    });
};

var openEntity = "student";
$("#panel_btnStudent").on("click", function(e) {
    openEntity = "student";
    $('#selectModal .modal-dialog').removeClass("modal-lg");
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="studentName" class="control-label">姓名:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="studentName" id="studentName"></div></div>' +
        '<div class="col-md-8"><div class="form-group"><label for="mobile" class="control-label">手机号:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="mobile" id="mobile"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openStudent();
});

$("#panel_btnTrain").on("click", function(e) {
    openEntity = "train";
    $('#selectModal .modal-dialog').addClass("modal-lg");
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal examSearchInfo"><div class="col-md-20"><div class="form-group">' +
        '<label for="trainName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="trainName" id="trainName"></div>' +
        '<div class="form-group"><label for="grade" class="control-label">年级:</label><select name="grade" id="grade" class="form-control"></select></div>' +
        '<div class="form-group"><label for="subject" class="control-label">科目:</label><select name="subject" id="subject" class="form-control"></select></div>' +
        '<div class="form-group"><label for="category" class="control-label">难度:</label><select name="category" id="category" class="form-control"></select></div></div>' +
        '<div class="col-md-4"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    renderGradeSubjectCategory(openTrain);
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function(e) {
    if (openEntity == "student") {
        openStudent();
    } else if (openEntity == "train") {
        openTrain();
    }
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    }
});

function setPrice() {
    var trainPrice = parseFloat($("#enrollInfo #trainPrice").val()),
        discount = parseFloat($("#enrollInfo #discount").val()),
        realPrice = (trainPrice * discount / 100).toFixed(2);

    $("#enrollInfo #totalPrice").val(realPrice);
};

$("#enrollInfo #trainPrice").on("change blur", setPrice);
$("#enrollInfo #discount").on("change blur", setPrice);

function renderGradeSubjectCategory(callback) {
    $('#selectModal #InfoSearch').find("#grade option").remove();
    $('#selectModal #InfoSearch').find("#subject option").remove();
    $('#selectModal #InfoSearch').find("#category option").remove();
    selfAjax("get", "/admin/trainClass/gradesubjectcategoryyear", {}, function(data) {
        if (data) {
            if (data.grades && data.grades.length > 0) {
                data.grades.forEach(function(grade) {
                    $("#selectModal #InfoSearch #grade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
            if (data.subjects && data.subjects.length > 0) {
                data.subjects.forEach(function(subject) {
                    $("#selectModal #InfoSearch #subject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
                });
            }
            if (data.categorys && data.categorys.length > 0) {
                data.categorys.forEach(function(category) {
                    $("#selectModal #InfoSearch #category").append("<option value='" + category._id + "'>" + category.name + "</option>");
                });
            }
            callback();
        }
    });
};