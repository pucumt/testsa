var isNew = true;

$(document).ready(function() {
    $("#left_btnPayWayReport").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    var dateStr = (new Date()).toLocaleDateString() + " 00:00";
    $("#startDate").val(dateStr);
    $("#endDate").val(dateStr);

    $("#startDate").datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        autoclose: true,
        language: "zh-CN"
    });
    $("#endDate").datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        autoclose: true,
        language: "zh-CN"
    });



    renderSearchSchoolDropDown();
});

//------------search funfunction
function renderSearchSchoolDropDown() {
    selfAjax("get", "/admin/schoolArea/all", null, function(data) {
        $(".mainModal #InfoSearch #searchSchool").append("<option value=''></option>");
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
    selfAjax("post", "/admin/payWayReportList/search?" + pStr, filter, function(data) {
        if (data && data.length > 0) {
            data.forEach(function(schoolReport) {
                var $tr = $('<tr ><td>' + schoolReport.name + '</td><td>' +
                    schoolReport.trainPrice + '</td><td>' + schoolReport.materialPrice + '</td><td>' + schoolReport.totalPrice + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});
//------------end