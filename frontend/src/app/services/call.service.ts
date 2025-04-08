import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreamsSubject = new BehaviorSubject<Map<string, MediaStream>>(new Map());
  
  public remoteStreams$ = this.remoteStreamsSubject.asObservable();

  constructor() {}

  async initLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // This is a simplified implementation - in a real app, you would need to implement
  // the WebRTC signaling through your socket service
  async createPeerConnection(userId: string, initiator: boolean): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the other peer through signaling server
        // This would be implemented with your socket service
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStreams = new Map(this.remoteStreamsSubject.value);
      remoteStreams.set(userId, event.streams[0]);
      this.remoteStreamsSubject.next(remoteStreams);
    };

    this.peerConnections.set(userId, peerConnection);

    // If initiator, create and send offer
    if (initiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      // Send offer to remote peer through signaling server
      // This would be implemented with your socket service
    }
  }

  async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnections.has(userId)) {
      await this.createPeerConnection(userId, false);
    }
    
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      // Send answer to remote peer through signaling server
      // This would be implemented with your socket service
    }
  }

  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  closePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
      
      const remoteStreams = new Map(this.remoteStreamsSubject.value);
      remoteStreams.delete(userId);
      this.remoteStreamsSubject.next(remoteStreams);
    }
  }

  closeAllPeerConnections(): void {
    this.peerConnections.forEach((connection, userId) => {
      connection.close();
    });
    this.peerConnections.clear();
    this.remoteStreamsSubject.next(new Map());
  }
}
