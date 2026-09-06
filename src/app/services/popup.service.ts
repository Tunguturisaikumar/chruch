import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { ChurchData } from '../models/church-data';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(
    private imageService: ImageService
  ) { }

  // =====================================================
  // POPUP STORAGE
  // =====================================================

  private previousCountryPopups: { popup: mapboxgl.Popup; key: string; group?: 'A' | 'B' }[] = [];
  private createdPopupKeys = new Set<string>();

  // =====================================================
  // GETTERS
  // =====================================================

  get popups(): mapboxgl.Popup[] {
    return this.previousCountryPopups.map(p => p.popup);
  }

  get popupKeys(): Set<string> {
    return this.createdPopupKeys;
  }

  // =====================================================
  // RESET
  // =====================================================

  reset(): void {
    this.previousCountryPopups.forEach(p => {
      try {
        p.popup.remove();
      } catch { }
    });
    this.previousCountryPopups = [];
    this.createdPopupKeys.clear();
  }

  // =====================================================
  // REGISTER SMALL POPUP
  // =====================================================

  registerPopup(
    popup: mapboxgl.Popup,
    key: string,
    group?: 'A' | 'B'
  ): void {
    this.previousCountryPopups.push({
      popup,
      key,
      group
    });
    this.createdPopupKeys.add(key);
  }

  // =====================================================
  // HAS POPUP
  // =====================================================

  hasPopup(key: string): boolean {
    return this.createdPopupKeys.has(key);
  }

  // =====================================================
  // LANGUAGE VALIDATION
  // =====================================================

  isValidLanguage(lang: any): boolean {
    if (lang === undefined || lang === null) {
      return false;
    }
    const str = lang.toString().trim();
    if (!str) {
      return false;
    }
    const lowerClean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (
      lowerClean === '' ||
      lowerClean === 'na' ||
      lowerClean === 'none' ||
      lowerClean === 'null' ||
      lowerClean === 'unknown' ||
      lowerClean === 'undefined' ||
      lowerClean === 'nil' ||
      lowerClean === 'nill'
    ) {
      return false;
    }
    return true;
  }

  // =====================================================
  // MAIN POPUP
  // =====================================================

  buildPopupCard(church: ChurchData): string {
    const personImg = this.imageService.getImageForChurch(church);

    let displayActivity = church.activity || '';
    const act = (church?.activity || '').toLowerCase().trim();

    if (act.includes('study') || act.includes('learn')) {
      displayActivity = 'Bible Study Lesson Completed';
    } else if (act.includes('reading') || act.includes('youversion') || act.includes('plan')) {
      displayActivity = 'Bible Reading Plan';
    } else if (act.includes('website') || act.includes('visitor') || act.includes('word')) {
      displayActivity = 'Website Visitor';
    } else if (act.includes('chat')) {
      displayActivity = 'Chat';
    }

    let bgStyle = 'background:#fff;';
    let borderStyle = '';
    const isChat = act.includes('chat');
    const isStudy = act.includes('study') || act.includes('learn');

    if (isChat) {
      bgStyle = 'background:#f5f3ff;';
      borderStyle = 'border: 2px solid #4f46e5;';
    } else if (isStudy) {
      bgStyle = 'background:#ecfdf5;';
      borderStyle = 'border: 2px solid #10b981;';
    }

    return `
<div style="
width:160px;
padding:10px;
border-radius:12px;
overflow:hidden;
${bgStyle}
${borderStyle}
box-shadow:0 4px 12px rgba(0,0,0,.2);
font-family:sans-serif;
">

<div style="
width:100%;
height:100px;
overflow:hidden;
margin-bottom:8px;
">
<img
src="${personImg}"
alt="${church.gender || 'Person'}"
style="
width:100%;
height:100%;
object-fit:cover;
display:block;
"/>
</div>

<div style="
display:grid;
grid-template-columns:70px 1fr;
row-gap:4px;
align-items:start;
">

<span style="font-weight:600;">
Country:
</span>
<span style="font-weight:700;">
${church.country}
</span>

${this.isValidLanguage(church.language) ? `
<span style="font-weight:600;">
Language:
</span>
<span style="font-weight:700;">
${church.language}
</span>
` : ''}

<span style="font-weight:600;">
Activity:
</span>
<span style="
font-weight:700;
word-break:break-word;
line-height:1.35;
display:inline-block;
">
${displayActivity}
</span>

</div>

</div>
`;
  }

  // =====================================================
  // GROUP POPUP
  // =====================================================

  buildPopupCardGrouped(church: ChurchData, count: number): string {
    const personImg = this.imageService.getImageForChurch(church);

    let displayActivity = church.activity || '';
    const act = (church?.activity || '').toLowerCase().trim();

    if (act.includes('study') || act.includes('learn')) {
      displayActivity = 'Bible Study Lesson Completed';
    } else if (act.includes('reading') || act.includes('youversion') || act.includes('plan')) {
      displayActivity = 'Bible Reading Plan';
    } else if (act.includes('website') || act.includes('visitor') || act.includes('word')) {
      displayActivity = 'Website Visitor';
    } else if (act.includes('chat')) {
      displayActivity = 'Chat';
    }

    let bgStyle = 'background:#fff;';
    let borderStyle = '';
    const isChat = act.includes('chat');
    const isStudy = act.includes('study') || act.includes('learn');

    if (isChat) {
      bgStyle = 'background:#f5f3ff;';
      borderStyle = 'border: 2px solid #4f46e5;';
    } else if (isStudy) {
      bgStyle = 'background:#ecfdf5;';
      borderStyle = 'border: 2px solid #10b981;';
    }

    return `
<div style="
width:160px;
padding:10px;
border-radius:12px;
overflow:hidden;
${bgStyle}
${borderStyle}
box-shadow:0 4px 12px rgba(0,0,0,.2);
font-family:sans-serif;
">

<div style="
width:100%;
height:100px;
overflow:hidden;
margin-bottom:6px;
">
<img
src="${personImg}"
alt="${church.gender || 'Person'}"
style="
width:100%;
height:100%;
object-fit:cover;
display:block;
"/>
</div>

${count > 0 ? `
<div style="
width:100%;
text-align:center;
margin:2px 0 8px 0;
font-weight:600;
font-size:12px;
color:#374151;
">
& ${count} ${count === 1 ? 'other' : 'others'}
</div>
` : ''}

<div style="
display:grid;
grid-template-columns:70px 1fr;
row-gap:4px;
align-items:start;
">

<span style="font-weight:600;">
Country:
</span>
<span style="font-weight:700;">
${church.country}
</span>

${this.isValidLanguage(church.language) ? `
<span style="font-weight:600;">
Language:
</span>
<span style="font-weight:700;">
${church.language}
</span>
` : ''}

<span style="font-weight:600;">
Activity:
</span>
<span style="
font-weight:700;
word-break:break-word;
line-height:1.35;
display:inline-block;
">
${displayActivity}
</span>

</div>

</div>
`;
  }

  // =====================================================
  // SMALL POPUP
  // =====================================================

  buildSmallPopup(church: ChurchData): string {
    const personImg = this.imageService.getImageForChurch(church);

    let displayActivity = church.activity || '';
    const act = (church?.activity || '').toLowerCase().trim();

    if (act.includes('study') || act.includes('learn')) {
      displayActivity = 'Bible Study Lesson Finished';
    } else if (act.includes('reading') || act.includes('youversion') || act.includes('plan')) {
      displayActivity = 'Bible Reading Plan';
    } else if (act.includes('website') || act.includes('visitor') || act.includes('word')) {
      displayActivity = 'Website Visitor';
    } else if (act.includes('chat')) {
      displayActivity = 'Chat';
    }

    let bgStyle = 'background:#fff;';
    let borderStyle = '';
    const isChat = act.includes('chat');
    const isStudy = act.includes('study') || act.includes('learn');

    if (isChat) {
      bgStyle = 'background:#f5f3ff;';
      borderStyle = 'border: 2px solid #4f46e5;';
    } else if (isStudy) {
      bgStyle = 'background:#ecfdf5;';
      borderStyle = 'border: 2px solid #10b981;';
    }

    return `
<div style="
width:65px;
padding:4px;
border-radius:8px;
box-shadow:0 2px 6px rgba(0,0,0,.2);
${bgStyle}
${borderStyle}
font-family:sans-serif;
">

<img
src="${personImg}"
alt="${church.gender || 'Person'}"
style="
width:100%;
height:38px;
object-fit:cover;
border-radius:6px;
margin-bottom:3px;
"/>

<div style="
font-size:6px;
font-weight:600;
text-align:center;
line-height:1.25;
">

<div style="margin-bottom:2px;">
${church.country}
</div>

<div style="line-height:1.25;">
${displayActivity}
</div>

</div>

</div>
`;
  }

  // =====================================================
  // REMOVE OLD POPUPS (GLOBAL LIMIT)
  // =====================================================

  enforcePopupLimit(maxPopups: number): void {
    while (this.previousCountryPopups.length > maxPopups) {
      const oldest = this.previousCountryPopups.shift();
      if (!oldest) {
        continue;
      }
      this.createdPopupKeys.delete(oldest.key);
      const element = oldest.popup.getElement();
      if (element) {
        element.classList.add('small-popup-exit');
        setTimeout(() => {
          try {
            oldest.popup.remove();
          } catch { }
        }, 300);
      } else {
        try {
          oldest.popup.remove();
        } catch { }
      }
    }
  }

  // =====================================================
  // REMOVE OLD POPUPS (GROUP A & B INDEPENDENT LIMITS)
  // =====================================================

  enforceGroupLimits(halfA: number, halfB: number): void {
    const groupAItems = this.previousCountryPopups.filter(item => item.group === 'A');
    while (groupAItems.length > halfA) {
      const oldestA = groupAItems.shift();
      if (oldestA) {
        this.removePopupItem(oldestA);
      }
    }

    const groupBItems = this.previousCountryPopups.filter(item => item.group === 'B');
    while (groupBItems.length > halfB) {
      const oldestB = groupBItems.shift();
      if (oldestB) {
        this.removePopupItem(oldestB);
      }
    }
  }

  private removePopupItem(item: { popup: mapboxgl.Popup; key: string; group?: 'A' | 'B' }): void {
    const index = this.previousCountryPopups.indexOf(item);
    if (index >= 0) {
      this.previousCountryPopups.splice(index, 1);
      this.createdPopupKeys.delete(item.key);
      const element = item.popup.getElement();
      if (element) {
        element.classList.add('small-popup-exit');
        setTimeout(() => {
          try { item.popup.remove(); } catch { }
        }, 300);
      } else {
        try { item.popup.remove(); } catch { }
      }
    }
  }

  // =====================================================
  // REMOVE ONE POPUP
  // =====================================================

  removePopup(popup: mapboxgl.Popup): void {
    try {
      popup.remove();
    } catch { }

    const index = this.previousCountryPopups.findIndex(item => item.popup === popup);
    if (index >= 0) {
      const item = this.previousCountryPopups[index];
      this.createdPopupKeys.delete(item.key);
      this.previousCountryPopups.splice(index, 1);
    }
  }

  // =====================================================
  // REMOVE ALL POPUPS
  // =====================================================

  clearAll(): void {
    this.previousCountryPopups.forEach(item => {
      try {
        item.popup.remove();
      } catch { }
    });
    this.previousCountryPopups = [];
    this.createdPopupKeys.clear();
  }

  // =====================================================
  // DESTROY
  // =====================================================

  destroy(): void {
    this.clearAll();
  }

}