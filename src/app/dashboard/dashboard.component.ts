import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(
    private router: Router,
    private auth: AuthService,
      private toastr: ToastrService
      
  ) { }

  chatInterval!: number;
  readingInterval!: number;
  studyInterval!: number;
  websiteInterval!: number;
  cardDuration!: number;
  showPastRecords!: number;
  activities: any = {
    chat: { groupCount: 4, order: 1 },
    reading: { groupCount: 4, order: 2 },
    study: { groupCount: 4, order: 3 },
    website: { groupCount: 4, order: 4 }
  };
  tempActivities: any = {
    chat: { groupCount: 4, order: 1 },
    reading: { groupCount: 4, order: 2 },
    study: { groupCount: 4, order: 3 },
    website: { groupCount: 4, order: 4 }
  };

  tempChatInterval!: number;
  tempReadingInterval!: number;
  tempStudyInterval!: number;
  tempWebsiteInterval!: number;
  tempCardDuration!: number;
  tempShowPastRecords!: number;

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

        this.tempChatInterval = res.chatInterval;
        this.tempReadingInterval = res.readingInterval;
        this.tempStudyInterval = res.studyInterval;
        this.tempWebsiteInterval = res.websiteInterval;
         this.tempCardDuration = res.cardDuration;
        this.tempShowPastRecords = res.showPastRecords;

        if (res.activities) {
          this.activities = JSON.parse(JSON.stringify(res.activities));
          this.tempActivities = JSON.parse(JSON.stringify(res.activities));
        }


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


  saveActivitySettings() {
    this.auth.saveActivitySettings({
      activities: this.tempActivities
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Activity settings saved successfully', 'Success');
      },
      error: err => {
        console.error(err);
        this.toastr.error('Failed to save activity settings', 'Error');
      }
    });
  }

  logout() {

  this.auth.logout().subscribe({

    next: () => {

      this.toastr.success(
        'Logout Successful',
        'Success'
      );

      this.router.navigate(['/']);

    },

    error: () => {

      this.toastr.error(
        'Logout Failed',
        'Error'
      );

    }

  });

}

}