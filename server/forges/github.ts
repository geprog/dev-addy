import type { H3Event } from 'h3';
import { Forge, UserInfo, Credentials, Tokens } from './types';
import { User, Forge as DBForge } from '../schemas';
import { Octokit } from 'octokit';

export class Github extends Forge {
  private clientId: string;
  private clientSecret: string;

  constructor(forge: DBForge) {
    super();
    this.clientId = forge.clientId;
    this.clientSecret = forge.clientSecret;
  }

  public getClientSecrect(): string {
    return this.clientSecret;
  }

  private getClient(token: string) {
    return new Octokit({
      auth: token,
    });
  }

  public async getCloneCredentials(todo: unknown): Promise<Credentials> {
    return {
      username: 'oauth',
      password: 'todo-token',
    };
  }

  public getOauthRedirectUrl({ state }: { state: string }): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=public_repo&state=${state}`;
  }

  public async getUserInfo(token: string): Promise<UserInfo> {
    const client = this.getClient(token);
    const githubUser = await client.request('GET /user');
    return {
      name: githubUser.data.name || undefined,
      avatarUrl: githubUser.data.avatar_url || undefined,
      email: githubUser.data.email || undefined,
      remoteUserId: githubUser.data.id.toString(),
    };
  }

  public async getTokens(event: H3Event, refreshToken?: string): Promise<Tokens> {
    const { code } = getQuery(event);

    if (!code) {
      throw new Error('No code provided');
    }
    const response: any = await $fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        ...(refreshToken && { refresh_token: refreshToken }),
      },
    });

    if (response.error) {
      console.error(response.error);
      throw new Error('Error getting access token');
    }
    //TODO: set expiration for accessTokens from github. Otherwise it won't provide refresh tokens
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  }
}
