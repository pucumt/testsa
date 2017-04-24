var isNew = true;

$(document).ready(function() {
    $("#left_btnAdminEnrollTrain").addClass("active");
    addValidation();
    resetDropDown();
});
//grade/getAll
function addValidation(callback) {
    $('#studentInfo').formValidation({
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
                        max: 11,
                        message: '手机号必须是11位'
                    },
                    integer: {
                        message: '填写的不是数字',
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

$("#btnAddStudent").on("click", function(e) {
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
        $.post(postURI, postObj, function(data) {
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
        checkCoupons(function(index) {
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
                comment: $('#enrollInfo #comment').val(),
                couponId: couponId
            };
        $.post(postURI, postObj, function(data) {
            if (data && data.sucess) {
                showAlert("报名成功");
                $('#confirmModal .modal-footer .btn-default')
                    .off("click")
                    .on("click", function() {
                        location.href = "/admin/payList/" + data.orderId;
                    });
            } else {
                showAlert(data.error);
            }
        });
    }
};

$("#btnEnroll").on("click", function(e) {
    enroll("/admin/adminEnrollTrain/enroll");
});
$("#btnEnrollCheck").on("click", function(e) {
    enroll("/admin/adminEnrollTrain/enrollwithcheck");
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
    $.post("/admin/studentInfo/search?" + pStr, filter, function(data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function(student) {
                student.School = "";
                student.className = "";
                var sex = student.sex ? "女" : "男";
                $selectBody.append('<tr data-obj=' + JSON.stringify(student) + '><td>' + student.name +
                    '</td><td>' + student.mobile + '</td><td>' + sex + '</td></tr>');
            });
            setSelectEvent($selectBody, function(entity) {
                $('#enrollInfo #studentName').val(entity.name); //
                $('#enrollInfo #studentId').val(entity._id); //
                $('#enrollInfo #mobile').val(entity.mobile); //
                $('#enrollInfo #sex').val(entity.sex ? 1 : 0); //
                $('#enrollInfo #discount').val(entity.discount ? entity.discount : 100); //
                $('#selectModal').modal('hide');
                setPrice();
                renderCoupon();
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
    var filter = { name: $("#selectModal #InfoSearch #studentName").val(), mobile: $("#selectModal #InfoSearch #mobile").val() },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>课程名称</th><th width="240px">年级/科目/类型</th><th width="180px">培训费/教材费</th><th width="120px">报名情况</th></tr>');
    $.post("/admin/trainClass/search?" + pStr, filter, function(data) {
        if (data && data.trainClasss.length > 0) {
            data.trainClasss.forEach(function(trainClass) {
                trainClass.courseContent = "";
                var grade = trainClass.gradeName + "/" + trainClass.subjectName + "/" + trainClass.categoryName,
                    price = trainClass.trainPrice + "/" + trainClass.materialPrice,
                    countStr = trainClass.enrollCount + '/' + trainClass.totalStudentCount;
                $selectBody.append('<tr data-obj=' + JSON.stringify(trainClass) + '><td>' + trainClass.name +
                    '</td><td>' + grade +
                    '</td><td>' + price + '</td><td>' + countStr + '</td></tr>');
            });
            setSelectEvent($selectBody, function(entity) {
                $('#enrollInfo #trainName').val(entity.name); //
                $('#enrollInfo #trainId').val(entity._id); //
                $('#enrollInfo #trainPrice').val(entity.trainPrice); //
                $('#enrollInfo #materialPrice').val(entity.materialPrice); //
                $('#enrollInfo #realMaterialPrice').val(entity.materialPrice); //
                $('#selectModal').modal('hide');
                $('#enrollInfo #trainId').data("obj", entity);
                setPrice();
                renderCoupon();
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
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="trainName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="trainName" id="trainName"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openTrain();
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
    var trainPrice = parseFloat($("#enrollInfo #trainPrice").val()) || 0,
        discount = parseFloat($("#enrollInfo #discount").val()),
        reducePrice = 0;
    checkCoupons(function(index) {
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
    $.get("/admin/grade/getAll", function(data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function(grade) {
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

function searchCoupon(p) {
    var obj = $("#enrollInfo #trainId").data("obj");
    var filter = {
            studentId: $("#enrollInfo #studentId").val(),
            gradeId: obj.gradeId,
            subjectId: obj.subjectId
        },
        pStr = p ? "p=" + p : "";
    $couponSelectBody.empty();
    $.post("/admin/couponAssignList/searchUseful?" + pStr, filter, function(data) {
        if (data && data.couponAssigns.length > 0) {
            data.couponAssigns.forEach(function(coupon) {
                var dateStr = moment(coupon.couponStartDate).format("YYYY-M-D") + " - " + moment(coupon.couponEndDate).format("YYYY-M-D");
                $couponSelectBody.append('<tr id=' + coupon._id + ' ><td><input disabled name="coupon" data-obj=' + JSON.stringify(coupon) + ' id="coupon" type="radio" value="' + coupon.reducePrice + '" /></td><td>' + coupon.couponName + '</td><td>' + dateStr +
                    '</td><td>' + coupon.reducePrice + '</td></tr>');
            });
        }
        $(".couponModal #total").val(data.total);
        $(".couponModal #page").val(data.page);
        setPaging(".couponModal", data);
    });
};

function setPaingNextPre(modal, searchFuc) {
    $(modal + " .paging .prepage").off("click").on("click", function(e) {
        var page = parseInt($(modal + " #page").val()) - 1;
        searchFuc(page);
    });

    $(modal + " .paging .nextpage").off("click").on("click", function(e) {
        var page = parseInt($(modal + " #page").val()) + 1;
        searchFuc(page);
    });
};

$("#enrollInfo table #gridBody").on("change", "tr td input", function() {
    setPrice();
});

$("#enrollInfo #onsale").on("change", function(e) {
    if ($("#enrollInfo #onsale").val() == 0) {
        checkCoupons(function(index) {
            if (this.checked) {
                this.checked = false;
            }
            $(this).attr("disabled", "disabled");
        });
    } else {
        checkCoupons(function(index) {
            $(this).removeAttr("disabled");
        });
    }
    setPrice();
});

function checkCoupons(func) {
    $(":input[name='coupon']").each(func);
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