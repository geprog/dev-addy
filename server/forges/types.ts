import { H3Event } from 'h3';

export type Tokens = { accessToken: string; refreshToken: string };
export type Credentials = {
  username: string;
  password: string;
};
export type UserInfo = {
  name?: string;
  avatarUrl?: string;
  email?: string;
  remoteUserId: string;
 
};

export abstract class Forge {
  public abstract getCloneCredentials(todo: unknown): Promise<Credentials>;
  public abstract getOauthRedirectUrl(o: { state: string }): string;
  public abstract getTokens(event: H3Event): Promise<Tokens>;
  public abstract getUserInfo(token:string): Promise<any>;

  public async oauthCallback(event: H3Event, tokens: Tokens): Promise<UserInfo> {
    const validTokens = tokens ? tokens : await this.getTokens(event);
    const token = validTokens.accessToken;


    const user = await this.getUserInfo(token);

    return {
      name: user.name || undefined,
      avatarUrl: user.avatar_url || undefined,
      email: user.email || undefined,
      remoteUserId: user.id.toString(),
    };
  }
}
