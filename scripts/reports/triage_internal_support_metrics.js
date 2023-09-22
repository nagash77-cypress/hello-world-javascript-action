const { determineDateRange } = require('../utils/githubDateUtils')
const { parseIssueBody } = require('../utils/githubIssueUtils')

async function getInternalSupportMetrics(github, context, core, argBeginDate, argEndDate, projectBoardNumber) {

  const ORGANIZATION = context.payload.organization.login

  const issuesArray = []
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