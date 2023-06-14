async function generateKPIReport(github, context, core, triageObject, mitigationObject) {
  
  console.log(core)
  console.log('made it to the report function')
  // console.log(`triageObjectSting: ${triageObjectString}`)
  // console.log(`mitigationObjectString: ${mitigationObjectString}`)

  // let triageObject = JSON.parse(triageObjectString)
  // let mitigationObject = JSON.parse(mitigationObjectString)

  core.debug(triageObject)
  console.log(`${triageObject}`)
  
  console.log('--------------------Total Open Issues--------------------')
  //console.log(`Repos Being Queried:  ${reposArray}`);
  //console.log(`Total Open Issues:  ${openIssueSum}`);
  console.log('---------------------------------------------------------')

  //let closedIssueSum = getOpenedAndClosedIssueCount.search.nodes.reduce((total, node) => total + node.closedIssueCount.totalCount, 0)

  console.log('--------------------Total Closed Issues------------------')
  //console.log(`Repos Being Queried:  ${reposArray}`);
  //console.log(`Total Closed Issues:  ${closedIssueSum}`);
  console.log('---------------------------------------------------------')

  return true
}

module.exports = { generateKPIReport }