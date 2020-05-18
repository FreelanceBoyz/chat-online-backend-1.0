import { Injectable } from "@nestjs/common";

@Injectable()
export class EnvironmentService {
  private readonly settings;
  private readonly envPrefix = 'NHUTTM';
  constructor() {
    this.settings = process.env;
  }

  public getByKey(key: string) {
    return this.settings[`${this.envPrefix}_${key}`];
  }
}