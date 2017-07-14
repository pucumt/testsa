var isNew = true;

$(document).ready(function() {
    $("#left_btnChangeEnd").addClass("active");

    $("#changeEnd").datepicker({
        changeMonth: true,
        dateFormat: "yy-mm-dd",
    });

    search();
});

//------------search funfunction
function search() {
    selfAjax("post", "/admin/changeEndList/get?", null, function(data) {
        if (data) {
            $("#changeEnd").datepicker("setDate", moment(data.endDate).format("YYYY-MM-DD"));
        } else {
            $("#changeEnd").datepicker("setDate", new Date());
        }
    });
};
//------------end

$("#btnSave").on("click", function(e) {
    var postURI = "/admin/changeEnd/save",
        postObj = {
            name: $.trim($('#changeEnd').val())
        };
    $.post(postURI, postObj, function(data) {
        $('#myModal').modal('hide');
        if (data.sucess) {
            showAlert("更改成功！");
        }
    });
});