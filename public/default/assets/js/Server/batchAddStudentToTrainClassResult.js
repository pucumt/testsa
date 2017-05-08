var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainClass").addClass("active");
    search();
});

//------------search funfunction

var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    $mainSelectBody.empty();
    $.get("/admin/batchAddStudentToTrainClass/all", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(dataFail) {
                $mainSelectBody.append('<tr id=' + dataFail._id + '><td>' + dataFail.name + '</td><td>' + dataFail.mobile + '</td><td>' +
                    dataFail.className + '</td><td>' + dataFail.reason + '</td></tr>');
            });
        }
    });
};
//------------end