class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async getOffer(){
    if(this.peer){
        const offer = this.peer.createOffer()
        await this.peer.setLocalDescription(new RTCSessionDescription(offer))
        return offer
    }
  }
}

export default new PeerService();