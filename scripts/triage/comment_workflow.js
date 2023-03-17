async function execute(github, context) {
    // Get the comment body and author
    const commentBody = context.payload.comment.body;
    const commentAuthor = context.payload.comment.user.login;
    
    // Get a reference to the Octokit client
    const octokit = github.getOctokit();
    
    // If the comment author is a collaborator, add a "collaborator" label to the issue
    const { data: collaborators } = await octokit.rest.repos.listCollaborators({
      owner: context.repo.owner,
      repo: context.repo.repo
    });
    if (collaborators.some(collaborator => collaborator.login === commentAuthor)) {
      const issueNumber = context.payload.issue.number;
      await octokit.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        labels: ["collaborator"]
      });
      console.log(`Added "collaborator" label to issue #${issueNumber}`);
    }
    
    // If the comment body includes the word "help", assign the issue to the current user
    if (commentBody.includes("help")) {
      const assignee = context.payload.sender.login;
      const issueNumber = context.payload.issue.number;
      await octokit.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        assignees: [assignee]
      });
      console.log(`Assigned issue #${issueNumber} to ${assignee}`);
    }
  }
  