declare module 'opencc-js' {
  type Locale = 'cn' | 'tw' | 'twp' | 'hk' | 't' | 'jp' | 'stw' | 'stwp';
  interface ConverterOptions {
    from: Locale;
    to: Locale;
  }
  function Converter(options: ConverterOptions): (text: string) => string;
}
