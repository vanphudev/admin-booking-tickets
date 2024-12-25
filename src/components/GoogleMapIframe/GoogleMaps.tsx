import { useState } from 'react';
import { Modal, Input, Button } from 'antd';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';

type LatLng = {
   lat: number;
   lng: number;
};

interface MapModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSaveLocation: (location: { lat: number; lng: number; link: string }) => void;
}

function MapModal({ isOpen, onClose, onSaveLocation }: MapModalProps) {
   const [center, setCenter] = useState<LatLng>({ lat: 10.8065284, lng: 106.626375 });
   const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
   const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

   const handlePlaceChanged = () => {
      if (autocomplete) {
         const place = autocomplete.getPlace();
         const location = place.geometry?.location;
         if (location) {
            const lat = location.lat();
            const lng = location.lng();
            setCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
         }
      }
   };

   const handleMapClick = (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
         const lat = event.latLng.lat();
         const lng = event.latLng.lng();
         setMarkerPosition({ lat, lng });
      }
   };

   const handleSave = () => {
      if (markerPosition) {
         const googleMapsLink = `https://maps.google.com/?q=${markerPosition.lat},${markerPosition.lng}`;
         onSaveLocation({ ...markerPosition, link: googleMapsLink });
      }
      onClose();
   };

   return (
      <Modal
         title="Select Location on Map"
         visible={isOpen}
         onCancel={onClose}
         onOk={handleSave}
         destroyOnClose
         zIndex={6000}
         footer={[
            <Button key="back" onClick={onClose}>
               Close
            </Button>,
            <Button key="submit" type="primary" onClick={handleSave}>
               Save Location
            </Button>,
         ]}
      >
         <LoadScript
            googleMapsApiKey="AIzaSyDTLewClJ0NQpHl6-8w4OQNaNoFyIqymoU"
            libraries={['places', 'geometry', 'drawing', 'visualization']}
            language="vi"
            region="VN"
            version="weekly"
         >
            <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
               <Input placeholder="Search location" style={{ marginBottom: '10px' }} />
            </Autocomplete>
            <GoogleMap
               mapContainerStyle={{ height: '400px', width: '100%' }}
               center={center}
               zoom={15}
               onClick={handleMapClick}
            >
               {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
         </LoadScript>
      </Modal>
   );
}

export default MapModal;

/* AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg */

/* AIzaSyDTLewClJ0NQpHl6-8w4OQNaNoFyIqymoU */
