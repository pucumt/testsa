var isNew = true;

$(document).ready(function() {
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#left_btnUpgrade").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    renderSearchYearDropDown(); //search orders after get years
});

function renderSearchYearDropDown() {
    selfAjax("post", "/admin/year/all", {}, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(year) {
                var select = "";
                if (year.isCurrentYear) {
                    select = "selected";
                }
                $("#InfoSearch #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
            });
        };
        searchOrder();
    });
};

var $selectBody = $('.content table tbody');

function getButtons(way) {
    if (way == 6 || way == 7) {
        return '';
    }
    return '<a class="btn btn-default btnEdit">提升难度</a>';
};

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: $("#InfoSearch #isSucceed").val(),
            yearId: $("#InfoSearch #searchYear").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/search?" + pStr, filter, function(data) {
        $selectBody.empty();
        if (data && data.adminEnrollTrains.length > 0) {
            data.adminEnrollTrains.forEach(function(trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + trainOrder.studentName + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.trainPrice + '</td><td>' + trainOrder.materialPrice + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' + trainOrder.realMaterialPrice + '</td><td>' +
                    (trainOrder.isPayed ? "是" : "否") + '</td><td>' + getPayway(trainOrder.payWay) + '</td><td>' + (trainOrder.rebatePrice || '') +
                    '</td><td>' + (trainOrder.superCategoryName || "") + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", trainOrder);
                $selectBody.append($tr);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$("#InfoSearch #btnSearch").on("click", function(e) {
    searchOrder();
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    searchOrder(page);
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    searchOrder(page);
});

function refreshPage() {
    var page = parseInt($("#selectModal #page").val());
    searchOrder(page);
};

$(".content.mainModal #gridBody").on("click", "td .btnEdit", function(e) {
    $('#myModal').find("#category option").remove();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    selfAjax("post", "/admin/gradeSubjectCategoryRelation/filter", {
        trainId: entity.trainId
    }, function(data) {
        data.forEach(function(category) {
            $("#myModal #category").append("<option value='" + category.categorys[0]._id + "'>" + category.categorys[0].name + "</option>");
        });
        $('#myModal #id').val(entity._id);
        $('#myModal').modal({ backdrop: 'static', keyboard: false });
    });

});

$("#myModal #btnSave").on("click", function(e) {
    var postURI = "/admin/adminEnrollTrain/upgrade",
        postObj = {
            categoryId: $.trim($('#myModal #category').val()),
            categoryName: $.trim($('#myModal #category').find("option:selected").text()),
            id: $('#id').val()
        };
    selfAjax("post", postURI, postObj, function(data) {
        $('#myModal').modal('hide');
        if (data && data.sucess) {
            showAlert("修改成功！");
            $('#confirmModal .modal-footer .btn-default').on("click", function(e) {
                refreshPage();
            });
        } else {
            showAlert(data.error);
        }
    });
});