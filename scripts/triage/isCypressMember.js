async function isCypressOrgMember(github, login) {
  const isMemberQuery = `
    query ($login: String!, $org: String!) {
      user(login: $login) {
        organization(login: $org) {
          viewerIsAMember
        }
      }
    }
  `

  const isMemberResult = await github.graphql(isMemberQuery, {
    login,
    org: 'cypress-io',
  })

  return isMemberResult.user.organization != null
}

module.exports = { isCypressOrgMember }
