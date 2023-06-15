async function generateKPIReport(github, context, core, nonMonoStatsObject, monoStatsObjects, triageObject, mitigationObject) {
  
  console.log('--------------------Mono Repo Stats----------------------')
  console.log(`Repos Being Queried:  ${monoStatsObjects.reposArray}`);
  console.log(`Total Open Issues:  ${monoStatsObjects.openIssueSum}`);
  console.log(`Total Closed Issues:  ${monoStatsObjects.closedIssueSum}`);
  console.log('---------------------------------------------------------')

  console.log('--------------------Non-Mono Repo Stats------------------')
  console.log(`Repos Being Queried:  ${nonMonoStatsObject.reposArray}`);
  console.log(`Total Open Issues:  ${nonMonoStatsObject.openIssueSum}`);
  console.log(`Total Closed Issues:  ${nonMonoStatsObject.closedIssueSum}`);
  console.log('---------------------------------------------------------')

  console.log(`---------------------------Mitigation Metrics-------------------------------`)
  console.log(`Triage Metrics (${mitigationObject.dateRange.startDate} - ${mitigationObject.dateRange.endDate})`)
  console.log(`Total Issues Provided With Workarounds: ${mitigationObject.issues.length}`)
  console.log(`------------------------------------------------------------------------`)

  console.log(`---------------------------Triage Metrics-------------------------------`)
  console.log(`Triage Metrics (${triageObject.dateRange.startDate} - ${triageObject.dateRange.endDate})`)
  console.log(`Number of New Issues Created: ${triageObject.newIssuesCreated.length}`)
  console.log(`Issues triaged/closed within this timeframe (${triageObject.numberOfDaysInRange} days): ${triageObject.issuesTriaged.length}`)
  console.log(`------------------------------------------------------------------------`)

  return true
}

module.exports = { generateKPIReport }