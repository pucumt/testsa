window.onload = function () {
    document.body.addEventListener("touchstart", function () {});
    document.body.addEventListener("click", function () {});
    $.ajax({
        url: "/signature/get",
        type: "POST",
        data: {
            clientUrl: location.href
        },
        success: function (data) {
            $("#wResult").show();
            $("#wMessageContainer").append("<h5>\u521B\u5EFA\u5FAE\u4FE1\u7B7E\u540D\uFF1A</h5>" + JSON.stringify(data) + "<br/><br/>");
            wx.config(data);
            aiengine.aiengine_new({
                url: "/signature/chiSign",
                serverTimeout: 30,
                success: function () {
                    $("#wMessageContainer").append("<h5>aiengine_new\u6210\u529F</h5><br/><br/>");
                },
                fail: function (err) {
                    $("#wMessageContainer").append("<h5>aiengine_new\u5931\u8D25\uFF1A</h5>" + JSON.stringify(err) + "<br/><br/>");
                },
            });
        }
    });
    var request = {
        attachAudioUrl: 1,
        coreType: "en.sent.score",
        rank: 100,
        res: "eng.snt.G4",
        refText: "I want to know the past and present of Hong Kong."
    };
    $("#wRefText").html(request.refText);
    $("input[name=radio1]").change(function (e) {
        switch (e.srcElement.id) {
            case "x11":
                request = {
                    attachAudioUrl: 1,
                    rank: 100,
                    coreType: "en.word.score",
                    refText: "past"
                };
                $("#wRefText").html(request.refText);
                break;
            case "x13":
                request = {
                    attachAudioUrl: 1,
                    rank: 100,
                    coreType: "en.pred.exam",
                    refText: {
                        qid: "PAPER-000002-QT-000002",
                        lm: "It was Sunday. I never get up early on Sundays. I sometimes stay in bed until lunchtime. Last Sunday I got up very late. I looked out of the window. It was dark outside."
                    },
                    precision: 0.5,
                    client_params: {
                        ext_subitem_rank4: 0,
                        ext_word_details: 1
                    }
                };
                $("#wRefText").html(request.refText.lm);
                break;
            case "x12":
            default:
                request = {
                    attachAudioUrl: 1,
                    coreType: "en.sent.score",
                    rank: 100,
                    res: "eng.snt.G4",
                    refText: "I want to know the past and present of Hong Kong."
                };
                $("#wRefText").html(request.refText);
                break;
        }
    });
    $("#wTouchMe").on("touchstart", function (e) {
        e.preventDefault();
        startRecord();
        return true;
    });
    $("#wTouchMe").on("touchend", function (e) {
        e.preventDefault();
        stopRecord();
        return true;
    });
    $("#wPlayVoice").on("click", function (e) {
        e.preventDefault();
        playVoice();
        return true;
    });
    $("#wStopVoice").on("click", function (e) {
        e.preventDefault();
        stopVoice();
        return true;
    });
    $("#wClearMessageContainer").on("click", function (e) {
        e.preventDefault();
        $("#wMessageContainer").html("");
        $("#wOverall").html("");
        $("#wFluency").html("");
        $("#wIntegrity").html("");
        $("#wTipId").html("");
        return true;
    });
    $("#wSettings").on("click", function (e) {
        $("#wMainContainer").hide();
        $("#wSettingsContainer").show();
        return true;
    });
    $("#wBackToMainContainer").on("click", function (e) {
        $("#wSettingsContainer").hide();
        $("#wMainContainer").show();
        return true;
    });
    var localId;
    var tHandle;

    function startRecord() {
        aiengine.aiengine_start({
            isShowProgressTips: 0,
            request: request,
            success: function (res) {
                $("#wOverall").html(res.result.overall);
                $("#wTipId").html(res.result.info.tipId);
                var rtext = "";
                if (request.coreType === "en.word.score") {
                    $("#wFluency").html("");
                    $("#wIntegrity").html("");
                    res.result.details[0].phone.forEach(function (arr) {
                        var rank = arr.score >= 85 ? 4 : arr.score < 85 && arr.score >= 70 ? 3 : arr.score < 70 && arr.score >= 55 ? 2 : 1;
                        rtext += "<span class=\"color" + rank + "\">" + arr.char + "</span>";
                    });
                    rtext = request.refText + "&nbsp;&nbsp;[" + rtext + "]";
                } else if (request.coreType === "en.sent.score") {
                    $("#wFluency").html(res.result.fluency.overall);
                    $("#wIntegrity").html(res.result.integrity);
                    res.result.details.forEach(function (arr) {
                        var rank = arr.score >= 85 ? 4 : arr.score < 85 && arr.score >= 70 ? 3 : arr.score < 70 && arr.score >= 55 ? 2 : 1;
                        rtext += "<span class=\"color" + rank + "\" ";
                        rtext += ">" + arr.char + "</span>&nbsp;";
                    });
                } else if (request.coreType === "en.pred.exam") {
                    $("#wFluency").html(res.result.fluency);
                    $("#wIntegrity").html(res.result.integrity);
                    res.result.details.forEach(function (arrs) {
                        arrs.words.forEach(function (arr) {
                            var rank = arr.score >= 85 ? 4 : arr.score < 85 && arr.score >= 70 ? 3 : arr.score < 70 && arr.score >= 55 ? 2 : 1;
                            rtext += "<span class=\"color" + rank + "\">" + arr.text + "</span>&nbsp;";
                        });
                    });
                }
                $("#wRefText").html(rtext);
                $("#wMessageContainer").append("<h5>aiengine_callback\u6210\u529F\uFF1A</h5>" + JSON.stringify(res) + "<br/><br/>");
            },
            fail: function (err) {
                $("#wMessageContainer").append("<h5>aiengine_start\u5931\u8D25\uFF1A</h5>" + JSON.stringify(err) + "<br/><br/>");
            },
            complete: function (res) {
                var endTime = new Date().getTime();
                $("#wMessageContainer").append("<h5>aiengine_callback\u5B8C\u6210(" + (endTime - startTime) + ")\uFF1A</h5>" + JSON.stringify(res) + "<br/><br/>");
                $("#loadingToast").hide();
                localId = res.localId;
            }
        });
    }
    var startTime;

    function stopRecord() {
        startTime = new Date().getTime();
        aiengine.aiengine_stop({
            success: function () {
                $("#loadingToast").show();
                $("#wMessageContainer").append("<h5>aiengine_stop\u6210\u529F</h5><br/><br/>");
            },
            fail: function (err) {
                $("#wMessageContainer").append("<h5>aiengine_stop\u5931\u8D25</h5>" + JSON.stringify(err) + "<br/><br/>");
            },
        });
    }

    function playVoice() {
        if (typeof localId === "string") {
            wx.playVoice({
                localId: localId
            });
        }
    }

    function stopVoice() {
        if (typeof localId === "string") {
            wx.stopVoice({
                localId: localId
            });
        }
    }
};