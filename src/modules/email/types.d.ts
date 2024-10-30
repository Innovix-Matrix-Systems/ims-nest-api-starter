interface EmailPayload {
  key: string;
  from?: string;
  to: string;
  subject: string;
  options?: Record<string, any>;
}

interface EmailTransportPacket {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Record<string, any>[];
}
