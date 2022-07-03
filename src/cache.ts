import type { LoDashStatic } from "lodash";
import type { ProjectPathsConfig } from "hardhat/types/config";
import type { FeConfig } from "./types";

import path from "path";
import fsExtra from "fs-extra";
import * as t from "io-ts";

import { CACHE_FORMAT_VERSION, FE_FILES_CACHE_FILENAME } from "./constants";
import { getLogger } from "./util";

const log = getLogger("cache");

const CacheEntryCodec = t.type({
  lastModificationDate: t.number,
  contentHash: t.string,
  sourceName: t.string,
  feConfig: t.any,
  versionPragma: t.string,
  artifacts: t.array(t.string),
});

const CacheCodec = t.type({
  _format: t.string,
  files: t.record(t.string, CacheEntryCodec),
});

export interface CacheEntry {
  lastModificationDate: number;
  contentHash: string;
  sourceName: string;
  feConfig: FeConfig;
  versionPragma: string;
  artifacts: string[];
}

export interface Cache {
  _format: string;
  files: Record<string, CacheEntry>;
}

export class FeFilesCache {
  constructor(private _cache: Cache) {}

  public static createEmpty(): FeFilesCache {
    return new FeFilesCache({ _format: CACHE_FORMAT_VERSION, files: {} });
  }

  public static async readFromFile(
    feFilesCachePath: string
  ): Promise<FeFilesCache> {
    const cacheRaw: Cache = fsExtra.existsSync(feFilesCachePath)
      ? fsExtra.readJSONSync(feFilesCachePath)
      : {
          _format: CACHE_FORMAT_VERSION,
          files: {},
        };

    const result = CacheCodec.decode(cacheRaw);

    if (result.isRight()) {
      const feFilesCache = new FeFilesCache(result.value);
      await feFilesCache.removeNonExistingFiles();
      return feFilesCache;
    }

    log("There was a problem reading the cache");

    return FeFilesCache.createEmpty();
  }

  public async removeNonExistingFiles() {
    for (const absolutePath of Object.keys(this._cache.files)) {
      if (!fsExtra.existsSync(absolutePath)) {
        this.removeEntry(absolutePath);
      }
    }
  }

  public async writeToFile(feFilesCachePath: string) {
    await fsExtra.outputJson(feFilesCachePath, this._cache, { spaces: 2 });
  }

  public addFile(absolutePath: string, entry: CacheEntry) {
    this._cache.files[absolutePath] = entry;
  }

  public getEntries(): CacheEntry[] {
    return Object.values(this._cache.files);
  }

  public getEntry(file: string): CacheEntry | undefined {
    return this._cache.files[file];
  }

  public removeEntry(file: string) {
    delete this._cache.files[file];
  }

  public hasFileChanged(
    absolutePath: string,
    contentHash: string,
    feConfig?: FeConfig
  ): boolean {
    const { isEqual }: LoDashStatic = require("lodash");

    const cacheEntry = this.getEntry(absolutePath);

    if (cacheEntry === undefined) {
      // new file or no cache available, assume it's new
      return true;
    }

    if (cacheEntry.contentHash !== contentHash) {
      return true;
    }

    if (
      feConfig !== undefined &&
      !isEqual(feConfig, cacheEntry.feConfig)
    ) {
      return true;
    }

    return false;
  }
}

export function getFeFilesCachePath(paths: ProjectPathsConfig): string {
  return path.join(paths.cache, FE_FILES_CACHE_FILENAME);
}