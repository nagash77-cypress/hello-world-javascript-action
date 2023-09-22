async function generateKPIReport(
  github,
  context,
  core,
  nonMonoStatsObject,
  monoStatsObjects,
  triageObject,
  mitigationObject,
  featureObject,
  featureReviewObject,
  internalSupportIssuesObj
) {
  
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
  console.log(`Mitigation Metrics (${mitigationObject.dateRange.startDate} - ${mitigationObject.dateRange.endDate})`)
  console.log(`Total Issues Provided With Workarounds: ${mitigationObject.issues.length}`)
  console.log(`------------------------------------------------------------------------`)

  console.log(`---------------------------Feature Metrics-------------------------------`)
  console.log(`Feature Metrics (${featureObject.dateRange.startDate} - ${featureObject.dateRange.endDate})`)
  console.log(`Total Feature Requests Submitted: ${featureObject.issues.length}`)
  console.log(
    `Total Feature Requests Reviewed: ${featureReviewObject.issuesReviewedOrClosedInTimePeriod.length}`
  )
  console.log(`------------------------------------------------------------------------`)

  console.log(`---------------------------Triage Metrics-------------------------------`)
  console.log(`Triage Metrics (${triageObject.dateRange.startDate} - ${triageObject.dateRange.endDate})`)
  console.log(`Number of New Issues Created: ${triageObject.newIssuesCreatedInTimePeriod.length}`)
  console.log(`Issues triaged/closed within this timeframe (${triageObject.dateRange.numOfDays} days): ${triageObject.issuesRoutedOrClosedInTimePeriod.length}`)
  console.log(`------------------------------------------------------------------------`)

  console.log(`-----------------------Internal Support Metrics--------------------------`)
  console.log(`Internal Support Metrics (${internalSupportIssuesObj.dateRange.formattedStartDate} - ${internalSupportIssuesObj.dateRange.formattedEndDate})`)
  for (const priority in internalSupportIssuesObj.priorityCounts) {
    console.log(`${priority}: ${internalSupportIssuesObj.priorityCounts[priority]}`)
  }
  console.log(`------------------------------------------------------------------------`)


  return true
}

module.exports = { generateKPIReport }