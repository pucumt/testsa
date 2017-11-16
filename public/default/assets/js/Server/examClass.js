var isNew = true;

$(document).ready(function () {
    $("#left_btnExamClass").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#examDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd",
        onClose: function (selectedDate) {

        }
    });
    searchExams();
});

//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function (isWeixin, isScorePublished) {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    if (isScorePublished) {
        buttons = buttons + '<a class="btn btn-default btnScorePublish">隐藏成绩</a>';
    } else {
        buttons = buttons + '<a class="btn btn-default btnScorePublish">显示成绩</a>';
    }
    if (isWeixin == 1) {
        buttons += '<a class="btn btn-default btnUnPublish">停用</a>';
    } else {
        buttons += '<a class="btn btn-default btnPublish">发布</a>';
    }
    return buttons;
};
var getClassStatus = function (isWeixin) {
    if (isWeixin == 1) {
        return "发布";
    } else if (isWeixin == 9) {
        return "停用";
    } else {
        return "新建";
    }
};

function searchExams(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #examName").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/examClass/search?" + pStr, filter, function (data) {
        $mainSelectBody.empty();
        if (data && data.examClasss.length > 0) {
            data.examClasss.forEach(function (examClass) {
                var $tr = $('<tr id=' + examClass._id + '><td><span><input type="checkbox" name="examId" value=' + examClass._id + ' /></span>' + examClass.name + '</td><td>' +
                    getClassStatus(examClass.isWeixin) + '</td><td>' + moment(examClass.examDate).format("YYYY-MM-DD") + '</td><td>' + examClass.examTime +
                    '</td><td>' + examClass.examCategoryName + '</td><td>' + examClass.examCount + '</td><td>' +
                    examClass.enrollCount + '</td><td><div class="btn-group">' + getButtons(examClass.isWeixin, examClass.isScorePublished) + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", examClass);
                $mainSelectBody.append($tr);
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    searchExams();
});

$("#mainModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    searchExams(page);
});

$("#mainModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    searchExams(page);
});
//------------end

function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation(callback) {
    setTimeout(function () {
        $('#myModal').formValidation({
            declarative: false,
            // List of fields and their validation rules
            fields: {
                'name': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '测试名称不能为空'
                        },
                        stringLength: {
                            min: 3,
                            max: 50,
                            message: '测试名称在3-50个字符之间'
                        }
                    }
                },
                'examDate': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '测试日期不能为空'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: '不是有效的日期格式'
                        }
                    }
                },
                'examTime': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '测试时间不能为空'
                        },
                        stringLength: {
                            max: 100,
                            message: '测试时间不能超过30个字符'
                        },
                    }
                },
                'examCount': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '测试名额不能为空'
                        },
                        stringLength: {
                            max: 10,
                            message: '测试名额不能超过10个字符'
                        },
                        integer: {
                            message: '填写的不是数字',
                        }
                    }
                },
                'examSequence': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '顺序不能为空'
                        },
                        integer: {
                            message: '填写的不是数字',
                        }
                    }
                }
            }
        });
    }, 0);
};

function resetDropDown(objId) {
    $('#myModal').find("#examCategoryName option").remove();
    $("#myModal #examCategoryName").append("<option value=''></option>");
    selfAjax("get", "/admin/examCategory/getAllWithoutPage", null, function (data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function (examCategory) {
                    var select = "";
                    if (objId && examCategory._id == objId) {
                        select = "selected";
                    }
                    $("#myModal #examCategoryName").append("<option " + select + " value='" + examCategory._id + "'>" + examCategory.name + "</option>");
                });
            }
        }
    });
};

function resetCheckBox(examId) {
    $('#myModal').find(".subject").empty();
    selfAjax("post", "/admin/examClassSubject/getAllWithoutPage", {
        examId: examId
    }, function (data) {
        if (data) {
            if (data && data.subjects.length > 0) {
                data.subjects.forEach(function (subject) {
                    var select = "";
                    if (data.examClassSubjects && data.examClassSubjects.some(function (entity) {
                            return entity.subjectId == subject._id;
                        })) {
                        select = "checked";
                    }
                    $("#myModal .subject").append('<label class="checkbox-inline"><input type="checkbox" id=' + subject._id + ' ' + select + ' value=' + subject.name + '> ' + subject.name + '</label>');
                });
            }
        }
    });
};

