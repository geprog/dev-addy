import * as path from 'path';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import { repoSchema } from '../../../schemas';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const _repoId = event.context.params?.repo_id;
  if (!_repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }
  const repoId = parseInt(_repoId, 10);

  const repo = await requireAccessToRepo(user, repoId);

  const config = useRuntimeConfig();
  const folder = path.join(config.data_path, repo.remoteId.toString());

  await createDataFolder();

  // clone repo
  console.log('clone', repo.cloneUrl, path.join(folder, 'repo'));

  if (!(await dirExists(path.join(folder, 'repo')))) {
    let log = await simpleGit().clone(repo.cloneUrl, path.join(folder, 'repo'));
    console.log('cloned', log);
  } else {
    let log = await simpleGit(path.join(folder, 'repo')).pull();
    console.log('pulled', log);
  }

  // write issues
  if (!(await dirExists(path.join(folder, 'issues')))) {
    await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
  } else {
    await fs.rm(path.join(folder, 'issues'), { recursive: true });
    await fs.mkdir(path.join(folder, 'issues'), { recursive: true });
  }

  const userForgeApi = await getUserForgeAPI(user, repo.forgeId);

  let page = 1;
  while (true) {
    const { items: issues, total } = await userForgeApi.getIssues(repo.remoteId.toString(), { page, perPage: 50 });
    for await (const issue of issues) {
      let issueString = `# issue "${issue.title}" (${issue.number})`;
      if (issue.labels.length !== 0) {
        issueString += `\n\nLabels: ` + issue.labels.join(', ');
      }
      if (issue.description !== '') {
        issueString += `\n\n${issue.description}`;
      }
      if (issue.comments.length !== 0) {
        issueString +=
          `\n\n## Comments:\n` +
          issue.comments.map((comment) => `- ${comment.author.login}: ${comment.body}`).join('\n');
      }
      await fs.writeFile(path.join(folder, 'issues', `${issue.number}.md`), issueString);
    }

    console.log('wrote', issues.length, 'issues');

    // TODO: improve stop condition
    if (issues.length < 50) {
      break;
    }
    page += 1;
  }

  console.log('start indexing ...');
  const indexingResponse = await $fetch<{ error?: string }>(`${config.api.url}/index`, {
    method: 'POST',
    body: {
      repo_name: repoId,
    },
  });

  if (indexingResponse.error) {
    console.error(indexingResponse.error);
    throw createError({
      statusCode: 500,
      statusMessage: 'cannot index repo',
    });
  }

  return 'ok';
});
