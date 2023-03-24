import * as core from "@actions/core";
import * as github from "@actions/github";
import { PullRequestEvent } from "@octokit/webhooks-definitions/schema";

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const COMMENT_HEADER = "### DHIS2 Jira Links";

const event = github.context.payload as PullRequestEvent;

export async function createOrUpdateComment(commentBody: string) {
  const octokit = github.getOctokit(GITHUB_TOKEN);
  const comments = await octokit.rest.issues.listComments({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: event.pull_request.number,
  });
  core.info(comments.data.toString());
  const existingComment = comments.data.find((comment) =>
    comment.body?.startsWith(COMMENT_HEADER)
  );

  if (existingComment) {
    await octokit.rest.issues.updateComment({
      ...github.context.repo,
      issue_number: event.pull_request.number,
      comment_id: existingComment.id,
      body: commentBody,
    });
  } else {
    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: event.pull_request.number,
      body: `${COMMENT_HEADER}
${commentBody}`,
    });
  }
}