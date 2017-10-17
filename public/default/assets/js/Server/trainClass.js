var isNew = true,
    fullExams;

$(document).ready(function () {
    $("#left_btnTrainClass").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
    $("#selectModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#myModal").find(".modal-body").css("overflow-y", "auto");

    $("#courseStartDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });
    $("#courseEndDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });
    renderSearchYearDropDown(); //search class after get years
    $("#btnBatchAdd").on("click", function (e) {
        location.href = "/admin/batchTrainClass";
    });

    $("#btnBatchPublish").on("click", function (e) {
        location.href = "/admin/batchTrainClasspublish";
    });

    $("#btnBatchAddStudent").on("click", function (e) {
        location.href = "/admin/batchAddStudentToTrainClass";
    });

    $("#btnBatchAddTeacher").on("click", function (e) {
        location.href = "/admin/batchAddTeacherToTrainClass";
    });

    $("#selectAll").on("change", function (e) {
        $("input[type=checkbox][name=trainId]").each(function () {
            this.checked = e.currentTarget.checked;
        });
    });
});

//------------search funfunction
function renderSearchYearDropDown() {
    selfAjax("post", "/admin/year/all", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (year) {
                var select = "";
                if (year.isCurrentYear) {
                    select = "selected";
                }
                $(".mainModal #InfoSearch #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
            });
        };
        searchClass();
    });
};

var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function (isWeixin) {
    var buttons = '<a class="btn btn-default btnReset hidden">重算</a><a class="btn btn-default btnEdit">编辑</a> \
    <a class="btn btn-default btnDelete">删除</a><a class="btn btn-default btnUpgrade">原班</a>';
    if (isWeixin == 1) {
        buttons += '<a class="btn btn-default btnUnPublish">停用</a>';
    } else {
        buttons += '<a class="btn btn-default btnPublish">发布</a>';
    }
    buttons += '<a class="btn btn-default btnUpdateOrder hidden">更新订单</a>';
    return buttons;
};
var getClassStatus = function (isWeixin) {
    if (isWeixin == 1) {
        return "发布";
    } else if (isWeixin == 2) {
        return "原班";
    } else if (isWeixin == 9) {
        return "停用";
    } else {
        return "新建";
    }

};

function searchClass(p) {
    var filter = {
            name: $.trim($(".mainModal #InfoSearch #className").val()),
            school: $.trim($(".mainModal #InfoSearch #searchSchool").val()),
            gradeName: $.trim($(".mainModal #InfoSearch #searchGrade").val()),
            yearId: $(".mainModal #InfoSearch #searchYear").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/trainClass/search?" + pStr, filter, function (data) {
        $mainSelectBody.empty();
        if (data && data.trainClasss.length > 0) {
            var d = $(document.createDocumentFragment());
            data.trainClasss.forEach(function (trainClass) {
                var trObject = $('<tr id=' + trainClass._id + '><td><span><input type="checkbox" name="trainId" value=' + trainClass._id + ' /></span>' + trainClass.name + '</td><td>' +
                    getClassStatus(trainClass.isWeixin) + '</td><td>' + trainClass.trainPrice + '</td><td>' + trainClass.materialPrice +
                    '</td><td>' + trainClass.gradeName + '</td><td>' + trainClass.subjectName + '</td><td>' +
                    trainClass.categoryName + '</td><td>' + trainClass.enrollCount + '/' + trainClass.totalStudentCount + '</td><td><div class="btn-group">' + getButtons(trainClass.isWeixin) + '</div></td></tr>');
                trObject.find(".btn-group").data("obj", trainClass);
                d.append(trObject);
            });
            $mainSelectBody.append(d);
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    searchClass();
});

$("#mainModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    searchClass(page);
});

$("#mainModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    searchClass(page);
});
//------------end


//------------new class
function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.resetForm().destroy();
    }
};

