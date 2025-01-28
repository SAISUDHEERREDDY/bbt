import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

export function floorTime(
  milliseconds: number,
  interval: number = 30 * 60 * 1000
) {
  return milliseconds - (milliseconds % interval);
}

/**
 * String enumerable type alias for event type property.
 */
export type ChannelEventType = 'stream' | 'file';

/**
 * interface resenting the common properties between serialize and usable
 * Channels
 */
export interface CommonChannel {
  name: string;
  number: string;
  url: string;
}

// Raw Response interfaces
/**
 * interface to represent the raw json representation handed back from the
 * server
 */
export interface SerializedChannel extends CommonChannel {
  event: Array<{
    time_id: number;
    name: string;
    description: string;
    start_time: string;
    duration: string;
    type: ChannelEventType;
    file: string;
    passKey: boolean;
    id: number;
  }>;
}
/**
 * interface to represent the raw response from the channel request
 */
export interface GetChannelsResponse {
  channel: SerializedChannel[];
}

// Transformed result interfaces
/**
 * Usable event in a channel with parent reference
 */
export interface ChannelEvent {
  /**
   * A id that uniquly indentifies the time & content pairing.
   * Uniques across all events
   */
  time_id: number;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  channel: Channel;
  type: ChannelEventType;
  file: string;
  passKey: boolean;
  id: number;
}

/**
 * Usable Channel
 */
export interface Channel extends CommonChannel {
  event: Array<ChannelEvent>;
}

@Injectable({
  providedIn: 'root'
})
export class LiveService {
  constructor(private http: HttpClient) {}

  /**
   * Requests the channels with the events for the next offset minutes
   * @param start - the number of minutes in the future to start at
   * @param end - the number of minutes in the future to stop at
   * @returns Observable that emits and array of channels
   */
  getChannels(start: Date, end: Date): Observable<Array<Channel>> {
    const params = new HttpParams()
      .append('start_ts', start.toISOString())
      .append('stop_ts', end.toISOString());
    return this.http.get('video_player/live', { params }).pipe(
      map((response: GetChannelsResponse): Array<Channel> => {
        const channels: Channel[] = [];
        response.channel.forEach((channel, i) => {
          const converted = {
            ...channel,
            event: channel.event.map((x): ChannelEvent => {
              const startTime = new Date(x.start_time);
              const duration = Number.parseInt(x.duration, 10);
              const { type, name, description, file, passKey, id, time_id } = x;
              return {
                time_id,
                type,
                name,
                description,
                file: file === '' ? null : file,
                passKey,
                startTime,
                endTime: new Date(startTime.valueOf() + duration * 60 * 1000),
                duration,
                channel: null,
                id
              };
            })
          };

          for (const event of converted.event) {
            event.channel = converted;
          }

          channels[i] = converted;
        });

        return channels;
      })
    );
  }

  /**
   * Helper function to find the nearest floor interval in milliseconds
   * @param milliseconds
   * @param interval - The interval to floor to. 30 minutes by default
   * @returns The floored milliseconds
   */
  floorTime(milliseconds: number, interval: number = 30 * 60 * 1000) {
    return floorTime(milliseconds, interval);
  }

  findCurrentEventFromChannel(channel: Channel): ChannelEvent {
    const now = new Date();
    for (const event of channel.event) {
      if (event.startTime <= now && now < event.endTime) {
        return event;
      }
    }
    return null;
  }
}
