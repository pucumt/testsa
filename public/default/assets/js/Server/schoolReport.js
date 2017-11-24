var isNew = true;

$(document).ready(function () {
    $("#left_btnSchoolReport").addClass("active");
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#startDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd",
    });
    $("#endDate").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd"
    });

    $("#startDate").datepicker("setDate", new Date());
    $("#endDate").datepicker("setDate", new Date());

    renderAttribute();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search(p) {
    var filter = {
            startDate: moment($(".mainModal #InfoSearch #startDate").val()).utcOffset(0).format("YYYY-MM-DD HH:mm:ss"),
            endDate: moment($(".mainModal #InfoSearch #endDate").val()).add(1, 'day').utcOffset(0).format("YYYY-MM-DD HH:mm:ss"),
            attributeId: $("#InfoSearch #drpAttribute").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/schoolReportList/search?" + pStr, filter, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (schoolReport) {
                var $tr = $('<tr id=' + schoolReport._id + '><td>' + schoolReport.name + '</td><td>' +
                    schoolReport.trainPrice + '</td><td>' + schoolReport.materialPrice + '</td><td>' + schoolReport.totalPrice + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
    search();
});
//------------end

function renderAttribute() {
    selfAjax("post", "/admin/classAttribute/getChecked", null, function (data) {
        if (data) {
            if (data.length > 0) {
                data.forEach(function (classAttribute) {
                    $("#InfoSearch #drpAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
                });
            } else {
                $('#InfoSearch .attribute').hide();
            }
        }
    });
};