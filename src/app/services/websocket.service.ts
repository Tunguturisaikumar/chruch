import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket?: WebSocket;

  public events$ = new Subject<any>();

  private reconnectDelay = 5000;

  private manuallyClosed = false;

  // --------------------------------------------------------
  // Connect
  // --------------------------------------------------------

  connect(): void {

    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      console.log("WebSocket already connected.");
      return;
    }

    this.manuallyClosed = false;

    console.log("====================================");
    console.log("Connecting WebSocket...");
    console.log(environment.websocketUrl);
    console.log("====================================");

    this.socket = new WebSocket(environment.websocketUrl);

    // --------------------------------------------------------
    // Open
    // --------------------------------------------------------

    this.socket.onopen = () => {

      console.log("====================================");
      console.log("✅ WebSocket Connected");
      console.log("====================================");

    };

    // --------------------------------------------------------
    // Message
    // --------------------------------------------------------

    this.socket.onmessage = (message) => {

      try {

        const data = JSON.parse(message.data);

        if (!data.type) {
          return;
        }

        // ------------------------
        // History
        // ------------------------

        if (data.type === "history") {

          console.log(
            `History received (${data.events.length} events)`
          );

          data.events.forEach((event: any) => {

            this.events$.next(event);

          });

          return;
        }

        // ------------------------
        // Live Event
        // ------------------------

        if (data.type === "event") {

          this.events$.next(data.event);
          console.log("🌍 Live Event Received", data.event);

          return;
        }

      }
      catch (error) {

        console.error(
          "WebSocket parse error",
          error
        );

      }

    };

    // --------------------------------------------------------
    // Error
    // --------------------------------------------------------

    this.socket.onerror = (error) => {

      console.error(
        "WebSocket Error",
        error
      );

    };

    // --------------------------------------------------------
    // Close
    // --------------------------------------------------------

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

  // --------------------------------------------------------
  // Disconnect
  // --------------------------------------------------------

  disconnect(): void {

    this.manuallyClosed = true;

    if (this.socket) {

      this.socket.close();

      this.socket = undefined;

    }

  }

  // --------------------------------------------------------
  // Connection Status
  // --------------------------------------------------------

  isConnected(): boolean {

    return !!this.socket &&
      this.socket.readyState === WebSocket.OPEN;

  }

}