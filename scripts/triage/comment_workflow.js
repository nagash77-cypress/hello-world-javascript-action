const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const boardId = process.env.BOARD_ID;
const orgName = process.env.ORG_NAME;
const projectStatus = process.env.PROJECT_STATUS;

switch (projectStatus) {
    case "New Issue":
        // Do something if the project status is Backlog
        console.log(`Unknown project status: ${projectStatus}`);
        break;
    case "Investigating":
        // Do something if the project status is To do
        console.log(`Unknown project status: ${projectStatus}`);
        break;
    case "Awaiting Response":
        // Do something if the project status is In progress
        console.log(`Unknown project status: ${projectStatus}`);
        break;
    case "Closed":
        // Do something if the project status is Done
        console.log(`Unknown project status: ${projectStatus}`);
        break;
    case "Closed":
        // Do something if the project status is Done
        console.log(`Unknown project status: ${projectStatus}`);
        break;
    default:
        console.log(`Unknown project status: ${projectStatus}`);
}

// Use the orgName, boardId, and other environment variables as needed
// to update the issue or PR status, label, author, etc.