function addValidation(callback) {
    setTimeout(function () {
        var validator = $('#myModal').data('formValidation');
        if (!validator) {
            $('#myModal').formValidation({
                framework: 'bootstrap',
                // Feedback icons
                icon: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
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
                            numeric: {
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
        }
    }, 0);
};

function resetDropDown(objs) {
    $('#myModal').find("#year option").remove();
    $('#myModal').find("#grade option").remove();
    $('#myModal').find("#subject option").remove();
    $('#myModal').find("#category option").remove();
    $('#myModal').find("#classAttribute option").remove();
    $('#myModal').find("#examCategoryName option").remove();
    $("#myModal .examList .extraExams").empty();
    $('#myModal').find(".examList [name='examName'] option").remove();
    $("#myModal .examList [name='minScore']").val(0);
    $("#myModal #classAttribute").append("<option value=''></option>");

    selfAjax("get", "/admin/trainClass/yeargradesubjectcategoryexamattribute", null, function (data) {
        if (data) {
            if (data.years && data.years.length > 0) {
                data.years.forEach(function (year) {
                    var select = "";
                    if (objs && year._id == objs.yearid) {
                        select = "selected";
                    }
                    $("#myModal #year").append("<option " + select + " value='" + year._id + "'>" + year.name + "</option>");
                });
            }
            if (data.grades && data.grades.length > 0) {
                data.grades.forEach(function (grade) {
                    var select = "";
                    if (objs && grade._id == objs.gradeid) {
                        select = "selected";
                    }
                    $("#myModal #grade").append("<option " + select + " value='" + grade._id + "'>" + grade.name + "</option>");
                });
            }
            if (data.subjects && data.subjects.length > 0) {
                data.subjects.forEach(function (subject) {
                    var select = "";
                    if (objs && subject._id == objs.subjectid) {
                        select = "selected";
                    }
                    $("#myModal #subject").append("<option " + select + " value='" + subject._id + "'>" + subject.name + "</option>");
                });
            }
            if (data.categorys && data.categorys.length > 0) {
                data.categorys.forEach(function (category) {
                    var select = "";
                    if (objs && category._id == objs.categoryid) {
                        select = "selected";
                    }
                    $("#myModal #category").append("<option " + select + " value='" + category._id + "'>" + category.name + "</option>");
                });
            }
            if (data.attributes && data.attributes.length > 0) {
                data.attributes.forEach(function (attribute) {
                    var select = "";
                    if (objs && attribute._id == objs.attributeid) {
                        select = "selected";
                    }
                    $("#myModal #classAttribute").append("<option " + select + " value='" + attribute._id + "'>" + attribute.name + "</option>");
                });
            }
            if (data.exams && data.exams.length > 0) {
                var exams = objs ? objs.exams : [],
                    length = exams.length;
                fullExams = data.exams;
                if (length > 0) {
                    var d = $(document.createDocumentFragment());
                    for (var i = 0; i < length; i++) {
                        if (i == 0) {
                            $("#myModal .examList [name='examName']").append(renderExams(exams[i].examId));
                            $("#myModal .examList [name='minScore']").val(exams[i].minScore);
                        } else {
                            var source = $('<div class="row"><div class="col-md-6"><div class="form-group"><select name="examName" class="form-control"></select></div></div><div class="col-md-6"><div class="form-group"><input type="text" maxlength="10" class="form-control" name="minScore" value="0"></div></div></div>');
                            source.find("[name='examName']").append(renderExams(exams[i].examId));
                            source.find("[name='minScore']").val(exams[i].minScore);
                            d.append(source);
                        }
                    }
                    $("#myModal .examList .extraExams").append(d);
                } else {
                    //new class
                    $("#myModal .examList [name='examName']").append(renderExams());
                }
            }
        }
    });
};

function renderExams(id) {
    var d = $(document.createDocumentFragment());
    if (fullExams && fullExams.length > 0) {
        d.append("<option value=''></option>");
        fullExams.forEach(function (exam) {
            var select = "";
            if (id && exam._id == id) {
                select = "selected";
            }
            d.append("<option " + select + " value='" + exam._id + "'>" + exam.name + "</option>");
        });
    }
    return d;
};

$("#myModal #btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/trainClass/add",
            postObj = {
                name: $.trim($('#myModal #name').val()),
                trainPrice: $.trim($('#myModal #trainPrice').val()),
                materialPrice: $.trim($('#myModal #materialPrice').val()),
                courseStartDate: $.trim($('#myModal #courseStartDate').val()),
                courseEndDate: $.trim($('#myModal #courseEndDate').val()),
                courseTime: $.trim($('#myModal #courseTime').val()),
                totalStudentCount: $.trim($('#myModal #totalStudentCount').val()),
                totalClassCount: $.trim($('#myModal #totalClassCount').val()),
                courseContent: $.trim($('#myModal #courseContent').val()),
                classRoomName: $.trim($('#myModal #classRoom').val()),
                classRoomId: $('#myModal #classRoomid').val(),
                schoolArea: $('#myModal #school').val(),
                schoolId: $('#myModal #schoolid').val(), //
                teacherName: $('#myModal #teacher').val(), //
                teacherId: $('#myModal #teacherid').val(), //
                yearId: $('#myModal #year').val(),
                yearName: $('#myModal #year').find("option:selected").text(),
                gradeId: $('#myModal #grade').val(),
                gradeName: $('#myModal #grade').find("option:selected").text(),
                subjectId: $('#myModal #subject').val(),
                subjectName: $('#myModal #subject').find("option:selected").text(),
                categoryId: $('#myModal #category').val(),
                categoryName: $('#myModal #category').find("option:selected").text(),
                attributeId: $('#myModal #classAttribute').val(),
                attributeName: $('#myModal #classAttribute').find("option:selected").text(),
                exams: getAllExams()
            };
        if (!isNew) {
            postURI = "/admin/trainClass/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function (data) {
            $('#myModal').modal('hide');
            var page = parseInt($("#mainModal #page").val());
            searchClass(page);
        });
    }
});

