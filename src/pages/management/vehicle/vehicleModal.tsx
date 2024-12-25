import { MapVehicleLayout, Vehicle, VehicleType } from './entity';
import type { RcFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Radio, Upload, Spin, Row, Col, Select, ColorPicker } from 'antd';
import { Iconify } from '@/components/icon';
import vehicleAPI from '@/redux/api/services/vehicleAPI';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Office } from '../office/entity';
import officeAPI from '@/redux/api/services/officeAPI';

const styles = `
   .bus-modal-avatar-uploader .ant-upload {
      width: 300px !important;
      height: 300px !important;
      background-color: #fafafa;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s;
   }

   .bus-modal-avatar-uploader .ant-upload:hover {
      border-color: #FF3030;
   }

   .ql-container {
      min-height: 200px;
   }

   .ql-editor {
      min-height: 200px;
   }
`;

if (typeof document !== 'undefined') {
   const styleSheet = document.createElement('style');
   styleSheet.innerText = styles;
   document.head.appendChild(styleSheet);
}

export type VehicleModalProps = {
   formValue: Vehicle;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

function transformApiResponseToOffice(apiResponse: any): Office {
   return {
      id: apiResponse.office_id,
      name: apiResponse.office_name,
      phone: apiResponse.office_phone,
      fax: apiResponse.office_fax,
      description: apiResponse.office_description,
      latitude: apiResponse.office_latitude,
      longitude: apiResponse.office_longitude,
      mapUrl: apiResponse.office_map_url,
      isLocked: apiResponse.is_locked === 1 ? 1 : 0,
      lastLockAt: apiResponse.last_lock_at || '',
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      Address: {
         province: apiResponse?.office_belongto_ward?.ward_belongto_district?.district_belongto_province?.province_id,
         district: apiResponse?.office_belongto_ward?.ward_belongto_district?.district_id,
         ward: apiResponse?.office_belongto_ward?.ward_id,
         street: apiResponse?.office_address,
      },
      images: apiResponse?.office_to_officeImage.map((image: any) => image.office_image_url),
   };
}

function transformApiResponseToVehicleType(apiResponse: any): VehicleType {
   return {
      id: apiResponse.vehicle_type_id,
      name: apiResponse.vehicle_type_name,
      description: apiResponse.vehicle_type_description,
   };
}

function transformApiResponseToMapVehicleLayout(apiResponse: any): MapVehicleLayout {
   return {
      id: apiResponse.map_vehicle_layout_id,
      name: apiResponse.layout_name,
      vehicle_type: transformApiResponseToVehicleType(apiResponse.mapVehicleLayout_belongto_vehicleType),
   };
}

export function VehicleModal({ formValue, title, show, onOk, onCancel, isCreate }: VehicleModalProps) {
   console.log(formValue);
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [imageBase64, setImageBase64] = useState<string>('');
   const [loading, setLoading] = useState(false);

   const convertToBase64 = (file: RcFile): Promise<string> => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = (error) => reject(error);
      });
   };

   const handleUpload = async (info: any) => {
      try {
         const { file } = info;
         if (!file) return;
         const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
         if (!isJpgOrPng) {
            notification.error({ message: 'Chỉ chấp nhận file JPG/PNG!' });
            return;
         }
         const isLt2M = file.size / 1024 / 1024 < 2;
         if (!isLt2M) {
            notification.error({ message: 'Kích thước ảnh phải nhỏ hơn 2MB!' });
            return;
         }
         const base64 = await convertToBase64(file);
         setImageBase64(base64);
         form.setFieldValue('layout', formValue?.mapVehicleLayout?.id || undefined);
         form.setFieldValue('vehicle_type', formValue?.mapVehicleLayout?.vehicle_type?.id || undefined);
         form.setFieldValue('office_id', formValue?.office_id || undefined);
      } catch (error) {
         notification.error({ message: 'Lỗi khi tải ảnh!' });
      }
   };

   useEffect(() => {
      form.setFieldsValue(formValue);
      console.log(formValue);
      if (show && !isCreate) {
         // Set image
         if (formValue.images) {
            setImageBase64(formValue.images);
         } else {
            setImageBase64('');
         }

         // Set color
         if (formValue.color) {
            form.setFieldValue('color', formValue.color);
         } else {
            form.setFieldValue('color', undefined);
         }

         // Set layout và vehicle type
         form.setFieldValue('layout', formValue?.mapVehicleLayout?.id || undefined);
         form.setFieldValue('vehicle_type', formValue?.mapVehicleLayout?.vehicle_type?.id || undefined);

         // Set office
         form.setFieldValue('office_id', formValue?.office_id || undefined);
      }
      if (!show) {
         form.resetFields();
      }
   }, [show, formValue, isCreate]);

   const handleOk = () => {
      form.validateFields().then((formData) => {
         const submitData = {
            ...formData,
            vehicle_code: formData.code,
            vehicle_license_plate: formData.license_plate,
            vehicle_model: formData.model,
            vehicle_brand: formData.brand,
            vehicle_capacity: formData.capacity,
            vehicle_manufacture_year: formData.manufacture_year,
            vehicle_color: typeof formData.color === 'string' ? formData.color : formData.color?.toHexString() || '',
            vehicle_description: formData.description,
            is_locked: formData.isLocked,
            last_lock_at: formData.lastLockAt,
            map_vehicle_layout_id: formData.layout,
            office_id: formData.office_id,
            vehicle_id: formValue.id || undefined,
            vehicle_image: imageBase64,
         };
         console.log(submitData);
         console.log(isCreate);
         setLoading(true);
         const apiCall = isCreate ? vehicleAPI.createVehicle(submitData) : vehicleAPI.updateVehicle(submitData);
         apiCall
            .then((res) => {
               if (res && (res.status === 201 || res.status === 200)) {
                  notification.success({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} xe thành công!`,
                     duration: 3,
                  });
                  onOk();
               } else {
                  notification.warning({
                     message: `${isCreate ? 'Tạo' : 'Cập nhật'} xe thất bại!`,
                     duration: 3,
                  });
               }
               if (res?.status !== 200 && res?.status !== 201) {
                  notification.error({
                     message: `Đã xảy ra lỗi: ${res?.message}`,
                     duration: 3,
                  });
               }
            })
            .catch((error) => {
               notification.error({
                  message: `Lỗi: ${error.message}`,
                  duration: 3,
               });
            })
            .finally(() => setLoading(false));
      });
   };

   const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
   const getVehicleType = async () => {
      const res = await vehicleAPI.getVehicleType();
      if (res) {
         setVehicleTypes(res?.map(transformApiResponseToVehicleType));
      }
   };

   const [layouts, setLayouts] = useState<MapVehicleLayout[]>([]);
   const getLayoutVehicle = async () => {
      const res = await vehicleAPI.getLayoutVehicle();
      if (res) {
         setLayouts(res?.map(transformApiResponseToMapVehicleLayout));
      }
   };

   const [offices, setOffices] = useState<Office[]>([]);
   const getOffices = async () => {
      const res = await officeAPI.getOffices();
      if (res) {
         setOffices(res.map(transformApiResponseToOffice));
      }
   };

   useEffect(() => {
      getVehicleType();
      getLayoutVehicle();
      getOffices();
   }, []);

   const content = (
      <Form
         form={form}
         layout="vertical"
         initialValues={formValue}
         style={{
            maxHeight: '70vh',
            overflowY: 'auto',
            display: 'flex',
         }}
      >
         <Row gutter={16} style={{ margin: 0, flex: 1 }}>
            <Col span={8} style={{ margin: 0, paddingRight: 8 }}>
               <Form.Item
                  label="Ảnh đại diện"
                  name="images"
                  rules={[{ required: true, message: 'Vui lòng tải lên ảnh đại diện!' }]}
               >
                  <Upload
                     listType="picture-card"
                     maxCount={1}
                     showUploadList={false}
                     beforeUpload={() => false}
                     onChange={handleUpload}
                     className="bus-modal-avatar-uploader"
                     style={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                     }}
                  >
                     {imageBase64 ? (
                        <img
                           src={imageBase64}
                           alt="avatar"
                           style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                           }}
                        />
                     ) : (
                        <div className="flex flex-col items-center justify-center">
                           <Iconify icon="solar:upload-minimalistic-bold" size={24} />
                           <div className="mt-2">Tải ảnh lên</div>
                        </div>
                     )}
                  </Upload>
               </Form.Item>
            </Col>
            <Col span={16} style={{ margin: 0 }}>
               <Row gutter={16} style={{ margin: 0 }}>
                  <Col span={12} style={{ paddingRight: 4, paddingLeft: 0 }}>
                     <Form.Item
                        name="license_plate"
                        label="License Plate"
                        rules={[{ required: true, message: 'Please input license plate!' }]}
                     >
                        <Input size="large" placeholder="Enter license plate" />
                     </Form.Item>
                  </Col>
                  <Col span={12} style={{ paddingRight: 0, paddingLeft: 4 }}>
                     <Form.Item name="color" label="Color" rules={[{ required: true, message: 'Vui lòng chọn màu!' }]}>
                        <ColorPicker
                           size="large"
                           showText
                           format="hex"
                           value={form.getFieldValue('color')}
                           presets={[
                              {
                                 label: 'Recommended',
                                 colors: [
                                    '#000000',
                                    '#FFFFFF',
                                    '#FF0000',
                                    '#00FF00',
                                    '#0000FF',
                                    '#FFFF00',
                                    '#808080',
                                    '#800000',
                                 ],
                              },
                           ]}
                        />
                     </Form.Item>
                  </Col>
               </Row>
               <Row gutter={16} style={{ margin: 0 }}>
                  <Col span={12} style={{ paddingRight: 4, paddingLeft: 0 }}>
                     <Form.Item
                        name="capacity"
                        label="Capacity"
                        rules={[{ required: true, message: 'Please input capacity!' }]}
                     >
                        <Input size="large" type="number" placeholder="Enter capacity" />
                     </Form.Item>
                  </Col>
                  <Col span={12} style={{ padding: 0, paddingRight: 0, paddingLeft: 4 }}>
                     <Form.Item
                        name="manufacture_year"
                        label="Manufacture Year"
                        rules={[{ required: true, message: 'Please input manufacture year!' }]}
                     >
                        <Input size="large" type="number" placeholder="Enter manufacture year" />
                     </Form.Item>
                  </Col>
               </Row>
               <Row gutter={16} style={{ margin: 0 }}>
                  <Col span={12} style={{ paddingRight: 4, paddingLeft: 0 }}>
                     <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Please input model!' }]}>
                        <Input size="large" placeholder="Enter model" />
                     </Form.Item>
                  </Col>
                  <Col span={12} style={{ paddingRight: 0, paddingLeft: 4 }}>
                     <Form.Item name="brand" label="Brand" rules={[{ required: true, message: 'Please input brand!' }]}>
                        <Input size="large" placeholder="Enter brand" />
                     </Form.Item>
                  </Col>
               </Row>
               <Row gutter={16} style={{ margin: 0 }}>
                  <Col span={8} style={{ paddingRight: 4, paddingLeft: 0 }}>
                     <Form.Item
                        name="vehicle_type"
                        label="Loại xe"
                        rules={[{ required: true, message: 'Vui lòng chọn loại xe!' }]}
                     >
                        <Select
                           size="large"
                           placeholder="Chọn loại xe"
                           showSearch
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                           }
                           options={(vehicleTypes || []).map((type) => ({
                              value: type.id,
                              label: type.name,
                           }))}
                        />
                     </Form.Item>
                  </Col>
                  <Col span={8} style={{ paddingRight: 4, paddingLeft: 4 }}>
                     <Form.Item
                        name="layout"
                        label="Layout"
                        rules={[{ required: true, message: 'Vui lòng chọn layout!' }]}
                     >
                        <Select
                           size="large"
                           placeholder="Chọn layout"
                           showSearch
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                           }
                           options={(layouts || []).map((layout) => ({
                              value: layout.id,
                              label: layout.name,
                           }))}
                        />
                     </Form.Item>
                  </Col>
                  <Col span={8} style={{ paddingRight: 0, paddingLeft: 4 }}>
                     <Form.Item
                        name="office_id"
                        label="Văn phòng"
                        rules={[{ required: true, message: 'Vui lòng chọn văn phòng!' }]}
                     >
                        <Select
                           size="large"
                           placeholder="Chọn văn phòng"
                           showSearch
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                           }
                           options={(offices || []).map((office) => ({
                              value: office.id,
                              label: office.name,
                           }))}
                        />
                     </Form.Item>
                  </Col>
               </Row>
               <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: 'Please input description!' }]}
               >
                  <ReactQuill
                     theme="snow"
                     placeholder="Nhập mô tả"
                     modules={{
                        toolbar: [
                           ['bold', 'italic', 'underline'],
                           [{ list: 'ordered' }, { list: 'bullet' }],
                           ['clean'],
                        ],
                     }}
                  />
               </Form.Item>
               <Form.Item<Vehicle>
                  label="Locked"
                  name="isLocked"
                  rules={[{ required: true, message: 'Please select a status' }]}
               >
                  <Radio.Group size="large" optionType="button" buttonStyle="solid">
                     <Radio value={1}>Enable</Radio>
                     <Radio value={0}>Disable</Radio>
                  </Radio.Group>
               </Form.Item>
            </Col>
         </Row>
      </Form>
   );

   return (
      <Modal
         title={<p style={{ fontSize: '28px', fontWeight: 'bold' }}>{title}</p>}
         open={show}
         onOk={handleOk}
         onCancel={() => {
            onCancel();
         }}
         width={1200}
         centered
         destroyOnClose
      >
         <Spin spinning={loading} tip={isCreate ? 'Đang tạo...' : 'Đang cập nhật...'}>
            {content}
         </Spin>
      </Modal>
   );
}
