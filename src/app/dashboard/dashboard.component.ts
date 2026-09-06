import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

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
    chat: { groupCount: 1, order: 1 },
    reading: { groupCount: 1, order: 2 },
    study: { groupCount: 1, order: 3 },
    website: { groupCount: 1, order: 4 }
  };
  tempActivities: any = {
    chat: { groupCount: 1, order: 1 },
    reading: { groupCount: 1, order: 2 },
    study: { groupCount: 1, order: 3 },
    website: { groupCount: 1, order: 4 }
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
        this.toastr.success('Chat interval saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save chat interval', 'Error');
      }
    });
  }

  saveReadingInterval() {
    this.auth.saveReadingInterval({
      readingInterval: this.tempReadingInterval
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Bible Reading Plan interval saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save Bible Reading Plan interval', 'Error');
      }
    });
  }

  saveStudyInterval() {
    this.auth.saveStudyInterval({
      studyInterval: this.tempStudyInterval
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Bible Study interval saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save Bible Study interval', 'Error');
      }
    });
  }

  saveWebsiteInterval() {
    this.auth.saveWebsiteInterval({
      websiteInterval: this.tempWebsiteInterval
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Website Visitor interval saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save Website Visitor interval', 'Error');
      }
    });
  }

  saveCardDuration() {
    this.auth.saveCardDuration({
      cardDuration: this.tempCardDuration
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Card duration saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save card duration', 'Error');
      }
    });
  }

  saveShowPastRecords() {
    this.auth.saveShowPastRecords({
      showPastRecords: this.tempShowPastRecords
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Show past records saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save show past records', 'Error');
      }
    });
  }

  activityLabels: { [key: string]: string } = {
    chat: 'Chat',
    reading: 'Bible Reading Plan',
    study: 'Bible Study Lesson Completed',
    website: 'Website Visitor'
  };

  isGroupCountInvalid(key: string): boolean {
    const val = this.tempActivities?.[key]?.groupCount;
    if (val === null || val === undefined || val === '') return true;
    const num = Number(val);
    return isNaN(num) || num < 1 || num > 100;
  }

  isOrderInvalid(key: string): boolean {
    const val = this.tempActivities?.[key]?.order;
    if (val === null || val === undefined || val === '') return true;
    const num = Number(val);
    return isNaN(num) || num < 1 || num > 4 || !Number.isInteger(num);
  }

  hasDuplicateOrder(key: string): boolean {
    const val = this.tempActivities?.[key]?.order;
    if (val === null || val === undefined || val === '') return false;
    const currentOrder = Number(val);
    for (const otherKey of Object.keys(this.tempActivities || {})) {
      if (otherKey !== key) {
        const otherVal = this.tempActivities[otherKey]?.order;
        if (otherVal !== null && otherVal !== undefined && otherVal !== '' && Number(otherVal) === currentOrder) {
          return true;
        }
      }
    }
    return false;
  }

  saveActivitySettings() {
    const keys = Object.keys(this.tempActivities || {});
    if (keys.length === 0) return;

    // 1. Validate Group Count (must be > 0 and <= 100)
    for (const key of keys) {
      const label = this.activityLabels[key] || key;
      if (this.isGroupCountInvalid(key)) {
        this.toastr.error(
          `Group count for ${label} must be greater than 0 and less than or equal to 100.`,
          'Validation Error'
        );
        return;
      }
    }

    // 2. Validate Order (must be between 1 and 4)
    for (const key of keys) {
      const label = this.activityLabels[key] || key;
      if (this.isOrderInvalid(key)) {
        this.toastr.error(
          `Order for ${label} must be between 1 and 4 (1, 2, 3, 4).`,
          'Validation Error'
        );
        return;
      }
    }

    // 3. Validate Unique Orders across all 4 activities
    const orderMap = new Map<number, string>();
    for (const key of keys) {
      const order = Number(this.tempActivities[key]?.order);
      const label = this.activityLabels[key] || key;
      if (orderMap.has(order)) {
        const duplicateKey = orderMap.get(order)!;
        const duplicateLabel = this.activityLabels[duplicateKey] || duplicateKey;
        this.toastr.error(
          `Each activity must have a unique order number (1, 2, 3, 4). Order ${order} is assigned to both "${duplicateLabel}" and "${label}".`,
          'Validation Error'
        );
        return;
      }
      orderMap.set(order, key);
    }

    // Coerce values to numbers before saving
    const payload: any = {};
    for (const key of keys) {
      payload[key] = {
        groupCount: Number(this.tempActivities[key].groupCount),
        order: Number(this.tempActivities[key].order)
      };
    }

    this.auth.saveActivitySettings({
      activities: payload
    }).subscribe({
      next: () => {
        this.loadSettings();
        this.toastr.success('Activity settings saved successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to save activity settings', 'Error');
      }
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.toastr.success('Logout Successful', 'Success');
        this.router.navigate(['/']);
      },
      error: () => {
        this.toastr.error('Logout Failed', 'Error');
      }
    });
  }
}