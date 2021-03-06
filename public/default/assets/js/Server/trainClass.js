var isNew = true,
    fullExams;

$(document).ready(function () {
    $("#left_btnTrainClass").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#myModal").find(".modal-body").css("overflow-y", "auto");

    searchClass(); //search class after get years
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

//------------search funfunctionsearchClass();

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
            name: $.trim($(".mainModal #InfoSearch #className").val())
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/trainClass/search?" + pStr, filter, function (data) {
        $mainSelectBody.empty();
        if (data && data.trainClasss.length > 0) {
            var d = $(document.createDocumentFragment());
            data.trainClasss.forEach(function (trainClass) {
                var trObject = $('<tr id=' + trainClass._id + '><td><span><input type="checkbox" name="trainId" value=' + trainClass._id + ' /></span>' + trainClass.name + '</td><td>' +
                    getClassStatus(trainClass.isWeixin) + '</td><td>' + trainClass.subjectName + '</td><td>' +
                    trainClass.enrollCount + '/' + trainClass.totalStudentCount + '</td><td><div class="btn-group">' + getButtons(trainClass.isWeixin) + '</div></td></tr>');
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
        validator.destroy();
        validator = null;
    }
};

function addValidation(callback) {
    setTimeout(function () {
        var validator = $('#myModal').data('formValidation');
        if (!validator) {
            $('#myModal').formValidation({
                framework: 'bootstrap',
                declarative: false,
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
                    }
                }
            });
        }
    }, 0);
};

function resetDropDown(objs) {
    $('#myModal').find("#subject option").remove();
    $("#myModal .examList .extraExams").empty();
    $('#myModal').find(".examList [name='examName']").val(0);
    $("#myModal .examList [name='minScore']").val(0);
    $("#myModal .examList [name='minCount']").val(0);

    selfAjax("get", "/admin/subject/getAllWithoutPage", null, function (data) {
        if (data) {
            if (data && data.length > 0) {
                data.forEach(function (subject) {
                    var select = "";
                    if (objs && subject._id == objs.subjectid) {
                        select = "selected";
                    }
                    $("#myModal #subject").append("<option " + select + " value='" + subject._id + "'>" + subject.name + "</option>");
                });
            }

            var exams = objs ? objs.exams : [],
                length = exams.length;
            if (length > 0) {
                var d = $(document.createDocumentFragment());
                for (var i = 0; i < length; i++) {
                    if (i == 0) {
                        $("#myModal .examList [name='examName']").val(exams[i].examName);
                        $("#myModal .examList [name='minScore']").val(exams[i].minScore);
                        $("#myModal .examList [name='minCount']").val(exams[i].minCount);
                    } else {
                        var source = $('<div class="row"><div class="col-md-6"><div class="form-group"><input type="text" maxlength="50" class="form-control" name="examName"></div></div>\
                            <div class="col-md-6"><div class="form-group"><input type="text" maxlength="10" class="form-control" name="minScore" value="0"></div></div>\
                            <div class="col-md-6"><div class="form-group"><input type="text" maxlength="10" class="form-control" name="minCount" value="0"></div></div></div>');
                        source.find("[name='examName']").val(exams[i].examName);
                        source.find("[name='minScore']").val(exams[i].minScore);
                        source.find("[name='minCount']").val(exams[i].minCount);
                        d.append(source);
                    }
                }
                $("#myModal .examList .extraExams").append(d);
            }
        }
    });
};

$("#myModal #btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/trainClass/add",
            postObj = {
                name: $.trim($('#myModal #name').val()),
                totalStudentCount: $.trim($('#myModal #totalStudentCount').val()),
                courseContent: $.trim($('#myModal #courseContent').val()),
                subjectId: $('#myModal #subject').val(),
                subjectName: $('#myModal #subject').find("option:selected").text(),
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

            // destroy();
        });
    }
});

function getAllExams() {
    var returnObjecgs = [];
    $("#myModal .examList [name='examName']").each(function (index) {
        if ($(this).val() != "") {
            returnObjecgs.push({
                examName: $(this).val(),
                minScore: $.trim($(this).parents(".row").find("[name='minScore']").val()),
                minCount: $.trim($(this).parents(".row").find("[name='minCount']").val())
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
    $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增课程");
    $('#myModal #name').val("");
    $('#myModal #totalStudentCount').val(0);
    $('#myModal #courseContent').val("");
    // $('#minScore').val(0);
    resetDropDown();
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    setTimeout(() => {
        addValidation();
    }, 0);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".content.mainModal #gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    if (entity.enrollCount > 0) {
        $('#myModal #name').attr("disabled", "disabled");
    } else {
        $('#name').removeAttr("disabled");
    }
    $('#myModalLabel').text("修改课程");
    $('#myModal #name').val(entity.name);
    $('#myModal #totalStudentCount').val(entity.totalStudentCount);
    $('#myModal #courseContent').val(entity.courseContent);

    selfAjax("post", "/admin/trainClass/getExams", {
        id: entity._id
    }, function (data) {
        resetDropDown({
            subjectid: entity.subjectId,
            exams: data || []
        });
    });

    $('#myModal #id').val(entity._id);
    $("#myModal").find(".modal-body").height($(window).height() - 189);
    setTimeout(() => {
        addValidation();
    }, 0);
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
$("#myModal #btnNewExam").on("click", function (e) {
    var source = $('<div class="row"><div class="col-md-6"><div class="form-group"><input type="text" maxlength="50" class="form-control" name="examName"></div></div>\
        <div class="col-md-6"><div class="form-group"><input type="text" maxlength="10" class="form-control" name="minScore" value="0"></div></div>\
        <div class="col-md-6"><div class="form-group"><input type="text" maxlength="10" class="form-control" name="minCount" value="0"></div></div></div>');
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