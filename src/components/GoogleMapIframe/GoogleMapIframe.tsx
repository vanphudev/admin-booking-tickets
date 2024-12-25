interface GoogleMapIframeProps {
   latitude: number;
   longitude: number;
}

export default function GoogleMapIframe({ latitude, longitude }: GoogleMapIframeProps) {
   const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed`;
   const linkUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14`;
   return (
      <div
         style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: 10,
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
         }}
      >
         <iframe
            src={mapUrl as string}
            title={`Google Map at ${latitude}, ${longitude}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allowFullScreen
            loading="lazy"
         />
         <a
            href={linkUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            style={{
               position: 'absolute',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
               zIndex: 1,
               backgroundColor: 'transparent',
            }}
            aria-label={`Open Google Map at ${latitude}, ${longitude}`}
         />
      </div>
   );
}
