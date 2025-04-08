import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CallService } from '../../services/call.service';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-call-container">
      <div class="videos-grid">
        <div class="video-wrapper local-video">
          <video #localVideo autoplay muted playsinline></video>
          <div class="video-label">You</div>
        </div>
        
        <div *ngFor="let stream of remoteStreams | keyvalue" class="video-wrapper">
          <video [srcObject]="stream.value" autoplay playsinline></video>
          <div class="video-label">{{ stream.key }}</div>
        </div>
      </div>
      
      <div class="call-controls">
        <button class="control-btn mute-btn" [class.active]="isMuted" (click)="toggleMute()">
          {{ isMuted ? 'Unmute' : 'Mute' }}
        </button>
        <button class="control-btn video-btn" [class.active]="isVideoOff" (click)="toggleVideo()">
          {{ isVideoOff ? 'Start Video' : 'Stop Video' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .video-call-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #1a1a1a;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      padding: 10px;
      flex: 1;
      overflow: auto;
    }
    
    .video-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 75%; /* 4:3 aspect ratio */
      background-color: #2a2a2a;
      border-radius: 4px;
      overflow: hidden;
    }
    
    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-label {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .local-video {
      border: 2px solid #4285f4;
    }
    
    .call-controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 10px;
      background-color: #2a2a2a;
    }
    
    .control-btn {
      padding: 8px 16px;
      border-radius: 20px;
      background-color: #4285f4;
      color: white;
      border: none;
      cursor: pointer;
    }
    
    .control-btn:hover {
      background-color: #3367d6;
    }
    
    .control-btn.active {
      background-color: #ea4335;
    }
    
    .control-btn.active:hover {
      background-color: #d32f2f;
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo') localVideoElement!: ElementRef<HTMLVideoElement>;
  
  remoteStreams: Map<string, MediaStream> = new Map();
  isMuted: boolean = false;
  isVideoOff: boolean = false;
  
  private subscriptions: Subscription[] = [];
  
  constructor(private callService: CallService) {}
  
  ngOnInit(): void {
    const streamsSub = this.callService.remoteStreams$.subscribe(streams => {
      this.remoteStreams = streams;
    });
    
    this.subscriptions.push(streamsSub);
  }
  
  ngAfterViewInit(): void {
    // Set local video stream
    const localStream = this.callService.getLocalStream();
    if (localStream && this.localVideoElement) {
      this.localVideoElement.nativeElement.srcObject = localStream;
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  toggleMute(): void {
    const localStream = this.callService.getLocalStream();
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = this.isMuted;
      });
      this.isMuted = !this.isMuted;
    }
  }
  
  toggleVideo(): void {
    const localStream = this.callService.getLocalStream();
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = this.isVideoOff;
      });
      this.isVideoOff = !this.isVideoOff;
    }
  }
}
