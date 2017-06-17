var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainOrder").addClass("active");
    $("#btnReturn").attr("href", "/admin/trainOrderList");

    renderOrderDetail();
});

//------------search funfunction
function getPayway(way) {
    switch (way) {
        case 0:
            return "现金";
        case 1:
            return "刷卡";
        case 2:
            return "转账";
        case 8:
            return "支付宝";
        case 9:
            return "微信";
        case 6:
            return "在线";
        case 7:
            return "在线";
    }
    return "";
};

function renderOrderDetail() {
    selfAjax("post", "/admin/adminEnrollTrain/getorder", { id: $("#id").val() }, function(data) {
        if (data) {
            if (!data.error) {
                $(".mainModal #studentId").val(data.studentId);
                $(".mainModal #studentName").val(data.studentName);
                $(".mainModal .trainName").html(data.trainName);
                $(".mainModal .orderDate").html(moment(data.orderDate).format("YYYY-MM-DD HH:mm"));
                $(".mainModal .totalPrice").html(data.totalPrice);
                $(".mainModal .realMaterialPrice").html(data.realMaterialPrice);
                $(".mainModal .rebatePrice").html(data.rebatePrice);
                $(".mainModal .payWay").html(getPayway(data.payWay));
                $(".mainModal #comment").val(data.comment || "");
                $(".mainModal .fromId").html(data.fromId || "");
            } else {
                showAlert(data.error);
            }
        }
    });
};
//------------end


$(".mainModal #btnSave").on("click", function(e) {
    var postURI = "/admin/adminEnrollTrain/changecomment",
        postObj = {
            id: $("#id").val(),
            comment: $.trim($('.mainModal #comment').val())
        };
    selfAjax("post", postURI, postObj, function(data) {
        if (data.sucess) {
            location.href = location.href;
        } else {
            showAlert(data.error);
        }
    });
});

$(".mainModal #btnChangeStudent").on("click", function(e) {
    var postURI = "/admin/adminEnrollTrain/changeStudent",
        postObj = {
            id: $("#id").val(),
            studentId: $(".mainModal #studentId").val(),
            studentName: $(".mainModal #studentName").val()
        };
    selfAjax("post", postURI, postObj, function(data) {
        if (data.sucess) {
            location.href = location.href;
        } else {
            showAlert(data.error);
        }
    });
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
    selfAjax("post", "/admin/studentInfo/search?" + pStr, filter, function(data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function(student) {
                student.School = "";
                student.className = "";
                var sex = student.sex ? "女" : "男";
                var $tr = $('<tr><td>' + student.name +
                    '</td><td>' + student.mobile + '</td><td>' + sex + '</td></tr>');
                $tr.data("obj", student);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function(entity) {
                $('.mainModal #studentName').val(entity.name); //
                $('.mainModal #studentId').val(entity._id); //
                $('#selectModal').modal('hide');
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


$("#selectModal #InfoSearch").on("click", "#btnSearch", function(e) {
    openStudent();
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    openStudent(page);
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    openStudent(page);
});