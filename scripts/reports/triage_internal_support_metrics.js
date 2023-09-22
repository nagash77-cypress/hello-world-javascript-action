async function getInternalSupportMetrics(github, context, core, argBeginDate, argEndDate, projectBoardNumber) {

  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const ORGANIZATION = context.payload.organization.login
  const PROJECT_NUMBER = projectBoardNumber

  const issuesArray = []

  const calculateElapsedDays = (createdAt, routedOrClosedAt) => {
      return Math.round((new Date(routedOrClosedAt) - new Date(createdAt)) / MS_PER_DAY, 0)
  }

  const determineDateRange = (beginDate, endingDate) => {
      const inputStartDate = beginDate
      const inputEndDate = endingDate

      if (inputStartDate && inputEndDate) {
      return { startDate: inputStartDate, endDate: inputEndDate }
      }

      if (inputStartDate || inputEndDate) {
      core.setFailed('Both startDate and endDate are required if one is provided.')
      }

      const startDate = new Date()
      const endDate = new Date()

      startDate.setDate(startDate.getDate() - 7)
      
      let formattedStartDate = startDate.toISOString().split('T')[0]
      let formattedEndDate = endDate.toISOString().split('T')[0]

      return { startDate: startDate, endDate: endDate, formattedStartDate: formattedStartDate, formattedEndDate: formattedEndDate, numOfDays:  calculateElapsedDays(formattedStartDate, formattedEndDate)}
  }
  

  const dateRange = determineDateRange(argBeginDate, argEndDate)


  const iterator = github.paginate.iterator(github.rest.issues.listForRepo, {
    owner: ORGANIZATION,
    repo: "hello-world-javascript-action",
    state: 'all', // Get both open and closed issues
    since: dateRange.startDate, 
    until: dateRange.endDate, 
  })

  
  for await (const { data } of iterator) {
    data.forEach((issue) => {
      
      const parsedIssue = parseIssueBody(issue.body)
      
      issuesArray.push({
        issueNumber: issue.number,
        title: issue.title,
        parsedIssue, // Parsed data from issue body
        // Add more fields as needed
      })
    })
  }


function parseIssueBody(issueBody) {
  const sections = issueBody.split("###");
  const parsedData = {};

  sections.forEach((section) => {
    const lines = section.trim().split("\n");
    const heading = lines.shift().trim();
    const content = lines.join("\n").trim();

    if (heading && content) {
      parsedData[heading] = content;
    }
  });

  return parsedData;
}


  // Process the issues array
  console.log(issuesArray);

  function countRequestedPriorities(issuesArray) {
    const requestedPriorityCounts = {}
  
    for (const issue of issuesArray) {
      // Check if the issue has a "Requested Priority" field
      if (issue.parsedIssue && issue.parsedIssue['Requested Priority']) {
        const priorityValue = issue.parsedIssue['Requested Priority']
  
        // Check if the priorityValue is already a key in the counts object
        if (requestedPriorityCounts.hasOwnProperty(priorityValue)) {
          requestedPriorityCounts[priorityValue]++
        } else {
          requestedPriorityCounts[priorityValue] = 1
        }
      }
    }
  
    return requestedPriorityCounts
  }

  const priorityCounts = countRequestedPriorities(issuesArray);
  console.log(priorityCounts);

  
  const results = {
      issues: issuesArray,
      priorityCounts: priorityCounts,
      dateRange: dateRange,
  }

  core.setOutput('results', results)

  return true

}

module.exports = { getInternalSupportMetrics }