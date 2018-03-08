var isNew = true,
    postType;

$(document).ready(function () {
    $("#left_btnBook").addClass("active");

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    searchWord();
    searchSentence();
    searchContent();

    $("#btnUploadContent").on("click", function (e) {
        $("#uploadModal #contentType").val(0);
        $("#uploadModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    $("#btnUploadWord").on("click", function (e) {
        $("#uploadModal #contentType").val(1);
        $("#uploadModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    $("#btnUploadSentence").on("click", function (e) {
        $("#uploadModal #contentType").val(2);
        $("#uploadModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    });

    $("#uploadModal #btnUpload").on("click", function (e) {
        if ($("#uploadModal #contentType").val() == 0) {
            //check if save the content first

        }
        var files = document.getElementById('upfileAudio').files;
        if (files.length > 0) {
            postAudio(files, 0);
        }
    });

    function postAudio(files, i) {
        if (files.length == i) {
            //location.href = "/admin/score";
            showAlert("上传成功！");
            return;
        }

        var formData = new FormData();
        formData.append("audio", files[i]);
        formData.append("contentType", $("#uploadModal #contentType").val());
        formData.append("lessonId", $("#lessonId").val());
        formData.append("number", i);
        $.ajax({
            type: "POST",
            data: formData,
            url: "/admin/audio",
            contentType: false,
            processData: false,
        }).then(function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }

            postAudio(files, i + 1);
        });
    };
});

//------------search funfunction
var $mainWordSelectBody = $('.mainModal.word table tbody');
var getButtons = function () {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function searchWord() {
    var filter = {
        lessonId: $("#lessonId").val()
    };
    $mainWordSelectBody.empty();
    selfAjax("post", "/admin/lessonList/search/word", filter, function (data) {
        if (data && data.words.length > 0) {
            var $tr;
            for (var i = 0; i < data.words.length; i++) {
                if (i % 2 == 0) {
                    $tr = $('<tr>');
                    $mainWordSelectBody.append($tr);
                }
                var word = data.words[i];
                $tr.append($('<td class="lessonWord">' + word.name + '</td><td id=' +
                    word._id + '><div class="btn-group">' + getButtons() + '</div></td>'));
                $tr.find("#" + word._id + " .btn-group").data("obj", word);
            }
            if (i % 2 == 1) {
                $tr.append($('<td></td><td></td>'));
            }
        }
    });
};

var $mainSentenceSelectBody = $('.mainModal.sentence table tbody');

function searchSentence() {
    var filter = {
        lessonId: $("#lessonId").val()
    };
    $mainSentenceSelectBody.empty();
    selfAjax("post", "/admin/lessonList/search/sentence", filter, function (data) {
        if (data && data.sentences.length > 0) {
            var $tr;
            data.sentences.forEach(function (sentence) {
                $tr = $('<tr>');
                $mainSentenceSelectBody.append($tr);
                $tr.append($('<td class="lessonSentence">' + sentence.name + '</td><td id=' +
                    sentence._id + '><div class="btn-group">' + getButtons() + '</div></td>'));
                $tr.find("#" + sentence._id + " .btn-group").data("obj", sentence);


            });
        }
    });
};

var $mainContentSelectBody = $('.mainModal.content.para table tbody');

function searchContent() {
    var filter = {
        lessonId: $("#lessonId").val()
    };
    $mainContentSelectBody.empty();
    selfAjax("post", "/admin/lessonList/search/content", filter, function (data) {
        if (data && data.contents.length > 0) {
            var $tr;
            data.contents.forEach(function (content) {
                $tr = $('<tr>');
                $mainContentSelectBody.append($tr);
                $tr.append($('<td class="lessonSentence">' + content.name + '</td><td id=' +
                    content._id + '><div class="btn-group">' + getButtons() + '</div></td>'));
                $tr.find("#" + content._id + " .btn-group").data("obj", content);
            });
        }
    });
};

//------------end

$("#btnSaveContent").on("click", function (e) {
    if ($.trim($(".mainModal.content #content").val()) == "") {
        showAlert("课文内容和时间不能为空！");
        return;
    }

    selfAjax("post", "/admin/lessonContent/save", {
        content: $.trim($('.mainModal.content #content').val()),
        lessonId: $("#lessonId").val()
    }, function (data) {
        if (data.error) {
            showAlert(data.error);
            return;
        }
        showAlert("保存成功！");
    });
});

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
                            message: '名称不能为空'
                        }
                    }
                }
            }
        });
    }, 0);
};

$("#btnAddContent").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#myModal #startSent').val(0);
    $('#myModal .startSent').show();
    $('#myModal .modal-dialog').addClass("modal-sm");
    postType = "lessonContent";
    // $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增段落");
    $('#name').val("");
    $('#name').attr("rows", 5);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#btnAddWord").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#myModal .startSent').hide();
    $('#myModal .modal-dialog').addClass("modal-sm");
    postType = "lessonWord";
    // $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增单词");
    $('#name').val("");
    $('#name').attr("rows", 5);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#btnSave").on("click", function (e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/" + postType + "/add",
            postObj = {
                name: $.trim($('#name').val()),
                lessonId: $("#lessonId").val(),
                startSent: $('#myModal #startSent').val()
            };
        if (!isNew) {
            postURI = "/admin/" + postType + "/edit";
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

$(".mainModal.content.para #gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    $('#myModal .modal-dialog').addClass("modal-sm");
    postType = "lessonContent";
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改段落");
    $('#name').val(entity.name);
    $('#myModal #startSent').val(entity.startSent);
    $('#id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".mainModal.word #gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    $('#myModal .modal-dialog').addClass("modal-sm");
    postType = "lessonWord";
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改单词");
    $('#name').val(entity.name);
    $('#name').attr("rows", 1);
    $('#id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".mainModal.word #gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/lessonWord/delete", {
            id: entity._id
        }, function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.reload();
        });
    });
});

$("#btnAddSentence").on("click", function (e) {
    isNew = true;
    destroy();
    addValidation();
    $('#myModal .startSent').hide();
    $('#myModal .modal-dialog').removeClass("modal-sm");
    postType = "lessonSentence";
    // $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增句子");
    $('#name').val("");
    $('#name').attr("rows", 5);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".mainModal.sentence #gridBody").on("click", "td .btnEdit", function (e) {
    isNew = false;
    destroy();
    addValidation();
    $('#myModal .modal-dialog').removeClass("modal-sm");
    postType = "lessonSentence";
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改单词");
    $('#name').val(entity.name);
    $('#name').attr("rows", 1);
    $('#id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$(".mainModal.sentence #gridBody").on("click", "td .btnDelete", function (e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/lessonSentence/delete", {
            id: entity._id
        }, function (data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.reload();
        });
    });
});