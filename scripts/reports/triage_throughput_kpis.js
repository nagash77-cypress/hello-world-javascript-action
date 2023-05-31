async function getTriageIssueMetrics(github, context, argBeginDate, argEndDate, projectBoardNumber) {
    console.log('Made it to the function')


    const ROUTED_TO_LABELS = ['triaged','triage']
    const MS_PER_DAY = 1000 * 60 * 60 * 24

    //const { REPOSITORY, ORGANIZATION, PROJECT_NUMBER } = process.env
    const ORGANIZATION = 'nagash77-cypress'
    const REPOSITORY = "hello-world-javascript-action"
    const PROJECT_NUMBER = projectBoardNumber

    const issues = []

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

        startDate.setDate(startDate.getDate() - 6)

        console.log(startDate)
        console.log(endingDate)

        return { startDate: startDate.toISOString().split('T')[0], endDate: (new Date()).toISOString().split('T')[0] }
    }

    

    const dateRange = determineDateRange(argBeginDate, argEndDate)
    console.log(dateRange.startDate)
    console.log(dateRange.endDate)


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
        
        console.log("new loop")
        console.log(data)
        console.log("------------")

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

    const issuesRoutedOrClosedInTimePeriod = issues.length
    const percentage = Number(issues.length > 0 ? issuesRoutedOrClosedInTimePeriod / issues.length : 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })

    console.log(`Triage Metrics (${dateRange.startDate} - ${dateRange.endDate})`)
    console.log('Total issues:', issues.length)
    console.log(`Issues routed/closed within specified time frame: ${issuesRoutedOrClosedInTimePeriod} (${percentage})`)

}

module.exports = { getTriageIssueMetrics }