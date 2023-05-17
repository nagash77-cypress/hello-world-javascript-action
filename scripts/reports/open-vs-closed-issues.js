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
    // eventually I want to be able to just accept a normal list of repo names but I was having difficulty getting the github workflow to pass them nicely
    //let repoNames = reposList 
    
    let orgName = context.payload.organization.login

    // Split the string into an array of names
    //let reposArray = repoNames.split(', ');

    // Prepend each name with "repo:SomeString/" and join them into a string
    let searchQuery = reposArray.map(name => `repo:${orgName}/${name}`).join(' ')

    const getOpenedAndClosedIssueCountParams = {
        searchQuery: searchQuery
    }

    // console.log('----------------Query Params----------------------------')
    // console.log(beginDate)
    // console.log(endDate)
    // console.log(reposArray)
    // console.log(getOpenedAndClosedIssueCountParams)
    // console.log(searchQuery);
    // console.log('---------------------------------------------------------')

    const getOpenedAndClosedIssueCount = await github.graphql(getOpenedAndClosedIssueCountQuery, getOpenedAndClosedIssueCountParams)

    //console.log(getOpenedAndClosedIssueCount.search.nodes)

    let openIssueSum = getOpenedAndClosedIssueCount.search.nodes.reduce((total, node) => total + node.openIssueCount.totalCount, 0)

    console.log('--------------------Total Open Issues--------------------')
    console.log(`Repos Being Queried:  ${reposArray}`);
    console.log(`Total Open Issues:  ${openIssueSum}`);
    console.log('---------------------------------------------------------')

    let closedIssueSum = getOpenedAndClosedIssueCount.search.nodes.reduce((total, node) => total + node.closedIssueCount.totalCount, 0)

    console.log('--------------------Total Closed Issues------------------')
    console.log(`Repos Being Queried:  ${reposArray}`);
    console.log(`Total Closed Issues:  ${closedIssueSum}`);
    console.log('---------------------------------------------------------')

    return true
}

module.exports = { getOpenAndClosedIssueMetrics }