async function handleComment(github, context) {
    const repo = await github.rest.repos.get({
        owner: 'nagash77-cypress',
        repo: 'hello-world-javascript-action'
      });
      
      console.log(repo.data);
   
    // Only continue if the payload was triggered by a comment event and the comment was made by a human user
    if (!context.payload.comment || context.payload.comment.user.type === "Bot") {
      console.log("Payload does not contain a comment event made by a human user.");
      return;
    }
  
    // Get the details of the issue or pull request that triggered the workflow
    const { issue, pull_request } = context.payload;
    const issueOrPullRequest = issue || pull_request;

    console.log(context.payload);

    const MemberQuery = `query ($login: String!, $org: String!) {
        user(login: $login) {
          organization(login: $org) {
            viewerCanAdminister
            viewerIsAMember
          }
        }
      }`;
      const MemberVariables = {
        login: context.payload.comment.user.login,
        org: context.repo.repo
      }
      const MemberResult = await github.graphql(MemberQuery, MemberVariables)
      console.log(result)
  
    // Only continue if the comment was made by someone outside of the organization
    if (issueOrPullRequest.user.type === "User" && !issueOrPullRequest.user.site_admin) {
      console.log("Comment was made by a user outside of the organization.");
  
      // Check if the issue/pull request is already on the project board
      const cardsResponse = await github.rest.projects.listCards({
        column_id: 1
      });
      const card = cardsResponse.data.find(
        (card) => card.content_url === issueOrPullRequest.url
      );
  
      // If the card is not on the board, add it to the 'New Issue' column
      if (!card) {
        console.log("Issue/pull request is not on the project board.");
        const createCardResponse = await github.rest.projects.createCard({
          column_id: 1,
          content_id: issueOrPullRequest.id,
          content_type: "Issue"
        });
        console.log(createCardResponse);
      }
  
      // If the card is archived, unarchive it
      if (card && card.archived) {
        console.log("Issue/pull request is archived on the project board.");
        const updateCardResponse = await github.rest.projects.updateCard({
          card_id: card.id,
          archived: false
        });
        console.log(updateCardResponse);
      }
  
      // Move the card to the 'New Issue' column
      if (card && !card.archived) {
        console.log("Issue/pull request is on the project board.");
        const moveCardResponse = await github.rest.projects.moveCard({
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
