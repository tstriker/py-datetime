const assert = require("assert");
const dt = require("../index");

function equalDates(...args) {
    let toTest = [];
    args.forEach((arg) => {
        if (arg instanceof Date) {
            toTest.push(arg.getTime());
        } else {
            toTest.push(arg.jsDate.getTime());
        }
    });
    assert.equal(...toTest);
}

describe("dt.datetime", function () {
    describe("construction", function () {
        it("via dt.datetime.now()", function () {
            // to test if .now() returns now we just check that they are within 0.1 sec of each other
            let dtNow = dt.datetime.now().jsDate;
            assert.ok(dtNow - new Date() < 100);
        });

        it("via strptime()", function () {
            equalDates(dt.datetime.strptime("2020-04-12", "%Y-%m-%d"), new Date(2020, 3, 12));
        });

        it("via dt.datetime(year, month, day)", function () {
            equalDates(dt.datetime(2020, 04, 12), new Date(2020, 3, 12));
        });

        it("via dt.datetime(new Date())", function () {
            let date = new Date();
            equalDates(dt.datetime(date), date);
        });

        it("via dt.datetime(millis)", function () {
            let date = new Date();
            equalDates(dt.datetime(date.getTime()), date);
        });
    });
    describe("combine", function () {
        it("datetime + time", function () {
            equalDates(
                dt.datetime.combine(dt.datetime(2020, 3, 3, 10, 10), dt.time(5, 6)),
                dt.datetime(2020, 3, 3, 5, 6),
            );
        });

        it("date + time", function () {
            equalDates(
                dt.datetime.combine(dt.date(2020, 1, 2), dt.time(7, 8)),
                dt.datetime(2020, 1, 2, 7, 8),
            );
        });
    });

    describe("combine", function () {
        it("datetime.time", function () {
            assert.equal(
                dt.datetime(2020, 3, 6, 1, 2, 3, 4).time().__totalMillis,
                dt.time(1, 2, 3, 4).__totalMillis,
            );
        });

        it("datetime.date", function () {
            assert.equal(
                dt.datetime(2020, 3, 6, 1, 2, 3, 4).date().__totalMillis,
                dt.date(2020, 3, 6).__totalMillis,
            );
        });
    });
});

describe("dt.timedelta", function () {
    it("dt.datetime - dt.timedelta(days) = dt.datetime", function () {
        equalDates(dt.datetime(dt.datetime(2020, 3, 12) - dt.timedelta(3)), dt.datetime(2020, 3, 9));
    });

    it("dt.datetime - dt.timedelta(days, seconds, milliseconds, minutes, hours)", function () {
        // dt.datetime is year, month, day, hour, minute, second, milli
        // dt.timedelta is day, sec, milli, minute, hour
        // the argument order in timedelta is not random - days + seconds is the main usecase
        equalDates(
            dt.datetime(dt.datetime(2020, 3, 12, 10, 10, 10, 10) - dt.timedelta(1, 2, 3, 4, 5)),
            dt.datetime(2020, 3, 11, 5, 6, 8, 7),
        );
    });

    it("dt.datetime - dt.timedelta({seconds: 10})", function () {
        equalDates(
            dt.datetime(dt.datetime(2020, 3, 12, 10, 10, 10, 10) - dt.timedelta({seconds: 10})),
            dt.datetime(2020, 3, 12, 10, 10, 0, 10),
        );
    });

    it("dt.datetime - dt.timedelta({weeks: 2})", function () {
        equalDates(
            dt.datetime(dt.datetime(2020, 3, 15) - dt.timedelta({weeks: 2})),
            dt.datetime(2020, 3, 1),
        );
    });

    it("dt.datetime - dt.date", function () {
        assert.equal(
            dt.datetime(2020, 1, 11, 12) - dt.date(2020, 1, 1),
            dt.timedelta({days: 10, hours: 12}).__totalMillis,
        );
    });
});


describe("str", function () {
    it("dt.datetime.str()", function () {
        assert.equal(dt.datetime(2020, 3, 2, 5, 6, 7, 8).str(), "2020-03-02 05:06:07.008000");
    });
    it("dt.date.str()", function () {
        assert.equal(dt.date(2020, 3, 2).str(), "2020-03-02");
    });
    it("dt.time.str()", function () {
        assert.equal(dt.time(5, 6, 7, 8).str(), "05:06:07.008000");
    });
});




