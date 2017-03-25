var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainClass").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
    $("#selectModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#myModal").find(".modal-body").css("overflow-y", "auto");

    $("#courseStartDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd",
        onClose: function(selectedDate) {

        }
    });
    $("#courseEndDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd",
        onClose: function(selectedDate) {

        }
    });

    searchClass();
});

//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function(isWeixin) {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    if (isWeixin == 1) {
        buttons += '<a class="btn btn-default btnUnPublish">停用</a>';
    } else {
        buttons += '<a class="btn btn-default btnPublish">发布</a>';
    }
    return buttons;
};
var getClassStatus = function(isWeixin) {
    if (isWeixin == 1) {
        return "发布";
    } else if (isWeixin == 9) {
        return "停用";
    } else {
        return "新建";
    }

};

function searchClass(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #className").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/trainClass/search?" + pStr, filter, function(data) {
        if (data && data.trainClasss.length > 0) {

            data.trainClasss.forEach(function(trainClass) {
                $mainSelectBody.append('<tr id=' + trainClass._id + '><td>' + trainClass.name + '</td><td>' +
                    getClassStatus(trainClass.isWeixin) + '</td><td>' + trainClass.trainPrice + '</td><td>' + trainClass.materialPrice +
                    '</td><td>' + trainClass.gradeName + '</td><td>' + trainClass.subjectName + '</td><td>' +
                    trainClass.categoryName + '</td><td><div data-obj=' +
                    JSON.stringify(trainClass) + ' class="btn-group">' + getButtons(trainClass.isWeixin) + '</div></td></tr>');
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    searchClass();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    searchClass(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    searchClass(page);
});
//------------end


//------------new class
function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation(callback) {
    $('#myModal').formValidation({
        // List of fields and their validation rules
        fields: {
            'name': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '课程名称不能为空'
                    },
                    stringLength: {
                        min: 4,
                        max: 30,
                        message: '课程名称在4-30个字符之间'
                    }
                }
            },
            'courseContent': {
                trigger: "blur change",
                validators: {
                    stringLength: {
                        max: 1000,
                        message: '课程描述不能超过1000个字符'
                    }
                }
            },
            'trainPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '培训费不能为空'
                    },
                    stringLength: {
                        max: 10,
                        message: '培训费不能超过10个字符'
                    },
                    numeric: {
                        message: '填写的不是数字',
                    }
                }
            },
            'materialPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '材料费不能为空'
                    },
                    stringLength: {
                        max: 10,
                        message: '材料费不能超过10个字符'
                    },
                    numeric: {
                        message: '填写的不是数字',
                    }
                }
            },
            'totalStudentCount': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '招生人数不能为空'
                    },
                    stringLength: {
                        max: 10,
                        message: '招生人数不能超过10个字符'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            },
            'totalClassCount': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '课时总数不能为空'
                    },
                    stringLength: {
                        max: 10,
                        message: '课时总数不能超过10个字符'
                    },
                    integer: {
                        message: '填写的不是数字',
                    }
                }
            },
            'courseStartDate': {
                trigger: "blur change",
                validators: {
                    date: {
                        format: 'YYYY-MM-DD',
                        message: '不是有效的日期格式'
                    }
                }
            },
            'courseEndDate': {
                trigger: "blur change",
                validators: {
                    date: {
                        format: 'YYYY-MM-DD',
                        message: '不是有效的日期格式'
                    }
                }
            }
        }
    });
};

