import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferEntity, OfferModel } from './offer.entity.js';
import { types } from '@typegoose/typegoose';

export function createOfferContainer() {
  return new ContainerModule((options: ContainerModuleLoadOptions) => {
    options.bind<OfferService>(Component.OfferService).to(DefaultOfferService);
    options.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);

  });
}
