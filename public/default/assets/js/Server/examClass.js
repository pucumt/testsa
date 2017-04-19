var isNew = true;

$(document).ready(function() {
    $("#left_btnExamClass").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#examDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd",
        onClose: function(selectedDate) {

        }
    });
    searchExams();
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

function searchExams(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #examName").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    $.post("/admin/examClass/search?" + pStr, filter, function(data) {
        if (data && data.examClasss.length > 0) {

            data.examClasss.forEach(function(examClass) {
                examClass.courseContent = htmlEncode(examClass.courseContent);
                $mainSelectBody.append('<tr id=' + examClass._id + '><td>' + examClass.name + '</td><td>' +
                    getClassStatus(examClass.isWeixin) + '</td><td>' + moment(examClass.examDate).format("YYYY-MM-DD") + '</td><td>' + examClass.examTime +
                    '</td><td>' + examClass.examCategoryName + '</td><td>' + examClass.examCount + '</td><td>' +
                    examClass.enrollCount + '</td><td><div data-obj=' +
                    JSON.stringify(examClass) + ' class="btn-group">' + getButtons(examClass.isWeixin) + '</div></td></tr>');
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    searchExams();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    searchExams(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
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
    $('#myModal').formValidation({
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
            }
        }
    });
};

function resetDropDown(objId) {
    $('#myModal').find("#examCategoryName option").remove();
    $("#myModal #examCategoryName").append("<option value=''></option>");
    $.get("/admin/examCategory/getAllWithoutPage", function(data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function(examCategory) {
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

function resetCheckBox(subjects) {
    $('#myModal').find(".subject").empty();
    $.get("/admin/subject/getAllWithoutPage", function(data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function(subject) {
                    var select = "";
                    if (subjects && subjects.some(function(entity) {
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
    $.post("/admin/examClassExamArea/withAllexamArea", { examId: examId }, function(data) {
        if (data) {
            if (data && data.length > 0) {
                var d = $(document.createDocumentFragment());
                var examCount = 0;
                data.forEach(function(examArea) {
                    if (areas && areas.some(function(entity) {
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

$("#btnAdd").on("click", function(e) {
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
    resetDropDown();
    resetCheckBox();
    resetExamArea();
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var subjects = [],
            examAreas = [],
            someError;
        $("#myModal .examArea .checkbox-inline input").each(function(index) {
            if (this.checked) {
                var areaCount = $(this).parents("li").find(".areaCount").val();
                if (areaCount == "" || (!Number(areaCount))) {
                    someError = true;
                    $(this).parents("li").find(".areaCount").focus();
                    return;
                }
                examAreas.push({ examAreaId: $(this).attr("id"), examAreaName: $(this).val(), areaCount: areaCount });
            }
        });

        if (someError) {
            showAlert("考场名额填写不正确");
            return;
        }

        $("#myModal .subject .checkbox-inline input").each(function(index) {
            if (this.checked) {
                subjects.push({ subjectId: $(this).attr("id"), subjectName: $(this).val() });
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
                subjects: subjects.length > 0 ? JSON.stringify(subjects) : [],
                examAreas: examAreas.length > 0 ? JSON.stringify(examAreas) : []
            };
        if (!isNew) {
            postURI = "/admin/examClass/edit";
            postObj.id = $('#id').val();
        }
        $.post(postURI, postObj, function(data) {
            $('#myModal').modal('hide');
            var examDate = data.examDate && moment(data.examDate, "YYYY-M-D").format("YYYY-M-D");
            data.courseContent = htmlEncode(data.courseContent);
            if (isNew) {
                $('#gridBody').append($("<tr id=" + data._id + "><td>" + data.name + "</td><td>新建</td><td>" + examDate + "</td><td>" + data.examTime +
                    "</td><td>" + data.examCategoryName + "</td><td>" + data.examCount + "</td><td>0</td><td><div data-obj='" + JSON.stringify(data) +
                    "' class='btn-group'><a class='btn btn-default btnEdit'>编辑</a><a class='btn btn-default btnDelete'>删除</a><a class='btn btn-default btnPublish'>发布</a></div></td></tr>"));
            } else {
                var name = $('#' + data._id + ' td:first-child');
                var pubstr = "新建";
                switch (data.isWeixin) {
                    case 1:
                        pubstr = "发布";
                        break;
                    case 9:
                        pubstr = "停用";
                        break;
                }
                name.text(data.name);
                var $pub = name.next().text(pubstr),
                    $examDate = $pub.next().text(examDate),
                    $examTime = $examDate.next().text(data.examTime),
                    $examCategoryName = $examTime.next().text(data.examCategoryName),
                    $examCount = $examCategoryName.next().text(data.examCount);
                var $lastDiv = $('#' + data._id + ' td:last-child div');
                $lastDiv.data("obj", data);
            }
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
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
    $('#id').val(entity._id);
    $('#courseContent').val(htmlDecode(entity.courseContent));
    resetDropDown(entity.examCategoryId);
    resetCheckBox(entity.subjects);
    resetExamArea(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    $('#confirmModal .modal-body').text("确定要删除吗?");
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/examClass/delete", {
            id: entity._id
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                $(obj).parents()[2].remove();
            }
        });
    });
});

$("#gridBody").on("click", "td .btnPublish", function(e) {
    $('#confirmModal .modal-body').text("确定要发布吗?");
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/examClass/publish", {
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

$("#gridBody").on("click", "td .btnUnPublish", function(e) {
    $('#confirmModal .modal-body').text("确定要停用吗?");
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });

    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/examClass/unPublish", {
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