function resetExamArea(examId) {
    $('#myModal').find(".examArea").empty();
    selfAjax("post", "/admin/examClassExamArea/withAllexamArea", {
        examId: examId
    }, function (data) {
        if (data) {
            if (data && data.examAreas && data.examAreas.length > 0) {
                var d = $(document.createDocumentFragment());
                var examCount = 0;
                areas = data.examClassExamAreas;
                data.examAreas.forEach(function (examArea) {
                    if (areas && areas.some(function (entity) {
                            if (entity.examAreaId == examArea._id) {
                                examCount = entity.examCount;
                                return true;
                            }
                        })) {
                        d.append('<li><label class="checkbox-inline"><input type="checkbox" id=' + examArea._id + ' checked value=' + examArea.name + ' >' + examArea.name + '</label><input type="text" maxlength="10" class="areaCount" value=' + examCount + '>名额</li>');
                    } else {
                        d.append('<li><label class="checkbox-inline"><input type="checkbox" id=' + examArea._id + ' value=' + examArea.name + ' >' + examArea.name + '</label><input type="text" maxlength="10" class="areaCount" >名额</li>');
                    }
                });
                $("#myModal .examArea").append(d);
            }
        }
    });
};

$("#btnAdd").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增测试");
    $('#name').val("");
    $('#examDate').val("");
    $('#examTime').val("");
    $('#examCount').val(0);
    $('#courseContent').val("");
    $('#examSequence').val(0);
    resetDropDown();
    resetCheckBox();
    resetExamArea();
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var subjects = [],
            examAreas = [],
            someError;
        $("#myModal .examArea .checkbox-inline input").each(function (index) {
            if (this.checked) {
                var areaCount = $(this).parents("li").find(".areaCount").val();
                if (areaCount == "" || (!Number(areaCount))) {
                    someError = true;
                    $(this).parents("li").find(".areaCount").focus();
                    return;
                }
                examAreas.push({
                    examAreaId: $(this).attr("id"),
                    examAreaName: $(this).val(),
                    examCount: areaCount
                });
            }
        });

        if (someError) {
            showAlert("考场名额填写不正确");
            return;
        }

        $("#myModal .subject .checkbox-inline input").each(function (index) {
            if (this.checked) {
                subjects.push({
                    subjectId: $(this).attr("id"),
                    subjectName: $(this).val()
                });
            }
        });

        var postURI = "/admin/examClass/add",
            postObj = {
                name: $('#name').val(),
                examDate: $('#examDate').val(),
                examTime: $('#examTime').val(),
                examCategoryId: $('#examCategoryName').val(),
                examCategoryName: $('#examCategoryName').find("option:selected").text(),
                examCount: $('#examCount').val(),
                courseContent: $('#courseContent').val(),
                sequence: $('#examSequence').val(),
                subjects: subjects.length > 0 ? JSON.stringify(subjects) : [],
                examAreas: examAreas.length > 0 ? JSON.stringify(examAreas) : []
            };
        if (!isNew) {
            postURI = "/admin/examClass/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.reload();
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改测试");
    $('#name').val(entity.name);
    var examDate = entity.examDate && moment(entity.examDate).format("YYYY-M-D");
    $('#examDate').val(examDate);
    $('#examTime').val(entity.examTime);
    $('#examCount').val(entity.examCount);
    $('#examSequence').val(entity.sequence);
    $('#id').val(entity._id);
    $('#courseContent').val(entity.courseContent);
    resetDropDown(entity.examCategoryId);
    resetCheckBox(entity._id);
    resetExamArea(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/examClass/delete", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnScorePublish", function (e) {
    showConfirm("确定要显示成绩吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/examClass/showScore", {
            id: entity._id,
            isScorePublished: entity.isScorePublished
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var operation = $('#' + entity._id + ' td:last-child .btn-group');
                if (entity.isScorePublished) {
                    operation.find(".btnScorePublish").text("显示成绩");
                } else {
                    operation.find(".btnScorePublish").text("隐藏成绩");
                }

            }
        });
    });
});

$("#gridBody").on("click", "td .btnPublish", function (e) {
    showConfirm("确定要发布吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/examClass/publish", {
            id: entity._id
        }, function (data) {
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

$("#gridBody").on("click", "td .btnUnPublish", function (e) {
    showConfirm("确定要停用吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/examClass/unPublish", {
            id: entity._id
        }, function (data) {
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

function getAllCheckedExams() {
    var examIds = [];
    $(".mainModal #gridBody [name='examId']")
        .each(function (index) {
            if (this.checked) {
                examIds.push($(this).val());
            }
        });
    return examIds;
};

$(".toolbar #btnPublishAll").on("click", function (e) {
    var examIds = getAllCheckedExams();
    if (examIds.length > 0) {
        showConfirm("确定要发布吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/examClass/publishAll", {
                ids: JSON.stringify(examIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("发布成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        searchExams(page);
                    });
                }
            });
        });
    }
});

$(".toolbar #btnStopAll").on("click", function (e) {
    var examIds = getAllCheckedExams();
    if (examIds.length > 0) {
        showConfirm("确定要停用吗?");
        $("#btnConfirmSave").off("click").on("click", function (e) {
            selfAjax("post", "/admin/examClass/unPublishAll", {
                ids: JSON.stringify(examIds)
            }, function (data) {
                if (data.sucess) {
                    showAlert("停用成功！");
                    $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                        var page = parseInt($("#mainModal #page").val());
                        searchExams(page);
                    });
                }
            });
        });
    }
});