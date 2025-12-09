import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { AuthService } from './auth-service.interface.js';
import { Component } from '../../types/index.js';
import { DefaultAuthService } from './default-auth.service.js';
import { ExceptionFilter } from '../../libs/rest/index.js';
import { AuthExceptionFilter } from './auth.exception-filter.js';


export function createAuthContainer() {
  return new ContainerModule((options: ContainerModuleLoadOptions) => {
    options.bind<AuthService>(Component.CommentService).to(DefaultAuthService).inSingletonScope();
    options.bind<ExceptionFilter>(Component.CommentModel).to(AuthExceptionFilter).inSingletonScope();
  });
}
