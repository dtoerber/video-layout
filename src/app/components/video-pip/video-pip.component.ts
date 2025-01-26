// video-pip.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-pip',
  templateUrl: `./video-pip.component.html`,
  styleUrls: ['./video-pip.component.scss']
})
export class VideoPiPComponent {
  @ViewChild('mainVideo') mainVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('secondaryVideo') secondaryVideo!: ElementRef<HTMLVideoElement>;

  isPiPSupported = 'pictureInPictureEnabled' in document;
  isInPiP = {
    main: false,
    secondary: false
  };

  getVideoElement(type: 'main' | 'secondary'): HTMLVideoElement {
    return type === 'main' ?
      this.mainVideo.nativeElement :
      this.secondaryVideo.nativeElement;
  }

  async togglePiP(type: 'main' | 'secondary') {
    try {
      if (!this.isInPiP[type]) {
        await this.getVideoElement(type).requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error(`Failed to toggle ${type} PiP: `, error);
    }
  }

  onEnterPiP(event: Event, type: 'main' | 'secondary') {
    this.isInPiP[type] = true;
  }

  onLeavePiP(event: Event, type: 'main' | 'secondary') {
    this.isInPiP[type] = false;
  }
}
