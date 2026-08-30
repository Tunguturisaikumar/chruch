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

  private previousCountryPopups:
    mapboxgl.Popup[] = [];

  private createdPopupKeys =
    new Set<string>();

  // =====================================================
  // GETTERS
  // =====================================================

  get popups(): mapboxgl.Popup[] {

    return this.previousCountryPopups;

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

        p.remove();

      }
      catch { }

    });

    this.previousCountryPopups = [];

    this.createdPopupKeys.clear();

  }

  // =====================================================
  // REGISTER SMALL POPUP
  // =====================================================

  registerPopup(
    popup: mapboxgl.Popup,
    key: string
  ): void {

    this.previousCountryPopups.push(
      popup
    );

    this.createdPopupKeys.add(
      key
    );

  }

  // =====================================================
  // HAS POPUP
  // =====================================================

  hasPopup(
    key: string
  ): boolean {

    return this.createdPopupKeys.has(
      key
    );

  }

  // =====================================================
  // MAIN POPUP
  // =====================================================

  buildPopupCard(
    church: ChurchData
  ): string {

    const personImg =
      this.imageService.getImageForChurch(church);

    console.log("MAIN POPUP");
console.log("imageKey:", church.imageKey);
console.log("imageIndex:", church.imageIndex);
console.log("image:", personImg);

    let displayActivity =
      church.activity;

    if (church.activity === 'Bible Study') {

      displayActivity =
        'Bible Study Lesson Completed';

    }
    else if (church.activity === 'Youversion') {

      displayActivity =
        'Bible Reading Plan';

    }
    else if (church.activity === 'Bible Word') {

      displayActivity =
        'Website Visitor';

    }

    let bgStyle = 'background:#fff;';
    let borderStyle = '';
    if (church.activity === 'Chat') {
      bgStyle = 'background:#f5f3ff;';
      borderStyle = 'border: 2px solid #4f46e5;';
    } else if (church.activity === 'Bible Learn' || church.activity === 'Bible Study') {
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

<div
style="
width:100%;
height:100px;
overflow:hidden;
margin-bottom:8px;
">

<img
src="${personImg}"
alt="${church.gender}"
style="
width:100%;
height:100%;
object-fit:cover;
display:block;
"/>

</div>

<div
style="
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

${church.language &&
        church.language.toString().trim() !== '' &&
        church.language.toString().toLowerCase() !== 'null'

        ? `
<span style="font-weight:600;">
Language:
</span>

<span style="font-weight:700;">
${church.language}
</span>
`

        : ''}

<span style="font-weight:600;">
Activity:
</span>

<span
style="
font-weight:700;
word-break:break-word;
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

  buildPopupCardGrouped(
    church: ChurchData,
    count: number
  ): string {

    const personImg =
      this.imageService.getImageForChurch(church);

    let displayActivity =
      church.activity;

    if (church.activity === 'Youversion') {

      displayActivity =
        'Bible Reading Plan';

    }
    else if (church.activity === 'Bible Word') {

      displayActivity =
        'Website Visitor';

    }

    let bgStyle = 'background:#fff;';
    let borderStyle = '';
    if (church.activity === 'Chat') {
      bgStyle = 'background:#f5f3ff;';
      borderStyle = 'border: 2px solid #4f46e5;';
    } else if (church.activity === 'Bible Learn' || church.activity === 'Bible Study') {
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

<div
style="
width:100%;
height:100px;
overflow:hidden;
margin-bottom:8px;
">

<img
src="${personImg}"
alt="${church.gender}"
style="
width:100%;
height:100%;
object-fit:cover;
display:block;
"/>

</div>

${count >= 1

        ? `
<span
style="
margin-top:6px;
font-weight:600;
">

and ${count}
${count === 1 ? 'other' : 'others'}

</span>
`

        : ''}

<div
style="
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

${church.language &&
        church.language.toString().trim() !== '' &&
        church.language.toString().toLowerCase() !== 'null'

        ? `
<span style="font-weight:600;">
Language:
</span>

<span style="font-weight:700;">
${church.language}
</span>
`

        : ''}

<span style="font-weight:600;">
Activity:
</span>

<span
style="
font-weight:700;
word-break:break-word;
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

  buildSmallPopup(
    church: ChurchData
  ): string {

    const personImg =
      this.imageService.getImageForChurch(church);

    console.log("SMALL POPUP");
    console.log("imageKey:", church.imageKey);
    console.log("imageIndex:", church.imageIndex);
    console.log("image:", personImg);

    let displayActivity =
      church.activity;

    if (church.activity === 'Bible Study') {

      displayActivity =
        'Bible Study Lesson Finished';

    }
    else if (church.activity === 'Youversion') {

      displayActivity =
        'Bible Reading Plan';

    }
    else if (church.activity === 'Bible Word') {

      displayActivity =
        'Website Visitor';

    }

    let bgStyle = 'background:#fff;';
    let borderStyle = '';
    if (church.activity === 'Chat') {
      bgStyle = 'background:#f5f3ff;';
      borderStyle = 'border: 2px solid #4f46e5;';
    } else if (church.activity === 'Bible Learn' || church.activity === 'Bible Study') {
      bgStyle = 'background:#ecfdf5;';
      borderStyle = 'border: 2px solid #10b981;';
    }

    return `
<div
style="
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
alt="${church.gender}"
style="
width:100%;
height:38px;
object-fit:cover;
border-radius:6px;
margin-bottom:3px;
"/>

<div
style="
font-size:6px;
font-weight:600;
text-align:center;
line-height:1.1;
">

<div>
${church.country}
</div>

<div>
${displayActivity}
</div>

</div>

</div>
`;

  }

  // =====================================================
  // REMOVE OLD POPUPS
  // =====================================================

  enforcePopupLimit(
    maxPopups: number
  ): void {

    while (

      this.previousCountryPopups.length >

      maxPopups

    ) {

      const oldest =

        this.previousCountryPopups.shift();

      if (!oldest) {

        continue;

      }

      const element =

        oldest.getElement();

      if (element) {

        element.classList.add(
          'small-popup-exit'
        );

        setTimeout(() => {

          try {

            oldest.remove();

          }
          catch { }

        }, 300);

      }
      else {

        try {

          oldest.remove();

        }
        catch { }

      }

    }

  }

  // =====================================================
  // REMOVE ONE POPUP
  // =====================================================

  removePopup(
    popup: mapboxgl.Popup
  ): void {

    try {

      popup.remove();

    }
    catch { }

    const index =

      this.previousCountryPopups.indexOf(
        popup
      );

    if (index >= 0) {

      this.previousCountryPopups.splice(
        index,
        1
      );

    }

  }

  // =====================================================
  // REMOVE ALL POPUPS
  // =====================================================

  clearAll(): void {

    this.previousCountryPopups.forEach(

      popup => {

        try {

          popup.remove();

        }
        catch { }

      }

    );

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