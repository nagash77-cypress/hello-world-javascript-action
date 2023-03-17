async function handleComment(github, context) {
    // Only continue if the payload was triggered by a comment event and the comment was made by a human user
    if (!context.payload.comment || context.payload.comment.user.type === "Bot") {
      console.log("Payload does not contain a comment event made by a human user.");
      return;
    }
  
    // Get the details of the issue or pull request that triggered the workflow
    const { issue, pull_request } = context.payload;
    const issueOrPullRequest = issue || pull_request;
  
    // Only continue if the comment was made by someone outside of the organization
    if (issueOrPullRequest.user.type === "User" && !issueOrPullRequest.user.site_admin) {
      console.log("Comment was made by a user outside of the organization.");
  
      // Check if the issue/pull request is already on the project board
      const cardsResponse = await github.projects.listCardsForRepo({
        column_id: 1
      });
      const card = cardsResponse.data.find(
        (card) => card.content_url === issueOrPullRequest.url
      );
  
      // If the card is not on the board, add it to the 'New Issue' column
      if (!card) {
        console.log("Issue/pull request is not on the project board.");
        const createCardResponse = await github.projects.createCard({
          column_id: 1,
          content_id: issueOrPullRequest.id,
          content_type: "Issue"
        });
        console.log(createCardResponse);
      }
  
      // If the card is archived, unarchive it
      if (card && card.archived) {
        console.log("Issue/pull request is archived on the project board.");
        const updateCardResponse = await github.projects.updateCard({
          card_id: card.id,
          archived: false
        });
        console.log(updateCardResponse);
      }
  
      // Move the card to the 'New Issue' column
      if (card && !card.archived) {
        console.log("Issue/pull request is on the project board.");
        const moveCardResponse = await github.projects.moveCard({
          card_id: card.id,
          column_id: 1
        });
        console.log(moveCardResponse);
      }
  
      // Add the 'Popular Issue' label to the issue/pull request
      if (issueOrPullRequest.reactions.total_count + issueOrPullRequest.comments > 25) {
        console.log("Issue/pull request has reached 25 comments/reactions.");
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
