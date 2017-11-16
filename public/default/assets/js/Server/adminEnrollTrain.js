var isNew = true;

$(document).ready(function () {
    $("#left_btnAdminEnrollTrain").addClass("active");

    $("#selectModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#selectModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    addValidation();
    resetDropDown();
});
//grade/getAll
function addValidation(callback) {
    $('#studentInfo').formValidation({
        declarative: false,
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
                        message: '实收培训费用不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            },
            'realMaterialPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '实收教材费用不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            }
        }
    });
};

$("#btnAddStudent").on("click", function (e) {
    var validator = $('#studentInfo').data('formValidation').validate();
    if (validator.isValid()) {
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
        });
    }
});

function enroll(enrollURI) {
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        var couponId;
        checkCoupons(function (index) {
            if (this.checked) {
                couponId = $(this).data("obj")._id;
            }
        });
        var postURI = enrollURI,
            postObj = {
                studentId: $('#enrollInfo #studentId').val(),
                studentName: $('#enrollInfo #studentName').val(),
                mobile: $('#enrollInfo #mobile').val(),
                trainId: $('#enrollInfo #trainId').val(),
                trainName: $('#enrollInfo #trainName').val(),
                trainPrice: $('#enrollInfo #trainPrice').val(),
                materialPrice: $('#enrollInfo #materialPrice').val(),
                discount: $('#enrollInfo #discount').val(),
                totalPrice: $('#enrollInfo #totalPrice').val(),
                realMaterialPrice: $('#enrollInfo #realMaterialPrice').val(),
                attributeId: $('#enrollInfo #attributeId').val(),
                attributeName: $('#enrollInfo #attributeName').val(),
                comment: $('#enrollInfo #comment').val(),
                schoolId: $('#enrollInfo #schoolId').val(),
                schoolArea: $('#enrollInfo #schoolArea').val(),
                couponId: couponId
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data && data.sucess) {
                showAlert("报名成功");
                $('#confirmModal .modal-footer .btn-default')
                    .off("click")
                    .on("click", function () {
                        location.href = "/admin/payList/" + data.orderId;
                    });
            } else {
                showAlert(data.error);
            }
        });
    }
};

