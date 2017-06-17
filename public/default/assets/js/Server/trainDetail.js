var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainOrder").addClass("active");
    $("#btnReturn").attr("href", "/admin/trainOrderList");

    renderTrainDetail();
});

//------------search funfunction
function renderTrainDetail() {
    selfAjax("post", "/admin/adminEnrollTrain/getTrain", { id: $("#id").val() }, function(data) {
        if (data) {
            if (!data.error) {
                $(".mainModal .trainName").html(data.name);
                $(".mainModal .yearName").html(data.yearName);
                $(".mainModal .gradeName").html(data.gradeName);
                $(".mainModal .subjectName").html(data.subjectName);
                $(".mainModal .categoryName").html(data.categoryName);
                $(".mainModal .totalStudentCount").html(data.totalStudentCount);
                $(".mainModal .enrollCount").html(data.enrollCount);
                $(".mainModal .totalClassCount").html(data.totalClassCount);
                $(".mainModal .trainPrice").html(data.trainPrice);
                $(".mainModal .materialPrice").html(data.materialPrice);
                $(".mainModal .teacherName").html(data.teacherName);
                $(".mainModal .attributeName").html(data.attributeName);
                $(".mainModal .courseStartDate").html(moment(data.courseStartDate).format("YYYY-M-D"));
                $(".mainModal .courseEndDate").html(moment(data.courseEndDate).format("YYYY-M-D"));
                $(".mainModal .courseTime").html(data.courseTime);
                $(".mainModal .classRoomName").html(data.classRoomName);
                $(".mainModal .schoolArea").html(data.schoolArea);
                $(".mainModal .fromClassName").html(data.fromClassName);
            } else {
                showAlert(data.error);
            }
        }
    });
};
//------------end