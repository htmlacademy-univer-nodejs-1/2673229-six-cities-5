import 'reflect-metadata';
import { Container } from 'inversify';
import { RestApplication } from './rest/index.js';
import { Component } from './shared/types/index.js';
import { createRestApplicationContainer } from './rest/rest.container.js';
import { createUserContainer } from './shared/modules/user/index.js';
import { createOfferContainer } from './shared/modules/offer/index.js';


async function bootstrap() {
  const appContainer = new Container();

  appContainer.load(
    createRestApplicationContainer(),
    createUserContainer(),
    createOfferContainer()
  );


  const application = appContainer.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
