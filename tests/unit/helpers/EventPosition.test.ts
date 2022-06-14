import { describe, expect, test } from "vitest";
import EventPositionHelper from "../../../src/helpers/EventPosition";
import Time from '../../../src/helpers/Time';
const eventPositionHelper = new EventPositionHelper();
const timeHelper = new Time()

describe("EventPositionHelper.ts", () => {
  let wrapper;

  /**
   * (2022-02-16T08:00:00.000Z, 800, ????) should yield 0
   *
   * */
  test("Getting beginning of the day", () => {
    const startOfDay = eventPositionHelper.getPercentageOfDayFromDateTimeString(
      "2022-02-16 08:00",
      800,
      1000
    );

    expect(startOfDay).toEqual(0);
  });

  test("Getting half hour into 4 hour day", () => {
    const halfHourIntoDay =
      eventPositionHelper.getPercentageOfDayFromDateTimeString(
        "2022-02-16 08:30",
        800,
        1200
      );

    expect(halfHourIntoDay).toEqual(12.5);
  });

  test("Getting 4 hours into 8 hour day", () => {
    const midDay = eventPositionHelper.getPercentageOfDayFromDateTimeString(
      "2022-02-16 14:00",
      1000,
      1800
    );

    expect(midDay).toEqual(50);
  });

  /**
   * 2 hours and 15 minutes = 225 points
   * (225 / 800) * 100 = 28.125
   * */
  test("Getting 2 hours and 15 minutes into 9 hour day", () => {
    const time = eventPositionHelper.getPercentageOfDayFromDateTimeString(
      "2022-02-16 12:15",
      1000,
      1800
    );

    expect(time).toEqual(28.125);
  });

  test('Position full-day events in week (all events are in week)', () => {
    const e1 = { time: { start: '2022-06-13', end: '2022-06-14' }, id: 1, title: 'Foo' }
    const e2 = { time: { start: '2022-06-14', end: '2022-06-17' }, id: 1, title: 'Bar' }
    const e3 = { time: { start: '2022-06-16', end: '2022-06-18' }, id: 1, title: 'Baz' }

    const week = eventPositionHelper.positionFullDayEventsInWeek(
      new Date(2022, (6 - 1), 13),
      new Date(2022, (6 - 1), 19),
      [e1, e2, e3]
    )
    expect(week).toHaveLength(7)
    expect(timeHelper.getDateStringFromDate(week[0].date)).toBe('2022-06-13')
    expect(timeHelper.getDateStringFromDate(week[1].date)).toBe('2022-06-14')
    expect(timeHelper.getDateStringFromDate(week[2].date)).toBe('2022-06-15')

    for (const day of week) {
      expect(day).toHaveProperty('date')
    }

    // DAY 1: Expect the first day to only have 1 level, since only 1 event occurs here
    expect(week[0]).toHaveProperty('level1')
    expect(week[0]).not.toHaveProperty('level2')
    // @ts-ignore
    expect(week[0]['level1'].time.start).toBe('2022-06-13')
    // @ts-ignore
    expect(week[0]['level1'].time.end).toBe('2022-06-14')
    expect(week[1]['level1']).toBe('blocked')

    // DAY 2: Expect the second day to have two levels, since both e1 and e2 happen this day
    expect(week[1]).toHaveProperty('level2')
    expect(week[1]).not.toHaveProperty('level3')
    // @ts-ignore
    expect(week[1]['level2'].time.start).toBe('2022-06-14')

    // DAY 3: Expect the third day to only have e2, on level2
    expect(week[2]).not.toHaveProperty('level1')
    expect(week[2]).toHaveProperty('level2')
    expect(week[2]).not.toHaveProperty('level3')

    // DAY 4: Expect the fourth day to have e2 on level2, and e3 on level1
    expect(week[3]).toHaveProperty('level1')
    expect(week[3]).toHaveProperty('level2')
    expect(week[3]).not.toHaveProperty('level3')
    // @ts-ignore
    expect(week[3]['level1'].time.start).toBe('2022-06-16')
    expect(week[3]['level2']).toBe('blocked')

    // DAY 5: Expect fifth day to have e2 block level2, and e3 to block level1
    expect(week[4]['level1']).toBe('blocked')
    expect(week[4]['level2']).toBe('blocked')
    expect(week[4]).not.toHaveProperty('level3')

    // DAY 6: Expect sixth day to have e3 block level 1
    expect(week[5]['level1']).toBe('blocked')
    expect(week[5]).not.toHaveProperty('level2')

    // DAY 7: Expect no levels to be blocked or occupied
    expect(week[6]['level1']).toBeUndefined()
    expect(week[6]['level2']).toBeUndefined()
  })

  test('Position full-day events in week (with events starting before week)', () => {
    const e1 = { time: { start: '2021-12-01', end: '2022-01-01' }, id: 1, title: 'Foo' }
    const e2 = { time: { start: '2021-12-28', end: '2021-12-28' }, id: 1, title: 'Bar' }
    const e3 = { time: { start: '2021-12-28', end: '2022-01-02' }, id: 1, title: 'Baz' }
    const e4 = { time: { start: '2021-12-30', end: '2021-12-30' }, id: 1, title: 'Beep' }
    const e5 = { time: { start: '2021-12-30', end: '2022-01-07' }, id: 1, title: 'Boop' }
    const e6 = { time: { start: '2021-12-30', end: '2022-01-01' }, id: 1, title: 'Bloop' }

    const week = eventPositionHelper.positionFullDayEventsInWeek(
      new Date(2021, (12 - 1), 27),
      new Date(2022, (1 - 1), 2),
      [e1, e2, e3, e4, e5, e6]
    )

    expect(week).toHaveLength(7)

    for (const day of week) {
      expect(day).toHaveProperty('date')
    }

    // DAY 1 (Dec 27th): level1 should be occupied by e1
    expect(week[0]).toHaveProperty('level1')
    expect(week[0].level1.time.start).toBe('2021-12-01')
    expect(week[0].level1.time.end).toBe('2022-01-01')
    expect(week[0]).not.toHaveProperty('level2')

    // DAY  2 (Dec 28th): level 1 should be blocked, level2===e2 and level3===e3
    expect(week[1].level1).toBe('blocked')
    expect(week[1].level2.time.start).toBe('2021-12-28')
    expect(week[1].level2.time.end).toBe('2021-12-28')
    expect(week[1].level3.time.start).toBe('2021-12-28')
    expect(week[1].level3.time.end).toBe('2022-01-02')
    expect(week[1]).not.toHaveProperty('level4')

    // DAY 3 (Dec 29th): level1 and level3 should be blocked
    expect(week[2].level1).toBe('blocked')
    expect(week[2]).not.toHaveProperty('level2')
    expect(week[2].level3).toBe('blocked')
    expect(week[2]).not.toHaveProperty('level4')

    // DAY 4 (Dec 30th): level1 and level3 blocked, level2, level4 and level5 occupied
    expect(week[3].level1).toBe('blocked')
    expect(week[3].level3).toBe('blocked')
    expect(week[3].level2.time.start).toBe('2021-12-30')
    expect(week[3].level2.time.end).toBe('2021-12-30')
    expect(week[3].level2.title).toBe('Beep')
    expect(week[3].level4.time.start).toBe('2021-12-30')
    expect(week[3].level4.time.end).toBe('2022-01-07')
    expect(week[3].level5.time.start).toBe('2021-12-30')
    expect(week[3].level5.time.end).toBe('2022-01-01')

    // DAY 5 (Dec 31th): level1, level3, level4 & level5 blocked
    for (const level of ['level1', 'level3', 'level4', 'level5']) {
      expect(week[4][level]).toBe('blocked')
    }
    expect(week[4].level2).toBeUndefined()
    expect(week[4].level6).toBeUndefined()

    // DAY 6 (Jan 1st): level1, level3, level4 & level5 blocked
    for (const level of ['level1', 'level3', 'level4', 'level5']) {
      expect(week[5][level]).toBe('blocked')
    }
    expect(week[5].level2).toBeUndefined()
    expect(week[5].level6).toBeUndefined()

    // DAY 7 (Jan 2nd): level3 and level5 blocked, the rest free
    expect(week[6].level3).toBe('blocked')
    expect(week[6].level4).toBe('blocked')
  })

  test('Position full-day events in week (with events fully outside of week)', () => {
    const e1 = { time: { start: '2020-08-30', end: '2020-09-30' }, id: 1, title: 'Foo' } // Before period start
    const e2 = { time: { start: '2021-07-30', end: '2021-08-25' }, id: 1, title: 'Bar' } // Before period start
    const e3 = { time: { start: '2021-08-29', end: '2021-08-29' }, id: 1, title: 'Baz' } // Before period start
    const e4 = { time: { start: '2021-08-30', end: '2021-09-05' }, id: 1, title: 'Baz' } // first until last day of week
    const e5 = { time: { start: '2021-09-06', end: '2021-09-10' }, id: 1, title: 'Baz' } // after week

    const week = eventPositionHelper.positionFullDayEventsInWeek(
      new Date(2021, (8 - 1), 30),
      new Date(2021, (9 - 1), 5),
      [e1, e2, e3, e4, e5]
    )

    expect(week).toHaveLength(7)

    for (const day of week) {
      expect(day).toHaveProperty('date')
    }

    // DAY 1 (Sep 30th): level1===e4, the rest undefined
    expect(week[0].level1.time.start).toBe(e4.time.start)
    expect(week[0].level1.time.end).toBe(e4.time.end)
    expect(week[0].level2).toBeUndefined()

    for (const dayIndex of [1, 2, 3, 4, 5, 6]) {
      expect(week[dayIndex].level1).toBe('blocked')
      expect(week[dayIndex].level2).toBeUndefined()
    }
  })
});
