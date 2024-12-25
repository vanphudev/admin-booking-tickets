import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { App, Form, Modal, Input, Radio, Space, Select, Flex, Typography, Upload, Spin, Tooltip } from 'antd';
import UploadIllustration from '@/components/upload/upload-illustration';
import officeAPI from '@/redux/api/services/officeAPI';
import { RootState } from '@/redux/stores/store';
import MapModal from '@/components/GoogleMapIframe/GoogleMaps';

import { Office } from './entity';

const { Search } = Input;

export type OfficeModalProps = {
   formValue: Office;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

const getBase64 = (file: RcFile): Promise<string> =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
   });

export function OfficeModal({ formValue, title, show, onOk, onCancel, isCreate }: OfficeModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');
   const [loading, setLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [locationData, setLocationData] = useState<{ lat: number; lng: number; link: string } | null>(null);

   const handleOpenModal = () => setIsModalOpen(true);
   const handleCloseModal = () => setIsModalOpen(false);

   const getAddressFromLatLng = async (lat: number, lng: number) => {
      try {
         const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
         const data = await response.json();
         return data.display_name;
      } catch (error) {
         console.error('Error fetching address:', error);
         return null;
      }
   };

   const handleSaveLocation = async (location: { lat: number; lng: number; link: string }) => {
      const address = await getAddressFromLatLng(location.lat, location.lng);
      form.setFieldsValue({
         mapUrl: location.link,
         latitude: location.lat,
         longitude: location.lng,
         description: address,
         Address: {
            street: address,
         },
      });
      setLocationData(location);
   };

   const { provinces, districts, wards } = useSelector((state: RootState) => state.address);
   const [selectedProvince, setSelectedProvince] = useState(null);
   const [selectedDistrict, setSelectedDistrict] = useState(null);
   const [selectedWard, setSelectedWard] = useState(null);
   const handleCancelUpload = () => setPreviewOpen(false);
   const handlePreviewUpload = async (file: UploadFile) => {
      if (!file.url && !file.preview) {
         file.preview = await getBase64(file.originFileObj as RcFile);
      }
      setPreviewImage(file.url || (file.preview as string));
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
   };

   const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

   const uploadButton = (
      <Tooltip placement="top" title="Drop or Select file">
         <div className="flex flex-col items-center justify-center p-0 opacity-100 hover:opacity-80">
            <UploadIllustration />
         </div>
      </Tooltip>
   );

   useEffect(() => {
      const loadImages = async () => {
         if (show) {
            form.setFieldsValue(formValue);
            if (formValue.images && formValue.images.length > 0) {
               const newFileList = await Promise.all(
                  formValue.images?.map(async (image, index) => {
                     const isString = typeof image === 'string';
                     if (isString) {
                        try {
                           const response = await fetch(image);
                           const blob = await response.blob();
                           const fileType = blob.type;
                           const fileExtension =
                              fileType === 'image/svg+xml' ? 'svg' : fileType.split('/')[1] || 'unknown';
                           const fileName = `image_upload_${index}.${fileExtension}`;
                           let file;
                           if (fileType === 'image/svg+xml') {
                              file = new File([blob], fileName, { type: fileType });
                           } else {
                              file = new File([blob], fileName, { type: fileType });
                           }
                           return {
                              uid: `${index}`,
                              name: fileName,
                              status: 'done',
                              originFileObj: file,
                           };
                        } catch (error) {
                           console.error(`Lỗi khi tải file: ${error}`);
                           return null;
                        }
                     }
                     return {
                        uid: `${index}`,
                        name: image.name,
                        status: 'done',
                        originFileObj: image,
                     };
                  }),
               );
               setFileList(newFileList as UploadFile[]);
            } else {
               setFileList([]);
            }
            if (!isCreate) {
               setSelectedProvince(formValue.Address?.province as any);
               setSelectedDistrict(formValue.Address?.district as any);
               setSelectedWard(formValue.Address?.ward as any);
            }
         }
      };
      loadImages();
   }, [show, formValue, form, isCreate]);

   const handleProvinceChange = (value: any) => {
      setSelectedProvince(value);
      setSelectedDistrict(null);
      setSelectedWard(null);
      form.setFieldsValue({
         Address: {
            district: null,
            ward: null,
         },
      });
   };

   const handleDistrictChange = (value: any) => {
      setSelectedDistrict(value);
      setSelectedWard(null);
      form.setFieldsValue({
         Address: {
            ward: null,
         },
      });
   };

   const handleWardChange = (value: any) => {
      setSelectedWard(value);
   };

   const handleOk = () => {
      form
         .validateFields()
         .then((formData) => {
            const additionalData = {
               officeId: formValue.id,
               images: fileList.map((file) => file.originFileObj),
               wardId: selectedWard,
               map_url: formData.mapUrl,
               address: formData.Address.street,
            };
            const combinedData = { ...formData, ...additionalData };
            if (isCreate) {
               setLoading(true);
               officeAPI
                  .createOffice(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Create Office Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Create Office Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Create Office Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            } else {
               // Trạng thái cập nhật. isCreate = false
               setLoading(true);
               officeAPI
                  .updateOffice(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Update Office Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Update Office Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Update Office Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            }
         })
         .catch((errorInfo) => {
            const errorFields = errorInfo.errorFields.map((field: any) => field.name.join(' '));
            notification.warning({
               message: `Validation Data: \n${errorFields}`,
               duration: 3,
            });
         });
   };

   const content = (
      <Form<Office>
         initialValues={formValue}
         form={form}
         labelCol={{ span: 4 }}
         wrapperCol={{ span: 18 }}
         layout="horizontal"
         style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
         <Form.Item<Office> label="Name" name="name" rules={[{ required: true, message: 'Please enter the name' }]}>
            <Input size="large" />
         </Form.Item>
         <Form.Item label="Contact Information">
            <Space.Compact style={{ display: 'flex', gap: '10px' }}>
               <Form.Item<Office>
                  name="phone"
                  style={{ flex: 1 }}
                  rules={[
                     { required: true, message: 'Please enter the phone number' },
                     { pattern: /^[0-9]+$/, message: 'Please enter a valid phone number' },
                  ]}
               >
                  <Input size="large" placeholder="Phone" />
               </Form.Item>
               <Form.Item<Office>
                  name="fax"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Please enter the fax number' }]}
               >
                  <Input size="large" placeholder="Fax" />
               </Form.Item>
            </Space.Compact>
         </Form.Item>
         <Form.Item<Office>
            label="Google Maps URL"
            name="mapUrl"
            rules={[{ required: true, message: 'Please enter the Google Maps URL' }]}
         >
            <Search size="large" addonBefore="https://" onSearch={handleOpenModal} enterButton="Search Map" readOnly />
         </Form.Item>
         <Form.Item<Office> label="Location Information">
            <Space.Compact style={{ display: 'flex', gap: '10px' }}>
               <Form.Item<Office>
                  name="latitude"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Please enter the latitude' }]}
               >
                  <Input size="large" placeholder="Latitude" readOnly />
               </Form.Item>
               <Form.Item<Office>
                  name="longitude"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Please enter the longitude' }]}
               >
                  <Input size="large" placeholder="Longitude" readOnly />
               </Form.Item>
            </Space.Compact>
         </Form.Item>
         <Form.Item<Office>
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter the description' }]}
         >
            <Input.TextArea size="large" />
         </Form.Item>
         <Form.Item<Office>
            label="Locked"
            name="isLocked"
            rules={[{ required: true, message: 'Please select a status' }]}
         >
            <Radio.Group size="large" optionType="button" buttonStyle="solid">
               <Radio value={1}>Enable</Radio>
               <Radio value={0}>Disable</Radio>
            </Radio.Group>
         </Form.Item>
         <Form.Item<Office> label="Address" rules={[{ required: true, message: 'Please enter the address' }]}>
            <Space direction="vertical" style={{ width: '100%' }}>
               <Form.Item<Office>
                  name={['Address', 'street']}
                  rules={[{ required: true, message: 'Please enter the street address' }]}
               >
                  <Input size="large" placeholder="Enter Address" readOnly />
               </Form.Item>
               <Flex align="center" gap={16} style={{ width: '100%' }}>
                  <div style={{ flex: 1 }}>
                     <Typography.Text>Tỉnh/Thành phố:</Typography.Text>
                     <Form.Item<Office>
                        name={['Address', 'province']}
                        rules={[{ required: true, message: 'Please select a province' }]}
                     >
                        <Select
                           size="large"
                           showSearch
                           optionFilterProp="label"
                           style={{ width: '100%', cursor: 'pointer' }}
                           placeholder="Select Province"
                           value={selectedProvince}
                           onChange={handleProvinceChange}
                           options={
                              provinces && provinces.length > 0
                                 ? provinces?.map((province: any) => ({
                                      label: province.province_name,
                                      value: province.province_id,
                                   }))
                                 : []
                           }
                           {...(provinces?.length === 0 && { loading: true })}
                        />
                     </Form.Item>
                  </div>
                  <div style={{ flex: 1, marginBottom: 0 }}>
                     <Typography.Text>Quận/huyện:</Typography.Text>
                     <Form.Item<Office>
                        name={['Address', 'district']}
                        rules={[{ required: true, message: 'Please select a district' }]}
                     >
                        <Select
                           size="large"
                           showSearch
                           optionFilterProp="label"
                           style={{ width: '100%', cursor: 'pointer' }}
                           placeholder="Select District"
                           onChange={handleDistrictChange}
                           options={
                              districts && districts.length > 0
                                 ? districts
                                      .filter((district: any) => district.province_id === selectedProvince)
                                      .map((district: any) => ({
                                         label: district.district_name,
                                         value: district.district_id,
                                         selected: !isCreate && district.district_id === formValue.Address?.district,
                                      }))
                                 : []
                           }
                           disabled={!selectedProvince}
                           {...((districts?.length === 0 || !selectedProvince) && { loading: true })}
                           value={selectedDistrict}
                        />
                     </Form.Item>
                  </div>
                  <div style={{ flex: 1, marginBottom: 0 }}>
                     <Typography.Text>Xã/phường:</Typography.Text>
                     <Form.Item<Office>
                        name={['Address', 'ward']}
                        rules={[{ required: true, message: 'Please select a valid ward' }]}
                     >
                        <Select
                           size="large"
                           showSearch
                           optionFilterProp="label"
                           style={{ width: '100%', cursor: 'pointer' }}
                           placeholder="Select Ward"
                           value={selectedWard}
                           onChange={handleWardChange}
                           options={
                              wards && wards.length > 0
                                 ? wards
                                      .filter((ward: any) => ward.district_id === selectedDistrict)
                                      .map((ward: any) => ({
                                         label: ward.ward_name,
                                         value: ward.ward_id,
                                      }))
                                 : []
                           }
                           disabled={!selectedDistrict}
                           {...((wards?.length === 0 || !selectedDistrict) && { loading: true })}
                        />
                     </Form.Item>
                  </div>
               </Flex>
            </Space>
         </Form.Item>
         <Form.Item<Office> label="Image">
            <Upload
               style={{ flex: 1 }}
               listType="picture-card"
               fileList={fileList}
               multiple
               beforeUpload={() => false}
               onPreview={handlePreviewUpload}
               onChange={handleChange}
               maxCount={8}
               progress={{
                  strokeColor: {
                     '0%': '#108ee9',
                     '100%': '#87d068',
                  },
               }}
            >
               {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelUpload}>
               <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
         </Form.Item>
      </Form>
   );

   return (
      <>
         <MapModal isOpen={isModalOpen} onClose={handleCloseModal} onSaveLocation={handleSaveLocation} />
         <Modal
            title={title}
            open={show}
            onOk={handleOk}
            onCancel={() => {
               onCancel();
            }}
            destroyOnClose
            width="60%"
            centered
         >
            {loading && (
               <Spin size="large" fullscreen tip={isCreate ? 'Creating...' : 'Updating...'}>
                  {content}
               </Spin>
            )}
            {content}
         </Modal>
      </>
   );
}