function getAllExams() {
    var returnObjecgs = [];
    $("#myModal .examList [name='examName']").each(function (index) {
        if ($(this).val() != "") {
            returnObjecgs.push({
                examId: $(this).val(),
                examName: $(this).find("option:selected").text(),
                minScore: $.trim($(this).parents(".row").find("[name='minScore']").val())
            });
        }
    });
    return JSON.stringify(returnObjecgs);
}
//------------end

//------------main form events
$("#btnAdd").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增课程");
    $('#myModal #name').val("");
    $('#myModal #trainPrice').val(0);
    $('#myModal #materialPrice').val(0);
    $('#myModal #courseStartDate').val("");
    $('#myModal #courseEndDate').val("");
    $('#myModal #courseTime').val("");
    $('#myModal #totalStudentCount').val(0);
    $('#myModal #totalClassCount').val(0);
    $('#myModal #courseContent').val("");
    $('#myModal #classRoom').val(""); //
    $('#myModal #classRoomid').val(""); //
    $('#myModal #school').val(""); //
    $('#myModal #schoolid').val(""); //
    $('#myModal #teacher').val(""); //
    $('#myModal #teacherid').val(""); //
    // $('#minScore').val(0);
    resetDropDown();
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModal #name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改课程");
    $('#myModal #name').val(entity.name);
    $('#myModal #trainPrice').val(entity.trainPrice);
    $('#myModal #materialPrice').val(entity.materialPrice);
    var startDate = entity.courseStartDate && moment(entity.courseStartDate).format("YYYY-M-D");
    $('#myModal #courseStartDate').val(startDate);
    var endDate = entity.courseEndDate && moment(entity.courseEndDate).format("YYYY-M-D");
    $('#myModal #courseEndDate').val(endDate);
    $('#myModal #courseTime').val(entity.courseTime);
    $('#myModal #totalStudentCount').val(entity.totalStudentCount);
    $('#myModal #totalClassCount').val(entity.totalClassCount);
    $('#myModal #courseContent').val(entity.courseContent);
    $('#myModal #classRoom').val(entity.classRoomName); //
    $('#myModal #classRoomid').val(entity.classRoomId); //
    $('#myModal #school').val(entity.schoolArea); //
    $('#myModal #schoolid').val(entity.schoolId); //
    $('#myModal #teacher').val(entity.teacherName); //
    $('#myModal #teacherid').val(entity.teacherId); //
    // $('#minScore').val(entity.minScore);

    selfAjax("post", "/admin/trainClass/getExams", {
        id: entity._id
    }, function (data) {
        resetDropDown({
            yearid: entity.yearId,
            gradeid: entity.gradeId,
            subjectid: entity.subjectId,
            categoryid: entity.categoryId,
            attributeid: entity.attributeId,
            exams: data || []
        });
    });

    $('#myModal #id').val(entity._id);
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/trainClass/delete", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnPublish", function (e) {
    showConfirm("确定要发布吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/trainClass/publish", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            var page = parseInt($("#mainModal #page").val());
            searchClass(page);
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnUpgrade", function (e) {
    showConfirm("确定要设为原班原报吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/trainClass/originalclass", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            var page = parseInt($("#mainModal #page").val());
            searchClass(page);
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnUnPublish", function (e) {
    showConfirm("确定要停用吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/trainClass/unPublish", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            var page = parseInt($("#mainModal #page").val());
            searchClass(page);
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnReset", function (e) {
    showConfirm("确定要重新计算吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/trainClass/reset", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var page = parseInt($("#mainModal #page").val());
                searchClass(page);
            }
        });
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnUpdateOrder", function (e) {
    showConfirm("确定要更新订单吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/trainClass/updateOrder", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var page = parseInt($("#mainModal #page").val());
                searchClass(page);
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
    selfAjax("post", "/admin/classRoomList/search?" + pStr, filter, function (data) {
        if (data && data.classRooms.length > 0) {
            data.classRooms.forEach(function (classRoom) {
                var $tr = $('<tr><td>' + classRoom.name + '</td><td>' + classRoom.schoolArea + '</td></tr>');
                $tr.data("obj", classRoom);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
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
$("#modal_btnClassRoom").on("click", function (e) {
    openEntity = "classRoom";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="Name" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="Name" id="Name"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    searchRoom();
    $("#selectModal .modal-body").height($(window).height() - 189);
    $('#selectModal').modal({
        backdrop: 'static',
        keyboard: false
    });
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
    selfAjax("post", "/admin/teacher/search?" + pStr, filter, function (data) {
        if (data && data.teachers.length > 0) {
            data.teachers.forEach(function (teacher) {
                var $tr = $('<tr><td>' + teacher.name + '</td></tr>');
                $tr.data("obj", teacher);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
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

$("#modal_btnTeacher").on("click", function (e) {
    openEntity = "teacher";
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="Name" class="control-label">名字:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="Name" id="Name"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    searchTeacher();
    $("#selectModal .modal-body").height($(window).height() - 189);
    $('#selectModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});


$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "classRoom") {
        searchRoom(page);
    } else if (openEntity == "teacher") {
        searchTeacher(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "classRoom") {
        searchRoom(page);
    } else if (openEntity == "teacher") {
        searchTeacher(page);
    }
});

$("#selectModal #InfoSearch").on("click", " #btnSearch", function (e) {
    if (openEntity == "classRoom") {
        searchRoom();
    } else if (openEntity == "teacher") {
        searchTeacher();
    }
});

$("#myModal #btnNewExam").on("click", function (e) {
    var source = $('<div class="row"><div class="col-md-6"><div class="form-group"><select name="examName" class="form-control"></select></div></div><div class="col-md-6"><div class="form-group"><input type="text" maxlength="10" class="form-control" name="minScore" value="0"></div></div></div>');
    source.find("[name='examName']").append(renderExams());
    $("#myModal .examList .extraExams").append(source);
});
//------------end


function getAllCheckedExams() {
    var trainIds = [];
    $(".mainModal #gridBody [name='trainId']")
        .each(function (index) {
            if (this.checked) {
                trainIds.push($(this).val());
            }
        });
    return trainIds;
};

$(".toolbar #btnPublishAll").on("click", function (e) {
    var trainIds = getAllCheckedExams();
    if (trainIds.length > 0) {
        showConfirm("确定要发布吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/trainClass/publishAll", {
                ids: JSON.stringify(trainIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("发布成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        searchClass(page);
                    });
                }
            });
        });
    }
});

$(".toolbar #btnStopAll").on("click", function (e) {
    var trainIds = getAllCheckedExams();
    if (trainIds.length > 0) {
        showConfirm("确定要停用吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/trainClass/unPublishAll", {
                ids: JSON.stringify(trainIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("停用成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        searchClass(page);
                    });
                }
            });
        });
    }
});

$(".toolbar #btnDeleteAll").on("click", function (e) {
    var trainIds = getAllCheckedExams();
    if (trainIds.length > 0) {
        showConfirm("确定要删除吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/trainClass/deleteAll", {
                ids: JSON.stringify(trainIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("删除成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        searchClass(page);
                    });
                }
            });
        });
    }
});