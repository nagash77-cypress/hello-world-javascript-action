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

    const isCommentCreatorMemberofOrg = await isUserAnOrgMember(github, context);

    console.log(isCommentCreatorMemberofOrg);
    
    // If comment is from someone outside of the org
    if (MemberResult.user.organization == null) {
        // If issue is archived on the board, reactivate it

        // If the issue is open but is not on the project board, move it to the New Issues column on the project board

        // If the issue the issue is of status Closed on the project board, move it to the New Issues column

        
    }
   
  }  

async function isUserAnOrgMember(github, context) {

    isMember = false;
    
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
      const MemberResult = github.graphql(MemberQuery, MemberVariables)
      console.log(MemberVariables);
      console.log(MemberResult);
      console.log(MemberResult.user);
      console.log(MemberResult.user.organization);

      if (MemberResult.user.organization == null) {
        isMember = true;
      }

    return isMember;

}

module.exports = { handleComment };
