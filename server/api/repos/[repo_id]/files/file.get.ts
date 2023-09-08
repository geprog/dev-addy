import path from 'path';
import fs from 'fs/promises';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const repoId = getRouterParam(event, 'repo_id');
  if (!repoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'repo_id is required',
    });
  }

  const body = getQuery(event);
  const _path = body.path as string;
  if (!_path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'path is required',
    });
  }

  const repo = await requireAccessToRepo(user, parseInt(repoId, 10));

  const config = useRuntimeConfig();
  const folder = path.join(config.data_path, repo.id.toString());

  const file = await fs.readFile(path.join(folder, 'repo', _path), { encoding: 'utf-8' });

  return file;
});
