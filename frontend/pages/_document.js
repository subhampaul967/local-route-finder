import Document, { Html, Head, Main, NextScript } from 'next/document';

// Minimal custom Document to satisfy Next during production builds when
// the runtime expects a document entry point. This does not interfere with
// the App Router (`app/`) but ensures the builder can locate `/_document`.
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
