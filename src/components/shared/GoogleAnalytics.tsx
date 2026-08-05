import Script from 'next/script'

const MEASUREMENT_ID = 'G-B7G9P30Z6X'

export default function GoogleAnalytics() {
  // Ne charger l'analytics qu'en production (évite les erreurs réseau en dev)
  if (process.env.NODE_ENV !== 'production') {
    return null
  }
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  )
}
