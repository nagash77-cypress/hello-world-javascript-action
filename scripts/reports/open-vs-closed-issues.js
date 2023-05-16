async function getOpenAndClosedIssueMetrics(github, context, beginDate, endDate, reposArray) {
    console.log('Made it to the function')


    const getOpenedAndClosedIssueCountQuery = `
    query ($searchQuery: String!) {
        search(type: REPOSITORY, query: $searchQuery, first: 100) {
          nodes {
            ... on Repository {
              id
              createdAt
              openIssueCount: issues(states: [OPEN]) {
                totalCount
              }
              closedIssueCount: issues(states: [CLOSED]) {
                totalCount
              }
              releases(last: 1) {
                totalCount
                nodes {
                  tagName
                }
              }
              name
            }
          }
        }
      }
    `
    
    //let repoNames = reposList
    let orgName = context.payload.organization.login

    // Split the string into an array of names
    //let reposArray = repoNames.split(', ');

    // Prepend each name with "repo:SomeString/" and join them into a string
    let searchQuery = reposArray.map(name => `repo:${orgName}/${name}`).join(' ')

    console.log(searchQuery);


    const getOpenedAndClosedIssueCountParams = {
        searchQuery: searchQuery
    }

    console.log(beginDate)
    console.log(endDate)
    console.log(reposArray)
    console.log(getOpenedAndClosedIssueCountParams)

    const getOpenedAndClosedIssueCount = await github.graphql(getOpenedAndClosedIssueCountQuery, getOpenedAndClosedIssueCountParams)

    console.log(getOpenedAndClosedIssueCount)

    return true
}

async function getTriagedOverPeriodOfTime(github, context, numberOfDays) {
    const ROUTED_TO_LABELS = ['routed-to-e2e', 'routed-to-ct']
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    const { REPOSITORY, ORGANIZATION, PROJECT_NUMBER } = process.env

    const issues = []

    const determineDateRange = () => {
        const inputStartDate = '${{ inputs.startDate }}'
        const inputEndDate = '${{ inputs.endDate }}'

        if (inputStartDate && inputEndDate) {
        return { startDate: inputStartDate, endDate: inputEndDate }
        }

        if (inputStartDate || inputEndDate) {
        core.setFailed('Both startDate and endDate are required if one is provided.')
        }

        const startDate = new Date()

        startDate.setDate(startDate.getDate() - 6)

        return { startDate: startDate.toISOString().split('T')[0], endDate: (new Date()).toISOString().split('T')[0] }
    }

    const dateRange = determineDateRange()
    const query = `is:issue+repo:${ORGANIZATION}/${REPOSITORY}+project:${ORGANIZATION}/${PROJECT_NUMBER}+created:${dateRange.startDate}..${dateRange.endDate}`

    const findLabelDateTime = async (issueNumber) => {
        const iterator = github.paginate.iterator(github.rest.issues.listEventsForTimeline, {
        owner: ORGANIZATION,
        repo: REPOSITORY,
        issue_number: issueNumber,
        })

        for await (const { data: timelineData } of iterator) {
        for (const timelineItem of timelineData) {
            if (timelineItem.event === 'labeled' && ROUTED_TO_LABELS.includes(timelineItem.label.name)) {
            return timelineItem.created_at
            }
        }
        }
    }

    const calculateElapsedDays = (createdAt, routedOrClosedAt) => {
        return Math.round((new Date(routedOrClosedAt) - new Date(createdAt)) / MS_PER_DAY, 0)
    }

    const iterator = github.paginate.iterator(github.rest.search.issuesAndPullRequests, {
        q: query,
        per_page: 100,
    })

    for await (const { data } of iterator) {
        for (const issue of data) {
        let routedOrClosedAt

        if (!issue.pull_request) {
            const routedLabel = issue.labels.find((label) => ROUTED_TO_LABELS.includes(label.name))

            if (routedLabel) {
            routedOrClosedAt = await findLabelDateTime(issue.number)
            } else if (issue.state === 'closed') {
            routedOrClosedAt = issue.closed_at
            }

            let elapsedDays

            if (routedOrClosedAt) {
            elapsedDays = calculateElapsedDays(issue.created_at, routedOrClosedAt)
            }

            issues.push({
            number: issue.number,
            title: issue.title,
            state: issue.state,
            url: issue.html_url,
            createdAt: issue.created_at,
            routedOrClosedAt,
            elapsedDays,
            })
        }
        }
    }

    const issuesRoutedOrClosedIn7Days = issues.filter((issue) => issue.elapsedDays <= 7).length
    const percentage = Number(issues.length > 0 ? issuesRoutedOrClosedIn7Days / issues.length : 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })

    console.log(`Triage Metrics (${dateRange.startDate} - ${dateRange.endDate})`)
    console.log('Total issues:', issues.length)
    console.log(`Issues routed/closed within 7 days: ${issuesRoutedOrClosedIn7Days} (${percentage})`)
}

module.exports = { getOpenAndClosedIssueMetrics, getTriagedOverPeriodOfTime }