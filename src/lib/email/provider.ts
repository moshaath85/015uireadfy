export interface EmailMessage {
  readonly to: string;
  readonly from: string;
  readonly subject: string;
  readonly text: string;
}

export interface EmailSendResult {
  readonly success: boolean;
  readonly error?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

let cachedProvider: EmailProvider | null | undefined;

export function getEmailProvider(): EmailProvider | null {
  if (cachedProvider !== undefined) return cachedProvider;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    cachedProvider = null;
    return null;
  }

  cachedProvider = createSmtpProvider({ host, port: parseInt(port, 10), user, password });
  return cachedProvider;
}

function createSmtpProvider(config: {
  host: string;
  port: number;
  user: string;
  password: string;
}): EmailProvider {
  let transport: import("nodemailer").Transporter | null = null;

  async function getTransport(): Promise<import("nodemailer").Transporter> {
    if (!transport) {
      const nodemailer = await import("nodemailer");
      transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user: config.user, pass: config.password },
      });
    }
    return transport;
  }

  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      try {
        const t = await getTransport();
        await t.sendMail({
          from: message.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
        });
        return { success: true };
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown email error";
        return { success: false, error: msg };
      }
    },
  };
}
