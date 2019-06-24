import { Base64 } from 'js-base64';

interface Param {
  title: string;
  body?: string;
}

const buildMailBody = ({ title, body = '' }: Param) => {
  /**
   * Gmail resource.raw shuld follow [RFC 2822](https://tools.ietf.org/html/rfc2822) which is
   * 1. It should include From, To, Subject, Date, Message-ID field.
   * 2. Meta fields and message body should be divided by two line breaks(\n\n).
   * 3. It should be base64-url encoded.
   * Reference: https://ncona.com/2011/06/using-utf-8-characters-on-an-e-mail-subject/
   * 4. If Subject field contains non ascii characters, then you should follow
   * [RFC 1342](https://tools.ietf.org/html/rfc1342) format, ie. =?utf-8?B?base64EncodedBody?=
   * 5. You can specify charset or content-type by meta fields.
   */
  return Base64.encodeURI(
    `From: <${process.env.email}>\n` +
      `To: <${process.env.email}>\n` +
      `Subject: =?utf-8?B?${Base64.encode(title)}?=\n` +
      'Date:\n' +
      'Message-ID:\n' +
      'Content-Type: text/html\n' +
      'Charset: UTF-8\n\n' +
      body,
  );
};

export default buildMailBody;
