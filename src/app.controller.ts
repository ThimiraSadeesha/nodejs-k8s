import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return 'Hello World!';
    }

    @Get('health')
    getHealth() {
        return this.appService.getHealth();
    }

    @Get('cpu')
    getCpuInfo() {
        return this.appService.getCpuInfo();
    }

    @Get('memory')
    getMemoryInfo() {
        return this.appService.getMemoryInfo();
    }

    @Get('event-loop')
    getEventLoopInfo() {
        return this.appService.getEventLoopInfo();
    }

    @Get('threads')
    getThreadInfo() {
        return this.appService.getThreadInfo();
    }

    @Get('system')
    getSystemInfo() {
        return this.appService.getSystemInfo();
    }
}
