import { makeAutoObservable } from 'mobx';
import { fetchBackendJson } from '../../api/fetch';

interface ApiTimeStatistic {
  time: string;
  username: string;
  id: number;
}

interface ApiAmountStatistic {
  amount: string;
  username: string;
  id: number;
}

interface ApiRoomStatistic {
  id: string;
  amount: string;
  time: string;
  username: string;
}

export class StatisticsStore {
  public timePerUserData: ApiTimeStatistic[] = [];
  public amountPerUserData: ApiAmountStatistic[] = [];
  public roomData: ApiRoomStatistic[] = [];

  constructor() {
    this.fetchTimePerUser();
    this.fetchAmountPerUser();
    this.fetchRoomData();
    makeAutoObservable(this);
  }

  setTimePerUserData(newTimePerUserData: ApiTimeStatistic[]) {
    this.timePerUserData = newTimePerUserData;
  }

  setAmountPerUserData(newAmountPerUserData: ApiAmountStatistic[]) {
    this.amountPerUserData = newAmountPerUserData;
  }

  setRoomData(newRoomData: ApiRoomStatistic[]) {
    this.roomData = newRoomData;
  }

  async fetchTimePerUser() {
    const res = await fetchBackendJson<ApiTimeStatistic[], unknown>(
      '/statistics/time'
    );
    if (res.ok) this.setTimePerUserData(res.json);
  }

  async fetchAmountPerUser() {
    const res = await fetchBackendJson<ApiAmountStatistic[], unknown>(
      '/statistics/amount'
    );
    if (res.ok) this.setAmountPerUserData(res.json);
  }

  async fetchRoomData() {
    const res = await fetchBackendJson<ApiRoomStatistic[], unknown>(
      '/statistics/rooms'
    );
    if (res.ok) this.setRoomData(res.json);
  }
}
