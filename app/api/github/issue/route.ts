import { Octokit } from "octokit";
import { NextResponse } from "next/server";

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

export async function POST(req: Request) {
  try {
    const { title, severity, acceptanceCriteria, labels, duplicateOf, owner, repo } = await req.json();

    if (!process.env.GITHUB_PAT) {
      return NextResponse.json(
        { error: "GITHUB_PAT is not configured in .env.local" },
        { status: 500 }
      );
    }

    const githubOwner = owner || process.env.GITHUB_OWNER;
    const githubRepo = repo || process.env.GITHUB_REPO;

    if (!githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: "Missing repository owner or name. Check GITHUB_OWNER and GITHUB_REPO in .env.local." },
        { status: 400 }
      );
    }

    const body = `
### Severity: ${severity}
### Acceptance Criteria
${acceptanceCriteria.map((ac: string) => `- [ ] ${ac}`).join("\n")}

---
*Created via AI PM Triage Tool*
    `;

    if (duplicateOf) {
      // Add a comment to the existing issue instead of creating a new one
      const commentBody = `
### AI Duplicate Detection Alert
This feedback was identified as a duplicate of this issue. 

**New Evidence/Feedback:**
- **Title Proposer:** ${title}
- **Implied Severity:** ${severity}
- **Suggested Criteria Changes:**
${acceptanceCriteria.map((ac: string) => `  - ${ac}`).join("\n")}

*Consolidated via AI PM Triage Tool*
      `;

      const response = await octokit.rest.issues.createComment({
        owner: githubOwner,
        repo: githubRepo,
        issue_number: duplicateOf,
        body: commentBody,
      });

      return NextResponse.json({
        success: true,
        issueUrl: response.data.html_url,
        issueNumber: duplicateOf,
        isComment: true,
      });
    }

    // Create a new issue
    const response = await octokit.rest.issues.create({
      owner: githubOwner,
      repo: githubRepo,
      title: title,
      body: body,
      labels: labels,
    });

    return NextResponse.json({
      success: true,
      issueUrl: response.data.html_url,
      issueNumber: response.data.number,
      isComment: false,
    });
  } catch (error: any) {
    console.error("GitHub API Error Details:", {
      status: error.status,
      message: error.message,
      documentation_url: error.documentation_url,
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create GitHub issue", 
        details: error.message,
        status: error.status
      },
      { status: error.status || 500 }
    );
  }
}
