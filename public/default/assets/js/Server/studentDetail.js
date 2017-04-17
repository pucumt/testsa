var isNew = true;

$(document).ready(function() {
    $("#left_btnStudent").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    renderStudent();
    addValidation();
    renderGrids();
});

/***----------studentInfo------------ */
function resetDropDown(id) {
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
        }
    });
};

function renderStudent() {
    var id = $("#id").val();
    $.get("/admin/studentInfo/" + id, function(data) {
        if (data) {
            $("#studentInfo #studentName").val(data.name);
            $("#studentInfo #mobile").val(data.mobile);
            $("#studentInfo #studentNo").val(data.studentNo);
            $("#studentInfo #sex").val(data.sex ? 1 : 0);
            resetDropDown(data.gradeId);
            renderAccount(data.accountId);
            $("#studentInfo #discount").val(data.discount);
            $("#studentInfo #School").val(data.School);
            $("#studentInfo #address").val(data.address);
        }
    });
};

function renderAccount(id) {
    $.get("/admin/studentAccount/" + id, function(data) {
        if (data) {
            $(".mainModal .panel-heading .account").text(data.name);
        }
    });
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

$("#studentInfo #btnSave").on("click", function(e) {
    var validator = $('#studentInfo').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/studentInfo/edit",
            postObj = {
                name: $('#studentInfo #studentName').val(),
                mobile: $('#studentInfo #mobile').val(),
                studentNo: $('#studentInfo #studentNo').val(),
                sex: $('#studentInfo #sex').val(),
                School: $('#studentInfo #School').val(),
                address: $('#studentInfo #address').val(),
                discount: $('#studentInfo #discount').val(),
                id: $('#id').val(),
                gradeId: $('#studentInfo #grade').val(),
                gradeName: $('#studentInfo #grade').find("option:selected").text(),
            };
        $.post(postURI, postObj, function(data) {
            if (data.error) {
                showAlert(data.error);
            } else {
                showAlert("保存成功");
            }
        });
    }
});
/***----------studentInfo end------------ */

//------------search funfunction-----------
var $classSelectBody = $('.content .classModal table tbody');
var $examSelectBody = $('.content .examModal table tbody');
var $couponSelectBody = $('.content .couponModal table tbody');

function renderGrids() {
    searchClass();
    setPaingNextPre(".classModal", searchClass);

    searchExam();
    setPaingNextPre(".examModal", searchExam);

    searchCoupon();
    setPaingNextPre(".couponModal", searchCoupon);
};

function searchClass(p) {
    var filter = {
            studentId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $classSelectBody.empty();
    $.post("/admin/adminEnrollTrain/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollTrains.length > 0) {
            data.adminEnrollTrains.forEach(function(trainOrder) {
                $classSelectBody.append('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' + trainOrder.studentName +
                    '</td><td>' + trainOrder.trainName + '</td><td>' + getTrainOrderStatus(trainOrder.isSucceed) + '</td></tr>');
            });
        }
        $(".classModal #total").val(data.total);
        $(".classModal #page").val(data.page);
        setPaging(".classModal", data);
    });
};

function searchExam(p) {
    var filter = {
            studentId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $examSelectBody.empty();
    $.post("/admin/adminEnrollExam/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollExams.length > 0) {
            data.adminEnrollExams.forEach(function(examOrder) {
                $examSelectBody.append('<tr id=' + examOrder._id + ' data-obj=' +
                    JSON.stringify(examOrder) + '><td>' + examOrder._id + '</td><td>' + examOrder.studentName +
                    '</td><td>' + examOrder.examName + '</td><td>' + getTrainOrderStatus(examOrder.isSucceed) +
                    '</td><td>' + (examOrder.score || '') + '</td></tr>');
            });
        }
        $(".examModal #total").val(data.total);
        $(".examModal #page").val(data.page);
        setPaging(".examModal", data);
    });
};

function searchCoupon(p) {
    var filter = {
            studentId: $("#id").val()
        },
        pStr = p ? "p=" + p : "";
    $couponSelectBody.empty();
    $.post("/admin/couponAssignList/search?" + pStr, filter, function(data) {
        if (data && data.couponAssigns.length > 0) {
            data.couponAssigns.forEach(function(coupon) {
                var dateStr = moment(coupon.couponStartDate).format("YYYY-M-D") + " - " + moment(coupon.couponEndDate).format("YYYY-M-D");
                $couponSelectBody.append('<tr id=' + coupon._id + '><td>' + coupon.couponName + '</td><td>' + dateStr +
                    '</td><td>' + coupon.gradeName + '</td><td>' + coupon.subjectName + '</td><td>' + (coupon.isUsed ? "已使用" : "未使用") + '</td><td>' + coupon.reducePrice + '</td></tr>');
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
//------------end------------


$(".examModal #gridBody").on("click", "tr", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).data("obj");
    $('#myModal #myModalLabel').text("考试信息");
    $('#myModal #name').text(entity.examName);
    var filter = { id: entity._id };
    $.post("/admin/adminEnrollExam/searchExam", filter, function(data) {
        if (data) {
            var examDate = data.examDate && moment(data.examDate).format("YYYY-M-D");
            $('#myModal #examDate').text(examDate);
            $('#myModal #examTime').text(data.examTime);
            $('#myModal #schoolArea').text(data.schoolArea);
            $('#myModal #classRoomName').text(data.classRoomName);
            $('#myModal #examNo').text(data.examNo);
            $('#myModal #score').text(data.score);
            $('#myModal').modal({ backdrop: 'static', keyboard: false });
        }
    });
});