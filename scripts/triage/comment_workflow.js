async function handleComment(github, context) {
    
    // Only continue if the payload was triggered by a comment event and the comment was made by a human user
    if (!context.payload.comment || context.payload.comment.user.type === "Bot") {
      console.log("Payload does not contain a comment event made by a human user.");
      return;
    }
  
    // Get the details of the issue or pull request that triggered the workflow
    const { issue, pull_request } = context.payload;
    const issueOrPullRequest = issue || pull_request;

    console.log(context.payload.organization.login);

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
        org: context.payload.organization.login
      }
      const MemberResult = await github.graphql(MemberQuery, MemberVariables)
      console.log(MemberVariables);
      console.log(MemberResult);
  
   
  }
  

module.exports = { handleComment };