$("#btnEnroll").on("click", function (e) {
    enroll("/admin/adminEnrollTrain/enroll");
});
$("#btnEnrollCheck").on("click", function (e) {
    enroll("/admin/adminEnrollTrain/enrollwithcheck");
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
                $('#enrollInfo #discount').val(entity.discount ? entity.discount : 100); //
                $('#selectModal').modal('hide');
                setPrice();
                renderCoupon();
                renderAttributeCoupon();
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

function openTrain(p) {
    $('#selectModal #selectModalLabel').text("选择课程");
    var filter = {
            name: $("#selectModal #InfoSearch #trainName").val(),
            grade: $("#selectModal #InfoSearch #grade").val(),
            subject: $("#selectModal #InfoSearch #subject").val(),
            category: $("#selectModal #InfoSearch #category").val(),
            schoolId: $("#selectModal #InfoSearch #schoolArea").val(),
            yearId: $("#selectModal #InfoSearch #searchYear").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>课程名称</th><th width="240px">年级/科目/难度</th><th width="180px">校区</th><th width="140px">培训费/教材费</th><th width="100px">报名情况</th></tr>');
    selfAjax("post", "/admin/trainClass/search?" + pStr, filter, function (data) {
        if (data && data.trainClasss.length > 0) {
            data.trainClasss.forEach(function (trainClass) {
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
            setSelectEvent($selectBody, function (entity) {
                $('#enrollInfo #trainName').val(entity.name); //
                $('#enrollInfo #trainId').val(entity._id); //
                $('#enrollInfo #trainPrice').val(entity.trainPrice); //
                $('#enrollInfo #materialPrice').val(entity.materialPrice); //
                $('#enrollInfo #realMaterialPrice').val(entity.materialPrice); //
                $('#enrollInfo #attributeId').val(entity.attributeId); //
                $('#enrollInfo #attributeName').val(entity.attributeName); //
                $('#selectModal').modal('hide');
                $('#enrollInfo #trainId').data("obj", entity);
                $('#enrollInfo #schoolId').val(entity.schoolId); //
                $('#enrollInfo #schoolArea').val(entity.schoolArea); //
                setPrice();
                renderCoupon();
                renderAttributeCoupon();
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

$("#panel_btnTrain").on("click", function (e) {
    openEntity = "train";
    $('#selectModal .modal-dialog').addClass("modal-lg");
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal examSearchInfo"><div class="col-md-20" style=""><div class="form-group">' +
        '<label for="trainName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="trainName" id="trainName"></div>' +
        '<div class="form-group"><label for="grade" class="control-label">年级:</label><select name="grade" id="grade" class="form-control"></select></div>' +
        '<div class="form-group" style="width:190px;"><label for="subject" class="control-label">科目:</label><select name="subject" id="subject" class="form-control"></select></div>' +
        '<div class="form-group"><label for="category" class="control-label">难度:</label><select name="category" id="category" class="form-control"></select></div></div>' +
        '<div class="col-md-20" style="margin-top: 10px;"><div class="form-group">' +
        '<label for="schoolArea" class="control-label">校区:</label>' +
        '<select name="schoolArea" id="schoolArea" class="form-control"></select></div><div class="form-group">' +
        '<label for="searchYear" class="control-label">年度:</label>' +
        '<select name="searchYear" id="searchYear" class="form-control"></select></div></div>' +
        '<div class="col-md-4" style=""><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    renderGradeSubjectCategoryYear(openTrain);
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function (e) {
    if (openEntity == "student") {
        openStudent();
    } else if (openEntity == "train") {
        openTrain();
    }
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    }
});

function setPrice() {
    var trainPrice = parseFloat($("#enrollInfo #trainPrice").val()) || 0,
        discount = parseFloat($("#enrollInfo #discount").val()),
        reducePrice = 0;
    checkCoupons(function (index) {
        if (this.checked) {
            var $this = $(this);
            reducePrice = $this.data("obj").reducePrice;
            trainPrice = trainPrice - reducePrice;
            discount = 100;
        }
    });
    realPrice = (trainPrice * discount / 100).toFixed(2);

    $("#enrollInfo #totalPrice").val(realPrice);
};

$("#enrollInfo #trainPrice").on("change blur", setPrice);
$("#enrollInfo #discount").on("change blur", setPrice);

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

var $couponSelectBody = $('.content #enrollInfo table tbody');

function renderCoupon() {
    var studentName = $("#enrollInfo #studentName").val(),
        className = $("#enrollInfo #trainName").val();
    if (studentName != "" && className != "") {
        searchCoupon();
        setPaingNextPre("#enrollInfo", searchCoupon);
    }
};

function renderAttributeCoupon() {
    var studentName = $("#enrollInfo #studentName").val(),
        className = $("#enrollInfo #trainName").val(),
        attributeid = $('#enrollInfo #attributeId').val();
    if (studentName != "" && className != "" && attributeid != "") {
        var filter = {
            studentId: $("#enrollInfo #studentId").val(),
            attributeId: attributeid
        }
        selfAjax("post", "/admin/adminEnrollTrain/checkAttributs", filter, function (coupon) {
            if (coupon) {
                var dateStr = moment(coupon.couponStartDate).format("YYYY-M-D") + " - " + moment(coupon.couponEndDate).format("YYYY-M-D");
                var $tr = $('<tr id=' + coupon._id + ' ><td><input disabled name="coupon" id="coupon" type="radio" value="' + coupon.reducePrice + '" /></td><td>' + (coupon.couponName || coupon.name) + '</td><td>' + dateStr +
                    '</td><td>' + coupon.reducePrice + '</td></tr>');
                $tr.find("#coupon").data("obj", coupon);
                $couponSelectBody.append($tr);
            }
        });
    }
}

function searchCoupon(p) {
    var obj = $("#enrollInfo #trainId").data("obj");
    var filter = {
            studentId: $("#enrollInfo #studentId").val(),
            gradeId: obj.gradeId,
            subjectId: obj.subjectId
        },
        pStr = p ? "p=" + p : "";
    $couponSelectBody.empty();
    selfAjax("post", "/admin/couponAssignList/searchUseful?" + pStr, filter, function (data) {
        if (data && data.couponAssigns.length > 0) {
            data.couponAssigns.forEach(function (coupon) {
                var dateStr = moment(coupon.couponStartDate).format("YYYY-M-D") + " - " + moment(coupon.couponEndDate).format("YYYY-M-D");
                var $tr = $('<tr id=' + coupon._id + ' ><td><input disabled name="coupon" id="coupon" type="radio" value="' + coupon.reducePrice + '" /></td><td>' + coupon.couponName + '</td><td>' + dateStr +
                    '</td><td>' + coupon.reducePrice + '</td></tr>');
                $tr.find("#coupon").data("obj", coupon);
                $couponSelectBody.append($tr);
            });
        }
        $(".couponModal #total").val(data.total);
        $(".couponModal #page").val(data.page);
        setPaging(".couponModal", data);
    });
};

function setPaingNextPre(modal, searchFuc) {
    $(modal + " .paging .prepage").off("click").on("click", function (e) {
        var page = parseInt($(modal + " #page").val()) - 1;
        searchFuc(page);
    });

    $(modal + " .paging .nextpage").off("click").on("click", function (e) {
        var page = parseInt($(modal + " #page").val()) + 1;
        searchFuc(page);
    });
};

$("#enrollInfo table #gridBody").on("change", "tr td input", function () {
    setPrice();
});

$("#enrollInfo #onsale").on("change", function (e) {
    if ($("#enrollInfo #onsale").val() == 0) {
        checkCoupons(function (index) {
            if (this.checked) {
                this.checked = false;
            }
            $(this).attr("disabled", "disabled");
        });
    } else {
        checkCoupons(function (index) {
            $(this).removeAttr("disabled");
        });
    }
    setPrice();
});

function checkCoupons(func) {
    $(":input[name='coupon']").each(func);
};

function renderGradeSubjectCategoryYear(callback) {
    $('#selectModal #InfoSearch').find("#grade option").remove();
    $('#selectModal #InfoSearch').find("#subject option").remove();
    $('#selectModal #InfoSearch').find("#category option").remove();
    // $('#selectModal #InfoSearch').find("#searchYear option").remove();
    selfAjax("get", "/admin/trainClass/gradesubjectcategoryschoolyear", null, function (data) {
        if (data) {
            if (data.grades && data.grades.length > 0) {
                data.grades.forEach(function (grade) {
                    $("#selectModal #InfoSearch #grade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
            if (data.subjects && data.subjects.length > 0) {
                data.subjects.forEach(function (subject) {
                    $("#selectModal #InfoSearch #subject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
                });
            }
            if (data.categorys && data.categorys.length > 0) {
                data.categorys.forEach(function (category) {
                    $("#selectModal #InfoSearch #category").append("<option value='" + category._id + "'>" + category.name + "</option>");
                });
            }
            if (data.schools && data.schools.length > 0) {
                data.schools.forEach(function (school) {
                    var select = "";
                    if ($("#adminSchoolId").val() == school._id) {
                        select = "selected";
                    }
                    $("#selectModal #InfoSearch #schoolArea").append("<option value='" + school._id + "' " + select + ">" + school.name + "</option>");
                });
            }
            if (data.years && data.years.length > 0) {
                data.years.forEach(function (year) {
                    var select = "";
                    if (year.isCurrentYear) {
                        select = "selected";
                    }
                    $("#selectModal #InfoSearch #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
                });
            }
            callback();
        }
    });
};
// $.ajax({
//             type: "POST",
//             data: "sdfsdfsdfsdf",
//             url: "/admin/pay/notify",
//             contentType: false,
//             processData: false,
//         }).then(function(data) {
//             location.href = "/admin/score";
//         });