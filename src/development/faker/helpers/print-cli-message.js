const getDateForCLIOutput = require("./get-date-for-cli-output");

const printCliMessage = (seededMonths, seededYear = null) => {
  const successMessage =
    "Wrote calendar events to src/development/data/seeded-events.ts";
  console.log("\n");
  console.log("\x1b[42m%s\x1b[0m", "Seeding was successful!");
  console.log(successMessage);
  console.log("\n");

  const monthsWereSeeded = seededMonths && seededMonths.length;

  if (monthsWereSeeded) {
    console.log("Seeded the following months:");

    for (const month of seededMonths) {
      console.log(`- ${getDateForCLIOutput(month)}`);
    }

    console.log("\n");
  }

  if (seededYear) {
    console.log("Seeded all months of %s", seededYear);
    console.log("\n");
  }

  if (!monthsWereSeeded && !seededYear) {
    console.log("Seeded the current month");
    console.log("\n");
  }
};

module.exports = printCliMessage;
