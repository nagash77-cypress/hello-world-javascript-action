const { isCypressOrgMember } = require('./isCypressMember')

// Pull request comment for PRs from the automated dependency bots
const DEPENDENCY_PR_COMMENT =
  'See the [guidelines for reviewing dependency updates](https://github.com/cypress-io/cypress/blob/develop/CONTRIBUTING.md#code-review-of-dependency-updates) for info on how to review dependency update PRs.'

// When a new pull request is opened, post comment to guide user to a successful contribution
const CONTRIBUTOR_PR_COMMENT =
  "- Create a [Draft Pull Request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests#draft-pull-requests) if your PR is not ready for review. [Mark the PR as **Ready for Review**](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/changing-the-stage-of-a-pull-request#marking-a-pull-request-as-ready-for-review) when you're ready for a Cypress team member to review the PR."

// When a new pull request is opened in the Cypress repository, add info on where to find PR Checklist in CONTRIBUTING guide
const CYPRESS_REPO_CONTRIBUTING_GUIDELINES =
  '- Become familiar with the [Code Review Checklist](https://github.com/cypress-io/cypress/blob/develop/CONTRIBUTING.md#Code-Review-Checklist) for guidelines on coding standards and what needs to be done before a PR can be merged.'

async function addContributingComment(github, context) {
  const { action, number, pull_request, repository, sender } = context.payload
  if (!pull_request) {
    console.log(
      "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred."
    )
    return
  }

  if (action !== 'opened') {
    return
  }

  const { login } = sender
  const isMember = await isCypressOrgMember(github, login)

  const dependencyBumpBots = [
    'dependabot[bot]',
    'github-actions[bot]',
    'renovate[bot]',
    'snyk-bot',
  ]
  const isDepBotPR = dependencyBumpBots.includes(login)

  console.log('is this pull request from an authorized bot?', isBotPR)

  if (isMember) {
    console.log('Cypress org members are aware of contributing guidelines.')
    return
  }

  let comment = isDepBotPR ? DEPENDENCY_PR_COMMENT : CONTRIBUTOR_PR_COMMENT

  if (repository === 'cypress') {
    comment += `\n${CYPRESS_REPO_CONTRIBUTING_GUIDELINES}`
  }

  await github.rest.createComment({
    owner: 'cypress-io',
    repo: repository,
    comment,
    issue_number: number,
  })
}

module.exports = { addContributingComment }
