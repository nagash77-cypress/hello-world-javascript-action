async function handleItemCreation(github, context) {

    console.log(`github obj: ${ github }`);
    console.log(`context obj: ${ context }`);

    // Get the details of the issue or pull request that triggered the workflow
    const { issue, issue: { pull_request } } = context.payload;
    const issueOrPullRequest = pull_request ? { ...issue, type: "pullRequest" } : { ...issue, type: "issue" };

    const isMemberQuery = `query ($login: String!, $org: String!) {
        user(login: $login) {
          organization(login: $org) {
            viewerCanAdminister
            viewerIsAMember
          }
        }
      }`;
    const isMemberVariables = {
        login: context.payload.comment.user.login,
        org: context.payload.organization.login
    };
    
    const isMemberResult = await github.graphql(isMemberQuery, isMemberVariables);

    let isCommentFromMember = false;

    if (isMemberResult.user.organization != null) {
        isCommentFromMember = true;
        console.log(`Comment came from a member of the Org.  isCommentFromMember var: ${isCommentFromMember}`);
        
        //Don't do anything if the comment is from a member of the Org
        return
    };

};

module.exports = { handleItemCreation };
