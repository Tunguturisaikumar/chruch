import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  chatInterval!: number;
  readingInterval!: number;
  studyInterval!: number;
  websiteInterval!: number;
  cardDuration!: number;
  showPastRecords!: number;
  groupCount!: number;

  tempChatInterval!: number;
  tempReadingInterval!: number;
  tempStudyInterval!: number;
  tempWebsiteInterval!: number;
  tempCardDuration!: number;
  tempShowPastRecords!: number;
  tempGroupCount!: number;

  ngOnInit() {

    this.loadSettings();

  }

  loadSettings() {

    this.auth.getSettings().subscribe({

      next: (res: any) => {

        console.log(res);

        this.chatInterval = res.chatInterval;
        this.readingInterval = res.readingInterval;
        this.studyInterval = res.studyInterval;
        this.websiteInterval = res.websiteInterval;
        this.cardDuration = res.cardDuration;
        this.showPastRecords = res.showPastRecords;
        this.groupCount = res.groupCount;

        this.tempChatInterval = res.chatInterval;
        this.tempReadingInterval = res.readingInterval;
        this.tempStudyInterval = res.studyInterval;
        this.tempWebsiteInterval = res.websiteInterval;
         this.tempCardDuration = res.cardDuration;
        this.tempShowPastRecords = res.showPastRecords;
        this.tempGroupCount = res.groupCount;


      },

      error: err => {

        console.log(err);

      }

    });

  }

  saveChatInterval() {

    this.auth.saveChatInterval({

      chatInterval: this.tempChatInterval

    }).subscribe({

      next: () => {

        this.loadSettings();

      }

    });

  }

  saveReadingInterval() {

    this.auth.saveReadingInterval({

      readingInterval: this.tempReadingInterval

    }).subscribe({

      next: () => {

        this.loadSettings();

      }

    });

  }

  saveStudyInterval() {

    this.auth.saveStudyInterval({

      studyInterval: this.tempStudyInterval

    }).subscribe({

      next: () => {

        this.loadSettings();

      }

    });

  }

  saveWebsiteInterval() {

    this.auth.saveWebsiteInterval({

      websiteInterval: this.tempWebsiteInterval

    }).subscribe({

      next: () => {

        this.loadSettings();

      }

    });

  }

  saveCardDuration() {

  this.auth.saveCardDuration({

    cardDuration: this.tempCardDuration

  }).subscribe({

    next: () => {

      this.loadSettings();

    }

  });

}

saveShowPastRecords() {

  this.auth.saveShowPastRecords({

    showPastRecords: this.tempShowPastRecords

  }).subscribe({

    next: () => {

      this.loadSettings();

    }

  });

}

saveGroupCount() {

  this.auth.saveGroupCount({

    groupCount: this.tempGroupCount

  }).subscribe({

    next: () => {

      this.loadSettings();

    }

  });

}

  logout() {

    this.auth.logout().subscribe({

      next: () => {

        this.router.navigate(['/']);

      },

      error: () => {

        this.router.navigate(['/']);

      }

    });

  }

}