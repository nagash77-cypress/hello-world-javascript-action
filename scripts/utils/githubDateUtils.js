// githubDateUtils.js

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function calculateElapsedDays(createdAt, routedOrClosedAt) {
  return Math.round((new Date(routedOrClosedAt) - new Date(createdAt)) / MS_PER_DAY, 0);
}

function determineDateRange(beginDate, endingDate) {
  const inputStartDate = beginDate;
  const inputEndDate = endingDate;

  if (inputStartDate && inputEndDate) {
    return { startDate: inputStartDate, endDate: inputEndDate };
  }

  if (inputStartDate || inputEndDate) {
    throw new Error('Both startDate and endDate are required if one is provided.');
  }

  const startDate = new Date();
  const endDate = new Date();

  startDate.setDate(startDate.getDate() - 7);

  let formattedStartDate = startDate.toISOString().split('T')[0];
  let formattedEndDate = endDate.toISOString().split('T')[0];

  return { startDate: startDate, endDate: endDate, formattedStartDate: formattedStartDate, formattedEndDate: formattedEndDate, numOfDays: calculateElapsedDays(formattedStartDate, formattedEndDate) };
}

module.exports = { calculateElapsedDays, determineDateRange };
