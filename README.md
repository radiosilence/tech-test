# Desana Task

## Background

When a worker comes to book a workspace, the apps fetch the available dates and times that the workspace can be booked.

Our workspace operators would like to be able to specify how many minutes notice they get before a worker can book their workspace. For instance, if it's 09:00 now and the workspace operator wants at least 30 minutes notice, the earliest the worker should be able to create a booking for is 09:30.

These times are returned to a worker when they fetch availability for a space.

## The task

You should write the logic to be able to calculate the availability for a `space` given the date/time `now` for the requested `numberOfDays` into the future and taking into account the `space.minimumNotice`.

- Feel free to use any libraries you see fit.
- Think about how you would do this work as if others were going to revisit it in the future.
- Think about how you would do this as if someone else was to review it.

There are two commands in `package.json`:

- `npm test` Runs the tests once.
- `npm run test:watch` Runs the tests once, then waits for changes before running them again.

## Requirements

- [ ] Must calculate the availability for the number of days specified in the `numberOfDays` parameter.
- [ ] Must not return times that are in the past relative to `now` parameter.
- [ ] Must return available times in increments of 15 minutes.
- [ ] Must take into account the `space.minimumNotice` period.
- [ ] Must return opening times relative to the `space.timeZone`.


### Example availability response

The returned data structure looks like this, with 6 June representing a day when a coworking space is open between 09:00 and 17:00 and 7 June representing a closed day:

```json
{
  "2020-06-06": {
    "open": {
      "hour": 9,
      "minute": 0
    },
    "close": {
      "hour": 17,
      "minute": 0
    }
  },
  "2020-06-07": {}
}
```
## The logistics

If there's anything you don't fully understand, please reach out to us as soon as possible.

You can either host the task on Github and send us the Github link, or feel free to archive the project folder (without `node_modules`!) and send it back to us.
