import { createSlice } from '@reduxjs/toolkit';

import type { SiteData } from '../../types/state';
import { StoreSlice, SubmitStatus } from '../../const';
import {
  fetchOffers,
  fetchOffer,
  fetchPremiumOffers,
  fetchComments,
  postComment,
  postFavorite,
  fetchFavoriteOffers,
  logoutUser,
} from '../action';

const initialState: SiteData = {
  offers: [],
  isOffersLoading: false,
  offer: null,
  isOfferLoading: false,
  favoriteOffers: [],
  isFavoriteOffersLoading: false,
  premiumOffers: [],
  comments: [],
  commentStatus: SubmitStatus.Still,
};

export const siteData = createSlice({
  name: StoreSlice.SiteData,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.isOffersLoading = true;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = action.payload;
        state.isOffersLoading = false;
      })
      .addCase(fetchOffers.rejected, (state) => {
        state.isOffersLoading = false;
      })
      .addCase(fetchFavoriteOffers.pending, (state) => {
        state.isFavoriteOffersLoading = true;
      })
      .addCase(fetchFavoriteOffers.fulfilled, (state, action) => {
        state.favoriteOffers = action.payload;
        state.isFavoriteOffersLoading = false;

        const favoriteIds = new Set(action.payload.map((offer) => offer.id));
        state.offers = state.offers.map((offer) => ({
          ...offer,
          isFavorite: favoriteIds.has(offer.id),
        }));
        state.premiumOffers = state.premiumOffers.map((offer) => ({
          ...offer,
          isFavorite: favoriteIds.has(offer.id),
        }));

        if (state.offer) {
          state.offer = { ...state.offer, isFavorite: favoriteIds.has(state.offer.id) };
        }
      })
      .addCase(fetchFavoriteOffers.rejected, (state) => {
        state.favoriteOffers = [];
        state.isFavoriteOffersLoading = false;

        state.offers = state.offers.map((offer) => ({
          ...offer,
          isFavorite: false,
        }));
        state.premiumOffers = state.premiumOffers.map((offer) => ({
          ...offer,
          isFavorite: false,
        }));

        if (state.offer) {
          state.offer = { ...state.offer, isFavorite: false };
        }
      })
      .addCase(fetchOffer.pending, (state) => {
        state.isOfferLoading = true;
      })
      .addCase(fetchOffer.fulfilled, (state, action) => {
        state.offer = action.payload;
        state.isOfferLoading = false;
      })
      .addCase(fetchOffer.rejected, (state) => {
        state.isOfferLoading = false;
      })
      .addCase(fetchPremiumOffers.fulfilled, (state, action) => {
        state.premiumOffers = action.payload;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(postComment.pending, (state) => {
        state.commentStatus = SubmitStatus.Pending;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments = [action.payload, ...state.comments];
        state.commentStatus = SubmitStatus.Fullfilled;
      })
      .addCase(postComment.rejected, (state) => {
        state.commentStatus = SubmitStatus.Rejected;
      })
      .addCase(postFavorite.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const isFavorite = status === 1;

        state.offers = state.offers.map((offer) =>
          offer.id === id ? { ...offer, isFavorite } : offer
        );

        if (state.offer && state.offer.id === id) {
          state.offer = { ...state.offer, isFavorite };
        }

        if (isFavorite) {
          const offerToAdd = state.offers.find((offer) => offer.id === id);
          if (offerToAdd && !state.favoriteOffers.some((offer) => offer.id === id)) {
            state.favoriteOffers = state.favoriteOffers.concat(offerToAdd);
          }
        } else {
          state.favoriteOffers = state.favoriteOffers.filter((favoriteOffer) => favoriteOffer.id !== id);
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.favoriteOffers = [];
        state.isFavoriteOffersLoading = false;
        state.offers = state.offers.map((offer) => ({ ...offer, isFavorite: false }));
        state.premiumOffers = state.premiumOffers.map((offer) => ({ ...offer, isFavorite: false }));
        if (state.offer) {
          state.offer = { ...state.offer, isFavorite: false };
        }
      });
  }
});
