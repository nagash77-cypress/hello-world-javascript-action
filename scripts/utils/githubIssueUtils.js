function parseIssueBody(issueBody) {
  const sections = issueBody.split("###");
  const parsedData = {};

  sections.forEach((section) => {
    const lines = section.trim().split("\n");
    const heading = lines.shift().trim();
    const content = lines.join("\n").trim();

    if (heading && content) {
      parsedData[heading] = content;
    }
  });

  return parsedData;
}

module.exports = { parseIssueBody };
