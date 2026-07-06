import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private socket?: WebSocket;

  private reconnectDelay = 5000;

  private manuallyClosed = false;

  // ========================================================
  // EVENTS
  // ========================================================

  public events$ = new Subject<any>();

  // ========================================================
  // CONNECT
  // ========================================================

  connect(): void {

    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      console.log('WebSocket already connected.');
      return;
    }

    this.manuallyClosed = false;

    console.log('====================================');
    console.log('Connecting WebSocket...');
    console.log(environment.websocketUrl);
    console.log('====================================');

    this.socket = new WebSocket(
      environment.websocketUrl
    );

    // ========================================================
    // OPEN
    // ========================================================

    this.socket.onopen = () => {

      console.log('====================================');
      console.log('✅ WebSocket Connected');
      console.log('====================================');

    };

    // ========================================================
    // MESSAGE
    // ========================================================

    this.socket.onmessage = (message) => {

      try {

        const data = JSON.parse(message.data);

        if (!data.type) {
          return;
        }

        // ----------------------------------------------------
        // HISTORY
        // ----------------------------------------------------

        if (data.type === 'history') {

          console.log(
            `History received (${data.events.length} events)`
          );

          data.events.forEach((event: any) => {

            this.events$.next(event);

          });

          return;

        }

        // ----------------------------------------------------
        // LIVE EVENT
        // ----------------------------------------------------

        if (data.type === 'event') {

          console.log(
            '🌍 Live Event Received',
            data.event
          );

          this.events$.next(
            data.event
          );

          return;

        }

      }
      catch (error) {

        console.error(
          'WebSocket parse error',
          error
        );

      }

    };

    // ========================================================
    // ERROR
    // ========================================================

    this.socket.onerror = (error) => {

      console.error(
        'WebSocket Error',
        error
      );

    };

    // ========================================================
    // CLOSE
    // ========================================================

    this.socket.onclose = (event) => {

      console.warn(
        `WebSocket Closed (${event.code})`
      );

      this.socket = undefined;

      if (!this.manuallyClosed) {

        console.log(
          `Reconnecting in ${this.reconnectDelay / 1000}s...`
        );

        setTimeout(() => {

          this.connect();

        }, this.reconnectDelay);

      }

    };

  }

  // ========================================================
  // DISCONNECT
  // ========================================================

  disconnect(): void {

    this.manuallyClosed = true;

    if (this.socket) {

      this.socket.close();

      this.socket = undefined;

    }

  }

  // ========================================================
  // STATUS
  // ========================================================

  isConnected(): boolean {

    return !!this.socket &&
      this.socket.readyState === WebSocket.OPEN;

  }

}