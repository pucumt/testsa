var isNew = true;

$(document).ready(function() {
    $("#left_btnRebateReport").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#startDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });
    $("#endDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });

    $("#startDate").datepicker("setDate", new Date());
    $("#endDate").datepicker("setDate", new Date());

    renderSearchSchoolDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("get", "/admin/schoolArea/all", null, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(school) {
                $(".mainModal #InfoSearch #searchSchool").append("<option value='" + school._id + "'>" + school.name + "</option>");
            });
        };
    });
};

var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            startDate: $(".mainModal #InfoSearch #startDate").val(),
            endDate: $(".mainModal #InfoSearch #endDate").val(),
            schoolId: $(".mainModal #InfoSearch #searchSchool").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/rebateReportList/search?" + pStr, filter, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(schoolReport) {
                var $tr = $('<tr ><td>' + schoolReport.name + '</td><td>' +
                    schoolReport.rebatePrice + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$(".mainModal #InfoSearch #btnExport").on("click", function(e) {
    selfAjax("post", "/admin/export/rebateAllList", {
        // gradeId: $(".mainModal #InfoSearch #searchGrade").val()
    }, function(data) {
        if (data && data.sucess) {
            location.href = "/admin/export/scoreTemplate?name=" + encodeURI("全部退费列表.xlsx");
        }
    });
});
//------------end