function resetDropDown(objs) {
    $('#myModal').find("#year option").remove();
    $('#myModal').find("#grade option").remove();
    $('#myModal').find("#subject option").remove();
    $('#myModal').find("#category option").remove();
    $('#myModal').find("#examCategoryName option").remove();

    $("#myModal #examCategoryName").append("<option value=''></option>");

    $.get("/admin/trainClass/yeargradesubjectcategoryexamCategory", function(data) {
        if (data) {
            if (data.years && data.years.length > 0) {
                data.years.forEach(function(year) {
                    var select = "";
                    if (objs && year._id == objs.yearid) {
                        select = "selected";
                    }
                    $("#myModal #year").append("<option " + select + " value='" + year._id + "'>" + year.name + "</option>");
                });
            }
            if (data.grades && data.grades.length > 0) {
                data.grades.forEach(function(grade) {
                    var select = "";
                    if (objs && grade._id == objs.gradeid) {
                        select = "selected";
                    }
                    $("#myModal #grade").append("<option " + select + " value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
            if (data.subjects && data.subjects.length > 0) {
                data.subjects.forEach(function(subject) {
                    var select = "";
                    if (objs && subject._id == objs.subjectid) {
                        select = "selected";
                    }
                    $("#myModal #subject").append("<option " + select + " value='" + subject._id + "'>" + subject.name + "</option>");
                });
            }
            if (data.categorys && data.categorys.length > 0) {
                data.categorys.forEach(function(category) {
                    var select = "";
                    if (objs && category._id == objs.categoryid) {
                        select = "selected";
                    }
                    $("#myModal #category").append("<option " + select + " value='" + category._id + "'>" + category.name + "</option>");
                });
            }

            if (data.examCategorys && data.examCategorys.length > 0) {
                data.examCategorys.forEach(function(category) {
                    var select = "";
                    if (objs && category._id == objs.examCategoryid) {
                        select = "selected";
                    }
                    $("#myModal #examCategoryName").append("<option " + select + " value='" + category._id + "'>" + category.name + "</option>");
                });
            }
        }
    });
};

$("#myModal #btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/trainClass/add",
            postObj = {
                name: $('#name').val(),
                trainPrice: $('#trainPrice').val(),
                materialPrice: $('#materialPrice').val(),
                courseStartDate: $('#courseStartDate').val(),
                courseEndDate: $('#courseEndDate').val(),
                courseTime: $('#courseTime').val(),
                totalStudentCount: $('#totalStudentCount').val(),
                totalClassCount: $('#totalClassCount').val(),
                courseContent: $('#courseContent').val(),
                classRoomName: $('#classRoom').val(), //TBD
                classRoomId: $('#classRoomid').val(), //
                schoolArea: $('#school').val(), //TBD
                schoolId: $('#schoolid').val(), //
                teacherName: $('#teacher').val(), //TBD
                teacherId: $('#teacherid').val(), //
                yearId: $('#year').val(),
                yearName: $('#year').find("option:selected").text(),
                gradeId: $('#grade').val(),
                gradeName: $('#grade').find("option:selected").text(),
                subjectId: $('#subject').val(),
                subjectName: $('#subject').find("option:selected").text(),
                categoryId: $('#category').val(),
                categoryName: $('#category').find("option:selected").text(),
                examCategoryId: $('#examCategoryName').val(),
                examCategoryName: $('#examCategoryName').find("option:selected").text(),
                minScore: $('#minScore').val()
            };
        if (!isNew) {
            postURI = "/admin/trainClass/edit";
            postObj.id = $('#id').val();
        }
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            if (isNew) {
                $('#gridBody').append($("<tr id=" + data._id + "><td>" + data.name + "</td><td>新建</td><td>" + data.trainPrice + "</td><td>" + data.materialPrice +
                    "</td><td>" + data.gradeName + "</td><td>" + data.subjectName + "</td><td>" + data.categoryName +
                    "</td><td><div data-obj='" + JSON.stringify(data) +
                    "' class='btn-group'><a class='btn btn-default btnEdit'>编辑</a><a class='btn btn-default btnDelete'>删除</a><a class='btn btn-default btnPublish'>发布</a></div></td></tr>"));
            } else {
                var name = $('#' + data._id + ' td:first-child');
                name.text(data.name);
                var $pub = name.next().text(getClassStatus(data.isWeixin)),
                    $trainPrice = $pub.next().text(data.trainPrice),
                    $materialPrice = $trainPrice.next().text(data.materialPrice),
                    $gradeName = $materialPrice.next().text(data.gradeName),
                    $subjectName = $gradeName.next().text(data.subjectName),
                    $categoryName = $subjectName.next().text(data.categoryName);
                var $lastDiv = $('#' + data._id + ' td:last-child div');
                $lastDiv.data("obj", data);
            }
        });
    }
});
//------------end

