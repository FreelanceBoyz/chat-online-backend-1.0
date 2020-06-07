import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get("/.well-known/acme-challenge/:content")
  getHello(): string {
    return 'success';
  }
}
