export interface FeBuild {
  version: string;
  compilerPath: string;
}

export interface FeConfig {
  version: string;
}

export enum CompilerPlatform {
  LINUX = "amd64",
  MACOS = "mac",
}

export interface CompilerReleaseAsset {
  name: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  browser_download_url: string;
}

export interface CompilerRelease {
  assets: CompilerReleaseAsset[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  tag_name: string;
}

export type CompilersList = CompilerRelease[];