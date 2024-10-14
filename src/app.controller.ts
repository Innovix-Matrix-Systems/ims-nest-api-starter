import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(@Res() res) {
    return res.json({
      message: 'Hello World! Welcome to IMS Nest API Starter. Happy Coding!',
    });
  }
}
