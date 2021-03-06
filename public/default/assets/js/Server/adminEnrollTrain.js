var isNew = true,
    isTrain = true;

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
        });
    }
});

function enroll(enrollURI) {
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        var couponIds = [];
        checkCoupons(function (index) {
            if (this.checked) {
                couponIds.push($(this).data("obj")._id);
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
                couponIds: JSON.stringify(couponIds)
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

var openEntity = "student";
$("#panel_btnStudent").on("click", function (e) {
    openEntity = "student";

    renderStudentSearchCriteria();
});

$("#panel_btnTrain").on("click", function (e) {
    openEntity = "train";

    renderTrainSearchCriteria();
});

$("#panel_btnSchool").on("click", function (e) {
    openEntity = "school";

    renderSchoolSearchCriteria();
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function (e) {
    if (openEntity == "student") {
        openStudent();
    } else if (openEntity == "train") {
        openTrain();
    } else if (openEntity == "school") {
        openSchool();
    }
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    } else if (openEntity == "school") {
        openSchool();
    }
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    } else if (openEntity == "school") {
        openSchool();
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
            // discount = 100;
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
                var $tr = $('<tr id=' + coupon._id + ' ><td><input name="coupon" id="coupon" type="checkbox" value="' + coupon.reducePrice + '" /></td><td>' + coupon.couponName + '</td><td>' + dateStr +
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

// $("#enrollInfo #onsale").on("change", function (e) {
//     if ($("#enrollInfo #onsale").val() == 0) {
//         checkCoupons(function (index) {
//             if (this.checked) {
//                 this.checked = false;
//             }
//             $(this).attr("disabled", "disabled");
//         });
//     } else {
//         checkCoupons(function (index) {
//             $(this).removeAttr("disabled");
//         });
//     }
//     setPrice();
// });

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