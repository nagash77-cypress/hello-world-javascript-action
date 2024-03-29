async function getTriageIssueMetrics(github, context, core, argBeginDate, argEndDate, projectBoardNumber) {

    const ROUTED_TO_LABELS = ['triaged']
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    const ORGANIZATION = context.payload.organization.login
    const PROJECT_NUMBER = projectBoardNumber

    const issuesTriaged = []
    const newIssuesCreated = []

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

    const findLabelDateTime = async (issueNumber, repo) => {
        const iterator = github.paginate.iterator(github.rest.issues.listEventsForTimeline, {
            owner: ORGANIZATION,
            repo: repo,
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
    
    // This will get all issues on the the project board.  
    // We are unable to get just the issues added to the project board over a given period
    // due to limitations int he Github API at the moment
    const query = `is:issue+project:${ORGANIZATION}/${PROJECT_NUMBER}`
    
    const iterator = github.paginate.iterator(github.rest.search.issuesAndPullRequests, {
        q: query,
        per_page: 100,
    })

    // Loop through issues on the project board
    for await (const { data } of iterator) {
        for (const issue of data) {
        
        let repositoryUrl = issue.repository_url
        let issueOrgAndRepoInfo = repositoryUrl.split("/")
        let repoName = issueOrgAndRepoInfo.pop()
        let orgName = issueOrgAndRepoInfo[issueOrgAndRepoInfo.length - 1]
        let routedOrClosedAt
        
        if (!issue.pull_request) {
            // Does the Issue have one of the labels that indicates it has been routed attached to it?
            const routedLabel = issue.labels.find((label) => ROUTED_TO_LABELS.includes(label.name))

            // Verify if the label was assigned during the specified time period.
            // Even if the issue does not have a triaged label, if it is closed we will use that closed date to determine if it was processed during the specified time period.
            if (routedLabel) {
                routedOrClosedAt = await findLabelDateTime(issue.number, repoName)   
            } else if (issue.state === 'closed') {
                routedOrClosedAt = issue.closed_at
            }  
            
            //Get which issues were created during this time period.
            //strings passed back from the github API need to be formatted to check since by default we are using midnight in our date range beginning and end  
            const formattedCreatedDate = new Date(issue.created_at).toISOString().split('T')[0]

            // Verify that the issue was created within the specified date range.
            // If it was, add it to the newIssuesCreated array
            if(formattedCreatedDate <= dateRange.endDate && formattedCreatedDate >= dateRange.startDate) {
                newIssuesCreated.push({
                    number: issue.number,
                    title: issue.title,
                    state: issue.state,
                    url: issue.html_url,
                    createdAt: issue.created_at,
                })
            }

            // Verify that an issue was labeled OR closed during the specified time period and if so add it to the issuesTriaged array
            if (routedOrClosedAt) {
                const elapsedDays = calculateElapsedDays(issue.created_at, routedOrClosedAt)
                const formattedRoutedOrClosedAtDate = new Date(routedOrClosedAt).toISOString().split('T')[0]

                if(formattedRoutedOrClosedAtDate <= dateRange.endDate && formattedRoutedOrClosedAtDate >= dateRange.startDate) {     
                    issuesTriaged.push({
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
        }
    }
    
    const numberOfDaysInRange = calculateElapsedDays(dateRange.startDate,dateRange.endDate)

    const results = {
        dateRange: dateRange,
        issuesRoutedOrClosedInTimePeriod: issuesTriaged,
        newIssuesCreatedInTimePeriod: newIssuesCreated,
    }
    
    core.setOutput('results', results)

    return true

}

module.exports = { getTriageIssueMetrics }