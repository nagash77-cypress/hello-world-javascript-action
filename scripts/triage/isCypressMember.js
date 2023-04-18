async function isCypressOrgMember(github, login, org) {
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
    org: org,
  })

  return isMemberResult.user.organization != null
}

module.exports = { isCypressOrgMember }
