async function handleComment(github, context) {
    // Get the details of the issue or pull request that triggered the workflow
    const { issue, pull_request } = context.payload;
    const issueOrPullRequest = issue || pull_request;
  
    // Only continue if the payload was triggered by a comment event and the comment was made by a human user
    if (!context.payload.comment || context.payload.comment.user.type === "Bot") {
      console.log("Payload does not contain a comment event made by a human user.");
      return;
    }
  
    // Only continue if the comment was made by someone outside of the organization
    if (issueOrPullRequest.user.type === "User" && !issueOrPullRequest.user.site_admin) {
      console.log("Comment was made by a user outside of the organization.");
  
      // Scenario 1: Add the issue to the 'New Issue' column on the project board with ID 1
      if (issueOrPullRequest.state === "closed") {
        console.log("Issue is closed.");
        const addIssueToBoardResponse = await github.projects.createCard({
          column_id: 1,
          content_id: issueOrPullRequest.id,
          content_type: "Issue"
        });
        console.log(addIssueToBoardResponse);
      }
  
      // Scenario 2: Move the issue to the 'New Issue' column on the project board with ID 1
      if (issueOrPullRequest.labels.some((label) => label.name === "stale")) {
        console.log("Issue has the 'stale' label.");
        const moveIssueToColumnResponse = await github.projects.moveCard({
          card_id: context.payload.project_card.id,
          column_id: 1
        });
        console.log(moveIssueToColumnResponse);
      }
  
      // Scenario 3: Add the 'Popular Issue' label to the issue
      if (issueOrPullRequest.reactions.total_count + issueOrPullRequest.comments > 25) {
        console.log("Issue has reached 25 comments/reactions.");
        const addLabelResponse = await github.rest.issues.addLabels({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issueOrPullRequest.number,
          labels: ["Popular Issue"]
        });
        console.log(addLabelResponse);
      }
    }
  }
  

module.exports = { handleComment };
