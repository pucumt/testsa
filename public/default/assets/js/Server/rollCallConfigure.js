var isNew = true;

$(document).ready(function() {
    $("#left_btnRollCallProcess").addClass("active");

    loadData();
});

//------------search funfunction
function loadData() {
    selfAjax("post", "/admin/rollCallConfigureList/search", null, function(data) {
        if (data) {
            if (data.years) {
                data.years.forEach(function(year) {
                    var selected = "";
                    if (year._id == data.configure.yearId) {
                        selected = " selected";
                    }
                    $("#InfoSearch #drpYear").append("<option value='" + year._id + "' " + selected + " sequence='" + year.sequence +
                        "'>" + year.name + "</option>");
                });
            }
        }
    });
};

$("#btnSave").on("click", function(e) {
    selfAjax("post", "/admin/rollCallConfigure/edit", {
        yearId: $("#InfoSearch #drpYear").val(),
        yearName: $("#InfoSearch #drpYear").find("option:selected").text(),
        sequence: $("#InfoSearch #drpYear").find("option:selected").attr("sequence")
    }, function(data) {
        location.href = location.href;
    });
});