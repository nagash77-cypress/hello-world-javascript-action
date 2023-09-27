const createPullRequest = async ({ context, github, core, baseBranch, branchName, description, body, reviewers, addToProjectBoard }) => {
  
  
  console.log("repo owner - " + context.repo.owner );
  console.log("repo - " + context.repo.repo );


  const { data: { number } } = await github.rest.pulls.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    base: baseBranch,
    head: branchName,
    title: `chore: ${description}`,
    body,
    maintainer_can_modify: true,
  })


  if (reviewers) {
    await github.rest.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: number,
      reviewers,
    })
  }

  //add to firewatch board
  if (addToProjectBoard) {
    const addToProjectBoardQuery = `
          mutation ($project_id: ID!, $item_id: ID!) {
            addProjectV2ItemById(input: {contentId: $item_id, projectId: $project_id}) {
              clientMutationId
              item {
                id
              }
            }
          }`

    const addToProjectBoardQueryVars = {
      project_id: 1,
      item_id: number,
    }

    await github.graphql(
      addToProjectBoardQuery,
      addToProjectBoardQueryVars,
    )
  }

  core.setOutput('pr', number)

}

module.exports = {
  createPullRequest,
}
