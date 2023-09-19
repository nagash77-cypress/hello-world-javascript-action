async function getFeatureReviewMetrics(
  github,
  context,
  core,
  argBeginDate,
  argEndDate,
  projectBoardNumber
) {
  const REVIEWED_LABELS = [
    'Feature Backlog',
  ]
  const FEATURE_LABELS = [
    'type: feature',
    'type: enhancement',
    'content: rewrite',
  ]
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const ORGANIZATION = context.payload.organization.login
  const PROJECT_NUMBER = projectBoardNumber
  const LABEL_DATA = []

  const issuesReviewed = []
  

  const calculateElapsedDays = (createdAt, reviewedOrClosedAt) => {
    return Math.round(
      (new Date(reviewedOrClosedAt) - new Date(createdAt)) / MS_PER_DAY,
      0
    )
  }

  const determineDateRange = (beginDate, endingDate) => {
    const inputStartDate = beginDate
    const inputEndDate = endingDate

    if (inputStartDate && inputEndDate) {
      return { startDate: inputStartDate, endDate: inputEndDate }
    }

    if (inputStartDate || inputEndDate) {
      core.setFailed(
        'Both startDate and endDate are required if one is provided.'
      )
    }

    const startDate = new Date()

    startDate.setDate(startDate.getDate() - 7)

    formattedStartDate = startDate.toISOString().split('T')[0]
    formattedEndDate = new Date().toISOString().split('T')[0]

    return {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      numOfDays: calculateElapsedDays(formattedStartDate, formattedEndDate),
    }
  }

  const dateRange = determineDateRange(argBeginDate, argEndDate)

  const getLabelDataForIssue = async (issueNumber, repo) => {
    if (LABEL_DATA[issueNumber]) {
      return LABEL_DATA[issueNumber].iterator
    } else {
      let iterator = await github.paginate.iterator(
        github.rest.issues.listEventsForTimeline,
        {
          owner: ORGANIZATION,
          repo: repo,
          issue_number: issueNumber,
        }
      )
  
      LABEL_DATA[issueNumber] = { iterator }
  
      return iterator
    }
  }
  

  const findLabelDateTime = async (issueNumber, repo) => {
    let label_data_iterator = await getLabelDataForIssue(issueNumber, repo)

    for await (const { data: timelineData } of  label_data_iterator) {
      for (const timelineItem of timelineData) {
        if (
          timelineItem.event === 'labeled' &&
          REVIEWED_LABELS.includes(timelineItem.label.name)
        ) {
          return timelineItem.created_at
        }
      }
    }
  }

  const isIssueAFeatureRequest = async (issueNumber, repo) => {
    let label_data_iterator = await getLabelDataForIssue(issueNumber, repo)

    for await (const { data: timelineData } of label_data_iterator) {
      for (const timelineItem of timelineData) {
        if (
          timelineItem.event === 'labeled' &&
          FEATURE_LABELS.includes(timelineItem.label.name)
        ) {
          return true
        } else {
          return false
        }
      }
    }
  }
  // This will get all issues on the the project board.
  // We are unable to get just the issues added to the project board over a given period
  // due to limitations in the Github API at the moment
  const query = `is:issue+project:${ORGANIZATION}/${PROJECT_NUMBER}+label:${FEATURE_LABELS.join(',')}`;

  const iterator = github.paginate.iterator(
    github.rest.search.issuesAndPullRequests,
    {
      q: query,
      per_page: 100,
    }
  )

  // Loop through issues on the project board
  for await (const { data } of iterator) {
    for (const issue of data) {
      // Add a 250 millisecond delay between iterations
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let repositoryUrl = issue.repository_url
      let issueOrgAndRepoInfo = repositoryUrl.split('/')
      let repoName = issueOrgAndRepoInfo.pop()
      let orgName = issueOrgAndRepoInfo[issueOrgAndRepoInfo.length - 1]
      let reviewedOrClosedAt

      if (!issue.pull_request) {
        // Does the Issue have one of the labels that indicates it has been reviewed attached to it?
        const reviewedLabel = issue.labels.find((label) =>
          REVIEWED_LABELS.includes(label.name)
        )

        // Verify if the label was assigned during the specified time period.
        // Even if the issue does not have a reviewed label, if it is closed we will use that closed date to determine if it was processed during the specified time period.
        if (reviewedLabel) {
          reviewedOrClosedAt = await findLabelDateTime(issue.number, repoName)
        } else if (issue.state === 'closed' && isIssueAFeatureRequest(issue.number, repoName)) {
          reviewedOrClosedAt = issue.closed_at
        }


        // Verify that an issue was labeled OR closed during the specified time period and if so add it to the issuesTriaged array
        if (reviewedOrClosedAt) {
          const elapsedDays = calculateElapsedDays(
            issue.created_at,
            reviewedOrClosedAt
          )
          const formattedReviewedOrClosedAtDate = new Date(reviewedOrClosedAt)
            .toISOString()
            .split('T')[0]

          if (
            formattedReviewedOrClosedAtDate <= dateRange.endDate &&
            formattedReviewedOrClosedAtDate >= dateRange.startDate
          ) {
            issuesReviewed.push({
              number: issue.number,
              title: issue.title,
              state: issue.state,
              url: issue.html_url,
              createdAt: issue.created_at,
              reviewedOrClosedAt,
              elapsedDays,
            })
          }
        }
      }
    }
  }

  const numberOfDaysInRange = calculateElapsedDays(
    dateRange.startDate,
    dateRange.endDate
  )

  const results = {
    dateRange: dateRange,
    issuesReviewedOrClosedInTimePeriod: issuesReviewed,
  }

  core.setOutput('results', results)

  return true
}

module.exports = { getFeatureReviewMetrics }