//------------main form events
$("#btnAdd").on("click", function(e) {
    isNew = true;
    destroy();
    addValidation();
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增课程");
    $('#name').val("");
    $('#trainPrice').val(0);
    $('#materialPrice').val(0);
    $('#courseStartDate').val("");
    $('#courseEndDate').val("");
    $('#courseTime').val("");
    $('#totalStudentCount').val(0);
    $('#totalClassCount').val(0);
    $('#courseContent').val("");
    $('#classRoom').val(""); //
    $('#classRoomid').val(""); //
    $('#school').val(""); //
    $('#schoolid').val(""); //
    $('#teacher').val(""); //
    $('#teacherid').val(""); //
    $('#minScore').val(0);
    resetDropDown();
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$(".content.mainModal #gridBody").on("click", "td .btnEdit", function(e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改课程");
    $('#name').val(entity.name);
    $('#trainPrice').val(entity.trainPrice);
    $('#materialPrice').val(entity.materialPrice);
    var startDate = entity.courseStartDate && moment(entity.courseStartDate).format("YYYY-M-D");
    $('#courseStartDate').val(startDate);
    var endDate = entity.courseEndDate && moment(entity.courseEndDate).format("YYYY-M-D");
    $('#courseEndDate').val(endDate);
    $('#courseTime').val(entity.courseTime);
    $('#totalStudentCount').val(entity.totalStudentCount);
    $('#totalClassCount').val(entity.totalClassCount);
    $('#courseContent').val(entity.courseContent);
    $('#classRoom').val(entity.classRoomName); //
    $('#classRoomid').val(entity.classRoomId); //
    $('#school').val(entity.schoolArea); //
    $('#schoolid').val(entity.schoolId); //
    $('#teacher').val(entity.teacherName); //
    $('#teacherid').val(entity.teacherId); //
    $('#minScore').val(entity.minScore);
    resetDropDown({ yearid: entity.yearId, gradeid: entity.gradeId, subjectid: entity.subjectId, categoryid: entity.categoryId, examCategoryid: entity.examCategoryId });
    $('#id').val(entity._id);
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$(".content.mainModal #gridBody").on("click", "td .btnDelete", function(e) {
    $('#confirmModal .modal-body').text("确定要删除吗?");
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/trainClass/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnPublish", function(e) {
    $('#confirmModal .modal-body').text("确定要发布吗?");
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/trainClass/publish", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var name = $('#' + entity._id + ' td:first-child');
                name.next().text("发布");
                var operation = $('#' + entity._id + ' td:last-child .btn-group');
                operation.find(".btnPublish").remove();
                operation.append("<a class='btn btn-default btnUnPublish'>停用</a>");
            }
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnUnPublish", function(e) {
    $('#confirmModal .modal-body').text("确定要停用吗?");
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/trainClass/unPublish", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var name = $('#' + entity._id + ' td:first-child');
                name.next().text("停用");
                var operation = $('#' + entity._id + ' td:last-child .btn-group');
                operation.find(".btnUnPublish").remove();
                operation.append("<a class='btn btn-default btnPublish'>发布</a>");
            }
        });
    });
});

//------------end

//------------select Form
var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

function searchRoom(p) {
    var filter = {
            name: $("#selectModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $('#selectModal #selectModalLabel').text("选择教室");
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th style="width:50%">教室名称</th><th>校区</th></tr>');
    $.post("/admin/classRoomList/search?" + pStr, filter, function(data) {
        if (data && data.classRooms.length > 0) {
            data.classRooms.forEach(function(classRoom) {
                $selectBody.append('<tr data-obj=' + JSON.stringify(classRoom) + '><td>' + classRoom.name + '</td><td>' + classRoom.schoolArea + '</td></tr>');
            });
            setSelectEvent($selectBody, function(entity) {
                $('#myModal #classRoom').val(entity.name); //
                $('#myModal #classRoomid').val(entity._id); //
                $('#myModal #school').val(entity.schoolArea); //
                $('#myModal #schoolid').val(entity.schoolId); //
                $('#selectModal').modal('hide');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

var openEntity = "classRoom";
$("#modal_btnClassRoom").on("click", function(e) {
    openEntity = "classRoom";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="Name" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="Name" id="Name"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    searchRoom();
    $("#selectModal .modal-body").height($(window).height() - 189);
    $('#selectModal').modal({ backdrop: 'static', keyboard: false });
});

function searchTeacher(p) {
    var filter = {
            name: $("#selectModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $('#selectModal #selectModalLabel').text("选择老师");
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th style="width:50%">老师姓名</th></tr>');
    $.post("/admin/teacher/search?" + pStr, filter, function(data) {
        if (data && data.teachers.length > 0) {
            data.teachers.forEach(function(teacher) {
                $selectBody.append('<tr data-obj=' + JSON.stringify(teacher) + '><td>' + teacher.name + '</td></tr>');
            });
            setSelectEvent($selectBody, function(entity) {
                $('#teacher').val(entity.name); //
                $('#teacherid').val(entity._id); //
                $('#selectModal').modal('hide');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$("#modal_btnTeacher").on("click", function(e) {
    openEntity = "teacher";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="Name" class="control-label">名字:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="Name" id="Name"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    searchTeacher();
    $("#selectModal .modal-body").height($(window).height() - 189);
    $('#selectModal').modal({ backdrop: 'static', keyboard: false });
});


$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "classRoom") {
        searchRoom(page);
    } else if (openEntity == "teacher") {
        searchTeacher(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "classRoom") {
        searchRoom(page);
    } else if (openEntity == "teacher") {
        searchTeacher(page);
    }
});

$("#selectModal #InfoSearch").on("click", " #btnSearch", function(e) {
    if (openEntity == "classRoom") {
        searchRoom();
    } else if (openEntity == "teacher") {
        searchTeacher();
    }
});
//------------end