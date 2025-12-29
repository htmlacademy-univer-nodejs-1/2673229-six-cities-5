import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type { UserAuth, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer } from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import {
  adaptOffer,
  adaptOffers,
  adaptComment,
  adaptComments,
  adaptNewOfferToCreatePayload,
  adaptOfferToUpdatePayload,
} from '../adapters';
import type { BackendOffer, BackendComment } from '../adapters';
import { Token, getTokenPayload, decodeTokenPayload } from '../utils';

type Extra = {
  api: AxiosInstance;
  history: History;
}

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register'
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOffer[]>(ApiRoute.Offers);

    return adaptOffers(data);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const tokenPayload = getTokenPayload();

    if (!tokenPayload?.id) {
      return [];
    }

    const { data } = await api.get<BackendOffer[]>(`${ApiRoute.Users}/${tokenPayload.id}/favorites`);

    return adaptOffers(data);
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<BackendOffer>(`${ApiRoute.Offers}/${id}`);

      return adaptOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<void, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const payload = adaptNewOfferToCreatePayload(newOffer);
    const { data } = await api.post<BackendOffer>(ApiRoute.Offers, payload);
    const createdOffer = adaptOffer(data);

    if (createdOffer.id) {
      history.push(`${AppRoute.Property}/${createdOffer.id}`);
    } else {
      history.push(AppRoute.Root);
    }
  });

export const editOffer = createAsyncThunk<void, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const payload = adaptOfferToUpdatePayload(offer);
    await api.patch(`${ApiRoute.Offers}/${offer.id}`, payload);
    history.push(`${AppRoute.Property}/${offer.id}`);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOffer[]>(`${ApiRoute.Premium}/${cityName}`);

    return adaptOffers(data);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendComment[]>(`${ApiRoute.Offers}/${id}/comments`);

    return adaptComments(data);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<{ email: string }>(ApiRoute.Login);

      return data.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.post<{ email: string; token: string }>(ApiRoute.Login, { email, password });
    const { token } = data;

    Token.save(token);
    dispatch(fetchFavoriteOffers());
    history.push(AppRoute.Root);

    return email;
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async (_, { extra }) => {
    const { api } = extra;
    await api.delete(ApiRoute.Logout);

    Token.drop();
  });

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, avatar, isPro }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<{ id?: string }>(ApiRoute.Register, {
      email,
      password,
      firstname: name,
      type: isPro ? 'pro' : 'standard',
      avatarPath: '',
    });

    let userId = data?.id ?? '';

    if (avatar) {
      if (!userId) {
        const loginResponse = await api.post<{ token: string }>(ApiRoute.Login, { email, password });
        const tokenPayload = decodeTokenPayload(loginResponse.data.token);
        userId = tokenPayload?.id ?? '';
      }

      if (userId) {
        const payload = new FormData();
        payload.append('avatar', avatar);
        await api.post(`${ApiRoute.Users}/${userId}${ApiRoute.Avatar}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    }
    history.push(AppRoute.Login);
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<BackendComment>(`${ApiRoute.Offers}/${id}/comments`, { text: comment, rating });

    return adaptComment(data);
  });

export const postFavorite = createAsyncThunk<FavoriteAuth, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;
    const tokenPayload = getTokenPayload();

    if (!tokenPayload?.id) {
      history.push(AppRoute.Login);
      return Promise.reject(new Error('Unauthorized'));
    }

    try {
      if (status === 1) {
        await api.post(`${ApiRoute.Users}/${tokenPayload.id}/favorites`, { offerId: id });
      } else {
        await api.delete(`${ApiRoute.Users}/${tokenPayload.id}/favorites/${id}`);
      }

      return { id, status };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });
