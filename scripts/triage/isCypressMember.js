async function isCypressOrgMember(github, login, org) {
  const isMemberQuery = `
  query ($login: String!, $org: String!) {
    search(query: $login, type: USER, first: 1) {
      edges {
        node {
          ... on User {
            organization(login: $org) {
              id
            }
          }
        }
      }
    }
  }
  `

  const isMemberResult = await github.graphql(isMemberQuery, {
    login,
    org,
  })

  console.log(isMemberResult);

  let userIsMember = false;

  if(isMemberResult.data.search.edges.length > 0) { // Make sure there is at least one user
    const user = isMemberResult.data.search.edges[0].node;

    if(user.organization !== null) { // If the organization field is not null, then the user is a member
      userIsMember = true;
    }
  }

  return userIsMember
}

module.exports = { isCypressOrgMember }

