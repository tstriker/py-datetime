# Python-style datetime handling lib for ES6

The Python datetime handling is not perfect, but it's certainly much better and simpler than what we have in JavaScript.
This tiny lib emulates most of the functions of [Python's datetime lib](https://docs.python.org/2/library/datetime.html).
It tries to stay as close to the python API as possible. Ideal if you are working with both Python and ES projects.
Hope you'll find it useful!
Live console here: https://npm.runkit.com/py-datetime

# Install

```npm install py-datetime```

# Demo
```javascript
import {default as dt} from "py-datetime";  // const dt = require("py-datetime"); for node imports

let now = dt.datetime.now()
let today = dt.datetime.combine(now, new dt.time())
console.log("Now:", now.strftime("%Y-%m-%d %H:%M:%S"));
console.log("Today:", today.strftime("%Y-%m-%d"));
console.log("Minutes since midnight:", dt.timedelta(now - today).totalSeconds() / 60);
```

# A few gotchas

* `dt.timedelta(days, [seconds, [milliseconds..)` constructor can't really guess whether you are passing in a day or a result
  from date math (as dt - dt in javascript will return an int), so i've arbitrarily put in a condition where if it's under
  900, we treat it as days, but otherwise it's millis (1000 millis = 1 sec). For most cases you should be fine, but you can
  always be explicity about it to avoid confusion: `dt.timedelta({days: ..})` and `dt.timedelta({millisesconds: ..}), respectively
* don't forget to plug in the `new` operator when you are creating new things, as that's how it is in javascrip.
* use `.str()` to get string representation of the object. JavaScript's `toString()` will return Unix epoch.


# List of supported functions

Note: all objects evaluate to milliseconds, meaning `dt.datetime.now() + 0` will give you time in Unix epoch. you can also call
`<object>.toString` directly.

## `dt.datetime`

* `new dt.datetime(year, month, day, hour, minute, second, millisecond)` - gets you a brand new datetime
* `new dt.datetime(jsDate)` - you can also pass in a JavaScript Date object
* `new dt.datetime(unixEpoch)` - this will also work
* `new dt.datetime(datetime)` - this will clone an existing datetime object)
* `dt.datetime.strptime(dateString, format)` - parse given date string into a new datetime. Format uses posix parsing
  see [d3-time-format](https://github.com/d3/d3-time-format#locale_format) for details
* `dt.datetime.now()` - return current time
* `dt.datetime.combine(date, time)` - combines passed in `dt.date` or `dt.datetime` with the passed in `dt.time` to create a new datetime
* `datetime.replace(year, month, day, hour, minute, second, millisecond)` returns a new datetime with items replaced as requested
* `datetime.jsDate` property returns JavaScript Date object representing the datetime
* `datetime.str()` returns analog of python's `str(datetime)` which is `%Y-%m-%d %H:%M:%S.%f`

## `dt.date`

* `new dt.date(year, month, day)` - creates a, well, timeless object, all three params are mandatory
* `date.jsDate` property returns JavaScript Date object representing the datetime
* `datetime.str()` returns analog of python's `str(date)`, which is `%Y-%m-%d`

## `dt.time`
* `new dt.time(hour, minute, second, millisecond)` - return a new time object
* `new dt.time(time)` - clone an existing dt.time object
* `time.str()` returns analog of python's `str(time)`, which is `%H:%M:%S.%f`

## `dt.timedelta`
* `new dt.timedelta(days, seconds, milliseconds, minutes, hours, weeks)` - return a new time object. the param order is not random
  and matches python.
* `new dt.timedelta(millis)` - this will work if millis is > 900. will initiate the timedelta object from milliseconds. this is so
  you can do `new dt.timedelta(dateA - dateB)`. See gotchas higher up for the 900 thing.
* `timedelta.totalSeconds()` - returns total seconds between the two times.
* `timedelta.str()` returns analog of python's `str(time)`, which is `%H:%M:%S.%f`
