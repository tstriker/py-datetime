var d3TimeFormat = require("d3-time-format");

let toMillis = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
};

class time {
    constructor(hour, minute, second, millisecond) {
        let args = {hour, minute, second, millisecond};
        if (hour != null && typeof hour != "number") {
            // we have a dict
            args = hour;
        }
        (["hour", "minute", "second", "millisecond"]).forEach((field) => {
            args[field] = args[field] || 0;
        });
        Object.assign(this, args);
    }

    str() {
        // we have to set the date to today to avoid any daylight saving nonsense
        let ts = dt.datetime.combine(dt.datetime.now(), this)
        return d3TimeFormat.timeFormat("%H:%M:%S.%f")(new Date(ts));
    }

    get __totalMillis() {
        return (
            this.hour * toMillis.hours +
            this.minute * toMillis.minutes +
            this.second * toMillis.seconds +
            this.millisecond
        );
    }

    toString() {
        // javascripts toString is not python's str/repr as it's used when you perform math operations on items
        // as such we want milliseconds here instead
        return this.__totalMillis;
    }
}
function timeWrapper(hour, minute, second, millisecond) {
    return new time(hour, minute, second, millisecond);
}

class date {
    constructor(year, month, day) {
        Object.assign(this, {year, month, day});
    }

    get jsDate() {
        return new Date(this.year, this.month - 1, this.day);
    }

    str() {
        return d3TimeFormat.timeFormat("%Y-%m-%d")(this.jsDate);
    }

    get __totalMillis() {
        return this.jsDate.getTime();
    }

    toString() {
        // javascripts toString is not python's str/repr as it's used when you perform math operations on items
        // as such we want milliseconds here instead
        return this.__totalMillis;
    }
}
function dateWrapper(year, month, day) {
    return new date(year, month, day);
}


class datetime {
    constructor(year, month, day, hour, minute, second, millisecond) {
        let args = {};

        if (typeof year == "number" && !month && !day) {
            // while a dt.datetime(2020) is perfectly valid, it's quite unlikely.
            // much more unlikely than having gotten an epoch passed in. convert that to date
            year = new Date(year);
        }

        if (year instanceof datetime || year instanceof date) {
            (["year", "month", "day", "hour", "minute", "second", "millisecond"]).forEach((field) => {
                let ts = year;
                args[field] = ts[field];
            });
        } else if (year instanceof Date) {
            let ts = year;
            args = {
                year: ts.getFullYear(),
                month: ts.getMonth() + 1,
                day: ts.getDate(),
                hour: ts.getHours(),
                minute: ts.getMinutes(),
                second: ts.getSeconds(),
                millisecond: ts.getMilliseconds(),
            };
        } else {
            args = {year, month, day, hour, minute, second, millisecond};
        }
        Object.assign(this, args);
    }

    replace(year, month, day, hour, minute, second, millisecond) {
        // returns new date with updated values
        let args = {};
        if (year && typeof year != "number") {
            args = year;
        } else {
            args = {year, month, day, hour, minute, second, millisecond};
        }

        let newTs = new datetime(this);
        Object.entries(args).forEach(([key, val]) => {
            if (val != null) {
                newTs[key] = val;
            }
        });
        return newTs;
    }

    get jsDate() {
        return new Date(
            this.year,
            this.month - 1,
            this.day || 1,
            this.hour || 0,
            this.minute || 0,
            this.second || 0,
            this.millisecond || 0,
        );
    }

    str() {
        return d3TimeFormat.timeFormat("%Y-%m-%d %H:%M:%S.%f")(this.jsDate);
    }

    toString() {
        return this.jsDate.getTime();
    }

    strftime(format) {
        return d3TimeFormat.timeFormat(format)(this.jsDate);
    }

    time() {
        return new time(this.hour, this.minute, this.second, this.millisecond);
    }

    date() {
        return new date(this.year, this.month, this.day);
    }

}


function datetimeWrapper(year, month, day, hour, minute, second, millisecond) {
    return new datetime(year, month, day, hour, minute, second, millisecond);
}
datetimeWrapper.strptime = (dateString, format) => {
    return new datetime(d3TimeFormat.timeParse(format)(dateString));
}
datetimeWrapper.now = () => {
    return new datetime(new Date());
}
datetimeWrapper.combine = (date, time) => {
    date = new datetime(date);
    Object.assign(date, time);
    return date;
}


class timedelta {
    constructor(days, seconds, milliseconds, minutes, hours, weeks) {
        let args = {weeks, days, hours, minutes, seconds, milliseconds};
        if (typeof days != "number") {
            // we have a dict
            args = days;
        } else if (Math.abs(days) > 900) {
            // we have millis, let's deconstruct into days, hours, minutes, seconds, milliseconds
            let totalMillis = days;
            args = {};
            (["days", "hours", "minutes", "seconds", "milliseconds"]).forEach((key) => {
                let multiplier = toMillis[key];
                let val = Math.floor(totalMillis / multiplier);
                if (val) {
                    args[key] = val;
                    totalMillis -= val * multiplier;
                }
            });
        }

        (["weeks", "days", "hours", "minutes", "seconds", "milliseconds"]).forEach((key) => {
            this[key] = args[key] || 0;
        });
    }

    get __totalMillis() {
        let tsFields = ["weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
        let millis = tsFields.map((field) => this[field] * toMillis[field]);
        return millis.reduce((total, current) => total + current);
    }

    str() {
        return d3TimeFormat.timeFormat("%H:%M:%S.%f")(new Date(this));
    }

    toString() {
        return this.__totalMillis;
    }

    totalSeconds() {
        return this.__totalMillis / 1000;
    }
}
function timedeltaWrapper(days, seconds, milliseconds, minutes, hours, weeks) {
    return new timedelta(days, seconds, milliseconds, minutes, hours, weeks)
}

const dt = {
    datetime: datetimeWrapper,
    time: timeWrapper,
    date: dateWrapper,
    timedelta: timedeltaWrapper,
};
module.exports = dt;