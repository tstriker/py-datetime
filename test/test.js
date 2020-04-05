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

        it("via new dt.datetime(year, month, day)", function () {
            equalDates(new dt.datetime(2020, 04, 12), new Date(2020, 3, 12));
        });

        it("via new dt.datetime(new Date())", function () {
            let date = new Date();
            equalDates(new dt.datetime(date), date);
        });

        it("via new dt.datetime(millis)", function () {
            let date = new Date();
            equalDates(new dt.datetime(date.getTime()), date);
        });
    });
    describe("combine", function () {
        it("datetime + time", function () {
            equalDates(
                dt.datetime.combine(new dt.datetime(2020, 3, 3, 10, 10), new dt.time(5, 6)),
                new dt.datetime(2020, 3, 3, 5, 6),
            );
        });

        it("date + time", function () {
            equalDates(
                dt.datetime.combine(new dt.date(2020, 1, 2), new dt.time(7, 8)),
                new dt.datetime(2020, 1, 2, 7, 8),
            );
        });
    });

    describe("combine", function () {
        it("datetime.time", function () {
            assert.equal(
                new dt.datetime(2020, 3, 6, 1, 2, 3, 4).time().__totalMillis,
                new dt.time(1, 2, 3, 4).__totalMillis,
            );
        });

        it("datetime.date", function () {
            assert.equal(
                new dt.datetime(2020, 3, 6, 1, 2, 3, 4).date().__totalMillis,
                new dt.date(2020, 3, 6).__totalMillis,
            );
        });
    });
});

describe("dt.timedelta", function () {
    it("dt.datetime - dt.timedelta(days) = dt.datetime", function () {
        equalDates(new dt.datetime(new dt.datetime(2020, 3, 12) - new dt.timedelta(3)), new dt.datetime(2020, 3, 9));
    });

    it("dt.datetime - dt.timedelta(days, seconds, milliseconds, minutes, hours)", function () {
        // dt.datetime is year, month, day, hour, minute, second, milli
        // dt.timedelta is day, sec, milli, minute, hour
        // the argument order in timedelta is not random - days + seconds is the main usecase
        equalDates(
            new dt.datetime(new dt.datetime(2020, 3, 12, 10, 10, 10, 10) - new dt.timedelta(1, 2, 3, 4, 5)),
            new dt.datetime(2020, 3, 11, 5, 6, 8, 7),
        );
    });

    it("dt.datetime - dt.timedelta({seconds: 10})", function () {
        equalDates(
            new dt.datetime(new dt.datetime(2020, 3, 12, 10, 10, 10, 10) - new dt.timedelta({seconds: 10})),
            new dt.datetime(2020, 3, 12, 10, 10, 0, 10),
        );
    });

    it("dt.datetime - dt.timedelta({weeks: 2})", function () {
        equalDates(
            new dt.datetime(new dt.datetime(2020, 3, 15) - new dt.timedelta({weeks: 2})),
            new dt.datetime(2020, 3, 1),
        );
    });

    it("dt.datetime - dt.date", function () {
        assert.equal(
            new dt.datetime(2020, 1, 11, 12) - new dt.date(2020, 1, 1),
            new dt.timedelta({days: 10, hours: 12}).__totalMillis,
        );
    });
});


describe("str", function () {
    it("dt.datetime.str()", function () {
        assert.equal(new dt.datetime(2020, 3, 2, 5, 6, 7, 8).str(), "2020-03-02 05:06:07.008000");
    });
    it("dt.date.str()", function () {
        assert.equal(new dt.date(2020, 3, 2).str(), "2020-03-02");
    });
    it("dt.time.str()", function () {
        assert.equal(new dt.time(5, 6, 7, 8).str(), "05:06:07.008000");
    });
});




