import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { types } from '@typegoose/typegoose';
import { CommentService } from './comment-service.interface.js';
import { Component } from '../../types/index.js';
import { CommentEntity, CommentModel } from './comment.entity.js';
import { DefaultCommentService } from './default-comment.service.js';
import CommentController from './comment.controller.js';
import { Controller } from '../../libs/rest/index.js';

export function createCommentContainer() {
  return new ContainerModule((options: ContainerModuleLoadOptions) => {
    options.bind<CommentService>(Component.CommentService).to(DefaultCommentService).inSingletonScope();
    options.bind<types.ModelType<CommentEntity>>(Component.CommentModel).toConstantValue(CommentModel);
    options.bind<Controller>(Component.CommentController).to(CommentController).inSingletonScope();
  });
}
