import type { GachaType, Rank } from './rules';

export type Team = { id: string; name: string; totalPoint?: number };
export type Cast = { id: string; name: string; teamId: string };
export type PointEvent = {
  id: string;
  castId: string;
  castName: string;
  teamId: string;
  teamName: string;
  type: string;
  point: number;
  createdAt: number;
};
export type GachaTicket = {
  id: string;
  castId: string;
  castName: string;
  teamId: string;
  teamName: string;
  gachaType: GachaType;
  used: boolean;
  createdAt: number;
  usedAt?: number;
};
export type GachaResult = {
  id: string;
  ticketId: string;
  castId: string;
  castName: string;
  teamId: string;
  teamName: string;
  gachaType: GachaType;
  rank: Rank;
  point: number;
  createdAt: number;
};
