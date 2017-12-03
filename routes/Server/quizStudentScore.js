var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Quiz = model.quiz,
    QuizStudentScore = model.quizStudentScore,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/quizScoreList', checkLogin);
    app.get('/admin/quizScoreList', function (req, res) {
        res.render('Server/quizScoreList.html', {
            title: '>小测试成绩列表',
            user: req.session.admin
        });
    });

    app.post('/admin/quizScore/save', checkLogin);
    app.post('/admin/quizScore/save', function (req, res) {
        var scores = JSON.parse(req.body.scores),
            pArray = [];
        scores.forEach(score => {
            if (score.scoreId) {
                // update
                var p = QuizStudentScore.update(score, {
                    where: {
                        _id: score.scoreId
                    }
                });
                pArray.push(p);
            } else {
                // create
                var p = QuizStudentScore.create(score);
                pArray.push(p);
            }
        });

        Promise.all(pArray)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/quizScoreList/search', checkLogin);
    app.post('/admin/quizScoreList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var strSqlMiddle = " from adminEnrollTrains O join trainClasss C on O.trainId=C._id \
                join studentInfos I on O.studentId=I._id \
                left join quizStudentScores S  \
                 on S.subjectId=C.subjectId and S.yearId=C.yearId and S.studentId=O.studentId and S.isDeleted=false\
                where O.isDeleted=false and O.isSucceed=1 and I.isDeleted=false and C._id=:trainId ",
            strSql2 = "select I.*, S._id as scoreId, C.subjectId, C.yearId, S.score1, S.score2, S.score3, S.score4, S.score5 ",
            replacements = {
                trainId: req.body.trainId
            };

        if (req.body.name && req.body.name.trim()) {
            strSqlMiddle += " and I.name like :name ";
            replacements.name = "%" + req.body.name.trim() + "%";
        }

        strSql2 += strSqlMiddle + " order by I.mobile ";

        model.db.sequelize.query(strSql2, {
                replacements: replacements,
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(scores => {
                res.jsonp(scores);
            });
    });
}