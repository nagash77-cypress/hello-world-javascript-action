async function getFeatureRequestMetrics(github, context, core, argBeginDate, argEndDate, projectBoardNumber) {

  const FEATURE_LABELS = ['type: feature', 'type: enhancement', 'content: rewrite']
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const ORGANIZATION = context.payload.organization.login
  const PROJECT_NUMBER = projectBoardNumber

  const issues = []

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

      startDate.setDate(startDate.getDate() - 7)
      
      formattedStartDate = startDate.toISOString().split('T')[0]
      formattedEndDate = (new Date()).toISOString().split('T')[0]

      return { startDate: formattedStartDate, endDate: formattedEndDate, numOfDays:  calculateElapsedDays(formattedStartDate, formattedEndDate)}
  }
  

  const dateRange = determineDateRange(argBeginDate, argEndDate)

  const query = `is:issue+project:${ORGANIZATION}/${PROJECT_NUMBER}`

  const findLabelDateTime = async (issueNumber, repo) => {
      const iterator = github.paginate.iterator(github.rest.issues.listEventsForTimeline, {
          owner: ORGANIZATION,
          repo: repo,
          issue_number: issueNumber,
          })

      for await (const { data: timelineData } of iterator) {
          for (const timelineItem of timelineData) {
              if (timelineItem.event === 'labeled' && FEATURE_LABELS.includes(timelineItem.label.name)) {
                  return timelineItem.created_at
              }
          }
      }
  }

  const iterator = github.paginate.iterator(github.rest.search.issuesAndPullRequests, {
      q: query,
      per_page: 100,
  })

  for await (const { data } of iterator) {
      for (const issue of data) {
      
      let repositoryUrl = issue.repository_url
      let issueOrgAndRepoInfo = repositoryUrl.split("/")
      let repoName = issueOrgAndRepoInfo.pop()
      let orgName = issueOrgAndRepoInfo[issueOrgAndRepoInfo.length - 1]
      let routedAt
      
      if (!issue.pull_request) {
          const routedLabel = issue.labels.find((label) => FEATURE_LABELS.includes(label.name))

          if (routedLabel) {
              routedAt = await findLabelDateTime(issue.number, repoName)   
          }

          let elapsedDays

          if (routedAt) {
              const elapsedDays = calculateElapsedDays(issue.created_at, routedAt)
              const formattedRoutedAtDate = new Date(routedAt).toISOString().split('T')[0]

              if(formattedRoutedAtDate <= dateRange.endDate && formattedRoutedAtDate >= dateRange.startDate) {     
                  issues.push({
                      number: issue.number,
                      title: issue.title,
                      state: issue.state,
                      url: issue.html_url,
                      createdAt: issue.created_at,
                      routedAt,
                      elapsedDays,
                  })
              }
          }
      }
      }
  }

  const results = {
      issues: issues,
      dateRange: dateRange,
  }

  core.setOutput('results', results)

  return true

}

module.exports = { getFeatureRequestMetrics }