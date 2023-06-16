async function getOpenAndClosedIssueMetrics(github, context, core, reposArray) {

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
    
    let orgName = context.payload.organization.login

    // Prepend each name with "repo:SomeString/" and join them into a string
    let searchQuery = reposArray.map(name => `repo:${orgName}/${name}`).join(' ')

    const getOpenedAndClosedIssueCountParams = {
        searchQuery: searchQuery
    }

    const getOpenedAndClosedIssueCount = await github.graphql(getOpenedAndClosedIssueCountQuery, getOpenedAndClosedIssueCountParams)

    let openIssueSum = getOpenedAndClosedIssueCount.search.nodes.reduce((total, node) => total + node.openIssueCount.totalCount, 0)
    let closedIssueSum = getOpenedAndClosedIssueCount.search.nodes.reduce((total, node) => total + node.closedIssueCount.totalCount, 0)

    const issuesObject = {
      openIssueSum: openIssueSum,
      closedIssueSum: closedIssueSum,
      reposArray: reposArray
    }

    core.setOutput('results', issuesObject)

    return true
}

module.exports = { getOpenAndClosedIssueMetrics }