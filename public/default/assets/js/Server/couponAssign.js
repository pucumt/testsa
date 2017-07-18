var isNew = true;

$(document).ready(function() {
    $("#left_btnCoupon").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
    renderGrade();
});

function renderGrade() {
    $('#InfoSearch').find("#grade option").remove();
    $.get("/admin/grade/getAll", function(data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function(grade) {
                    $("#InfoSearch #grade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
                });
                $("#InfoSearch #grade").val($("#InfoSearch #gradeId").val());
            }
        }
    });
};

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            gradeId: $(".mainModal #InfoSearch #grade").val(),
            trainId: $(".mainModal #InfoSearch #trainId").val(),
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/studentInfo/searchByGradeClass?" + pStr, filter, function(data) {
        if (data && data.students.length > 0) {
            $.post("/admin/couponAssignList/withoutpage/onlystudentId", { couponId: $('#id').val() }, function(assigns) {
                data.students.forEach(function(student) {
                    var id = (student.studentId || student._id),
                        name = (student.studentName || student.name),
                        checked = "";
                    if (assigns.filter(function(assign) {
                            return assign.studentId == student._id;
                        }).length > 0) {
                        checked = "checked";
                    }
                    $mainSelectBody.append('<tr><td><input id=' + id + ' ' + checked + ' type="checkbox" name="student" value=' + id + '></td><td>' + name + '</td><td>' + student.mobile + '</td></tr>');
                });
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    search(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    search(page);
});
//------------end

$("#btnSave").on("click", function(e) {
    var obj = $('#id'),
        entity = obj.data("obj"),
        postURI = "/admin/couponAssign/assign",
        postCoupon = {
            couponId: entity._id,
            couponName: entity.name,
            gradeId: entity.gradeId,
            gradeName: entity.gradeName,
            subjectId: entity.subjectId,
            subjectName: entity.subjectName,
            reducePrice: entity.reducePrice,
            couponStartDate: entity.couponStartDate,
            couponEndDate: entity.couponEndDate
        };

    var students = [];
    $(":input[name='student']").each(function(index) {
        var $this = $(this);
        students.push({
            studentId: $this.val(),
            studentName: $this.parent().next().text(),
            checked: this.checked
        });
    });

    $.post(postURI, {
        coupon: JSON.stringify(postCoupon),
        students: JSON.stringify(students)
    }, function(data) {
        if (data && data.sucess) {
            showAlert("保存成功");
        }
    });
});

$("#btnReturn").on("click", function() {
    location.href = "/admin/couponList";
});

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

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
                var grade = trainClass.gradeName + "/" + trainClass.subjectName + "/" + trainClass.categoryName,
                    price = trainClass.trainPrice + "/" + trainClass.materialPrice,
                    countStr = trainClass.enrollCount + '/' + trainClass.totalStudentCount;
                var $tr = $('<tr><td>' + trainClass.name + '</td><td>' + grade +
                    '</td><td>' + price + '</td><td>' + countStr + '</td></tr>');
                $tr.data("obj", trainClass);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function(entity) {
                $('#InfoSearch #trainName').val(entity.name); //
                $('#InfoSearch #trainId').val(entity._id); //
                $("#InfoSearch #grade").val(entity.gradeId);
                $('#selectModal').modal('hide');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({ backdrop: 'static', keyboard: false });
    });
};

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

$("#btnBatchAssign").on("click", function() {
    location.href = "/admin/couponAssign/batchAssign/" + $('#id').val();
});