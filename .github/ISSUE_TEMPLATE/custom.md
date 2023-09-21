name: Support Request
description: Create a Customer Success/Support request related to Cypress App
body:

- type: markdown
    attributes:
      value: |
        Please search to see if a request exists for the issue you're encountering. Within the template below, provide as much detail as possible. Comments such as this describe each of the fields below without making those descriptions visible within the submitted issue.
- type: textarea
    id: description
    attributes:
      label: Description
      description: Please provide a description of the issue you're seeing including screenshots, stack traces, etc.
      placeholder: Currently...
- type: input
    id: zendesk-url
    attributes:
      label: Zendesk URL
      description: Link to the corresponding issue within Zendesk
- type: textarea
    id: affected-tools
    attributes:
      label: Affected Tools / Systems
      description: Tools/Systems other than Cypress that are affected by this issue (SCM, CI/CD, Collaboration tools, etc.)
- type: textarea
    id: reproduction
    attributes:
      label: Reproduction steps
- type: input
    id: cypress-version
    attributes:
      label: Cypress version
      description: What version of Cypress are they using? If the issue is the result of an upgrade, the version of Cypress that was in use before the upgrade.
      placeholder: ex. v12.8.0
- type: textarea
    id: affected-customers
    attributes:
      label: Affected Customers
      description: No. of Customers affected. If few, please share names of the Customers
- type: input
    id: org-id
    attributes:
      label: Organization Name / UUID
      description: The name or UUID of the impacted organization.
- type: input
    id: impersonate-url
    attributes:
      label: Impersonation URL
      description: Specify an impersonation URL for an impacted user, if relevant
- type: dropdown
    id: top-10
    attributes:
      label: Top 10?
      description: Are any of the affected customers a Top 10 Customer?
      options:
        - "Yes"
        - "No"
- type: textarea
    id: revenue-impact
    attributes:
      label: Annual Revenue Impact
      description: Amount of annual revenue impacted by the issue
- type: dropdown
    id: customer-impact
    attributes:
      label: Customer Impact
      description: "The degree to which the issue impacts Cypress customers. Select one of the following:"
      options:
        - Extensive / Widespread
        - Significant / Large
        - Moderate / Limited
        - Minor / Localized
- type: textarea
    id: functional-impact
    attributes:
      label: Functional Impact
      description: Affected services, features, functionality etc.
- type: textarea
    id: workarounds
    attributes:
      label: Workarounds
      description: Available workarounds (if any) and their cost/effort
- type: textarea
    id: support-level
    attributes:
      label: Support Level
      description: Support levels/agreement terms such as Priority Support
- type: textarea
    id: asks
    attributes:
      label: What are your Asks?
      description: Clearly state what you are requesting to be done with any potential time constraints
- type: dropdown
    id: requested-priority
    attributes:
      label: Requested Priority
      description: "What is your requested priority? Select one of the following:"
      options:
        - Critical - Response needed immediately
        - Very High - Response needed within 24 hours
        - High - Response needed within 3-5 business days
        - Medium - Response needed within a few weeks
        - Low
- type: textarea
    id: other
    attributes:
      label: Other
      placeholder: Any other details?
