import { eventInterface } from "../typings/interfaces/event.interface";
import { DATE_TIME_STRING_PATTERN } from "../constants";
import { configInterface } from "../typings/config.interface";

export default class Errors {
  public static PREFIX = "[Qalendar warning]";
  // public static SUFFIX = 'This is a development warning, which will never be displayed in production environments'
  public static SUFFIX = "";

  static checkEventProperties(event: eventInterface) {
    // Warn if required property is missing
    if (!event.id)
      console.warn(
        `${this.PREFIX} required event property 'id' is missing \n${this.SUFFIX}`
      );
    if (!event.title)
      console.warn(
        `${this.PREFIX} required event property 'title' is missing \n${this.SUFFIX}`
      );
    if (!event.time)
      console.warn(
        `${this.PREFIX} required event property 'time' is missing \n${this.SUFFIX}`
      );
    if (!event.time.start)
      console.warn(
        `${this.PREFIX} required event property 'time.start' is missing \n${this.SUFFIX}`
      );
    if (!event.time.end)
      console.warn(
        `${this.PREFIX} required event property 'time.end' is missing \n${this.SUFFIX}`
      );

    // Warn if property type is faulty
    if (!["number", "string"].includes(typeof event.id))
      console.warn(
        `${
          this.PREFIX
        } event property 'id' expects a string or a number, received ${typeof event.id} \n${
          this.SUFFIX
        }`
      );
    if (typeof event.title !== "string")
      console.warn(
        `${
          this.PREFIX
        } event property 'title' expects a string, received ${typeof event.title} \n${
          this.SUFFIX
        }`
      );
    if (!DATE_TIME_STRING_PATTERN.test(event.time.start))
      console.warn(
        `${this.PREFIX} event property 'time.start' expects a string formatted like 'YYYY-MM-DD hh:mm', received ${event.time.start} \n${this.SUFFIX}`
      );
    if (!DATE_TIME_STRING_PATTERN.test(event.time.end))
      console.warn(
        `${this.PREFIX} event property 'time.end' expects a string formatted like 'YYYY-MM-DD hh:mm', received ${event.time.end} \n${this.SUFFIX}`
      );
  }

  static checkConfig(config: configInterface) {
    if (config.locale && !/^[a-z]{2}-[A-Z]{2}$/.test(config.locale))
      console.warn(
        `${this.PREFIX} config.locale expects a string of format xx-XX, received: ${config.locale}`
      );
    if (
      config.defaultMode &&
      !["month", "week", "day"].some((mode) => mode === config.defaultMode)
    )
      console.warn(
        `${this.PREFIX} config.defaultMode expects either one of the values "day", "week" or "month"`
      );
  }
}
