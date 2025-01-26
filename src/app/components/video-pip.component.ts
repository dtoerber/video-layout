// video-pip.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-pip',
  template: `
    <div class="video-container">
      <div class="video-wrapper">
        <video #mainVideo
          src="assets/video.mov"
          class="primary-video"
          [autoplay]="true"
          controls
          (enterpictureinpicture)="onEnterPiP($event, 'main')"
          (leavepictureinpicture)="onLeavePiP($event, 'main')">
        </video>
        <video #secondaryVideo
          src="assets/video.mov"
          class="secondary-video"
          [autoplay]="false"
          controls
          (enterpictureinpicture)="onEnterPiP($event, 'secondary')"
          (leavepictureinpicture)="onLeavePiP($event, 'secondary')">
        </video>
        <video #tertiaryVideo
          src="assets/video.mov"
          class="tertiary-video"
          [autoplay]="false"
          controls
          (enterpictureinpicture)="onEnterPiP($event, 'secondary')"
          (leavepictureinpicture)="onLeavePiP($event, 'secondary')">
        </video>
      </div>
    </div>
  `,
  styles: [`
    .video-container {
      max-width: 1280px;
      margin: 20px auto;
      // border: 1px solid red;
    }
    .video-wrapper {
      position: relative;
      width: 100%;
    }
    video {
      width: 100%;
    }
    .primary-video {
      border: 1px solid red;
    }
    .secondary-video {
      position: absolute;
      bottom: 15px;
      right: 15px;
      width: 30%;
      z-index: 1;
      margin: 0;
      border: 1px solid green;
    }
    .tertiary-video {
      position: absolute;
      bottom: 15px;
      left: 15px;
      width: 30%;
      z-index: 1;
      margin: 0;
      border: 1px solid purple;
    }
    .controls {
      text-align: center;
    }
    // button {
    //   padding: 8px 16px;
    //   background: #007bff;
    //   color: white;
    //   border: none;
    //   border-radius: 4px;
    //   cursor: pointer;
    //   margin: 0 5px;
    // }
    // button:disabled {
    //   background: #ccc;
    //   cursor: not-allowed;
    // }
  `]
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
      console.error(`Failed to toggle ${type} PiP:`, error);
    }
  }

  onEnterPiP(event: Event, type: 'main' | 'secondary') {
    this.isInPiP[type] = true;
  }

  onLeavePiP(event: Event, type: 'main' | 'secondary') {
    this.isInPiP[type] = false;
  }
}
