import { Employee } from './entity';
import type { RcFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Upload, Spin, Row, Col, Select, DatePicker } from 'antd';
import { Iconify } from '@/components/icon';

import employeeAPI from '@/redux/api/services/employeeAPI';
import employeeTypeAPI from '@/redux/api/services/employeeTypeAPI';
import officeAPI from '@/redux/api/services/officeAPI';

import dayjs from 'dayjs';
import MapModal from '@/components/GoogleMapIframe/GoogleMaps';

const styles = `
   .employee-modal-avatar-uploader .ant-upload {
      width: 300px !important;
      height: 300px !important;
      background-color: #fafafa;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s;
   }

   .employee-modal-avatar-uploader .ant-upload:hover {
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

export type EmployeeModalProps = {
   formValue: Employee;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

export function EmployeeModal({ formValue, title, show, onOk, onCancel, isCreate }: EmployeeModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [imageBase64, setImageBase64] = useState<string>('');
   const [loading, setLoading] = useState(false);
   const [listOffice, setListOffice] = useState<any[]>([]);
   const [listEmployeeType, setListEmployeeType] = useState<any[]>([]);

   useEffect(() => {
      const fetchOffices = async () => {
         try {
            const response = await officeAPI.getOffices();
            console.log('Office response:', response);

            if (Array.isArray(response)) {
               setListOffice(response);
            }
         } catch (error) {
            console.error('Error fetching offices:', error);
            notification.error({
               message: 'Lỗi',
               description: 'Không thể tải danh sách văn phòng',
               icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
            });
         }
      };

      fetchOffices();
   }, []);

   useEffect(() => {
      const fetchEmployeeTypes = async () => {
         try {
            const response = await employeeTypeAPI.getEmployeeTypes();

            if (Array.isArray(response)) {
               setListEmployeeType(response);
            }
         } catch (error) {
            console.error('Error fetching employee types:', error);
            notification.error({
               message: 'Lỗi',
               description: 'Không thể tải danh sách loại nhân viên',
               icon: <Iconify icon="mingcute:alert-fill" style={{ color: '#ff4d4f' }} />,
            });
         }
      };

      fetchEmployeeTypes();
   }, []);

   useEffect(() => {
      if (show && formValue) {
         form.setFieldsValue({
            ...formValue,
            employee_type_id: formValue.employee_type?.employee_type_id,
            office_id: formValue.office?.office_id,
            employee_birthday: formValue.employee_birthday ? dayjs(formValue.employee_birthday) : null,
         });
         if (formValue.employee_profile_image) {
            setImageBase64(formValue.employee_profile_image);
         } else {
            setImageBase64('');
         }
      }
   }, [show, formValue, form, notification]);

   const handleOk = async () => {
      form.validateFields().then(async (formData) => {
         console.log('formValue', formValue);
         const data = {
            employee_id: formValue?.employee_id,
            employee_full_name: formData.employee_full_name,
            employee_email: formData.employee_email,
            employee_phone: formData.employee_phone,
            employee_username: formData.employee_username,
            employee_birthday: dayjs(formData.employee_birthday).format('YYYY-MM-DD'),
            employee_gender: formData.employee_gender,
            employee_profile_image: imageBase64,
            office_id: formData.office_id,
            employee_type_id: formData.employee_type_id,
            is_locked: formData.is_locked,
         };
         setLoading(true);
         if (isCreate) {
            await employeeAPI
               .createEmployee(data)
               .then((res: any) => {
                  if (res && (res.status === 201 || res.status === 200)) {
                     notification.success({
                        message: 'Thành công',
                        description: <span>Tạo nhân viên thành công!</span>,
                        duration: 3,
                     });
                     onOk();
                  }
                  if (res.status !== 200 && res.status !== 201) {
                     setLoading(false);
                     notification.error({
                        message: 'Thất bại',
                        description: <p style={{ margin: '8px 0' }}>ERROR: {res.message}</p>,
                        duration: 3,
                     });
                  }
               })
               .catch((error: any) => {
                  setLoading(false);
                  notification.error({
                     message: 'Thất bại',
                     description: <p style={{ margin: '8px 0' }}>ERROR: {error.message}</p>,
                     duration: 3,
                  });
               })
               .finally(() => {
                  setLoading(false);
               });
         } else {
            await employeeAPI
               .updateEmployee(data)
               .then((res: any) => {
                  if (res && res.status === 200) {
                     notification.success({
                        message: 'Thành công',
                        description: <span>Cập nhật nhân viên thành công!</span>,
                        duration: 3,
                     });
                     onOk();
                  }
                  if (res.status !== 200 && res.status !== 201) {
                     setLoading(false);
                     notification.error({
                        message: (
                           <span
                              style={{
                                 fontWeight: 600,
                                 fontSize: '16px',
                              }}
                           >
                              Cập nhật nhân viên thất bại!
                           </span>
                        ),
                        description: <p style={{ margin: '8px 0' }}>ERROR: {res.message}</p>,
                        duration: 3,
                     });
                  }
               })
               .catch((error: any) => {
                  setLoading(false);
                  notification.error({
                     message: (
                        <span
                           style={{
                              fontWeight: 600,
                              fontSize: '16px',
                           }}
                        >
                           Cập nhật nhân viên thất bại!
                        </span>
                     ),
                     description: <p style={{ margin: '8px 0' }}>ERROR: {error.message}</p>,
                     duration: 3,
                  });
               })
               .finally(() => {
                  setLoading(false);
               });
         }
      });
   };

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
      } catch (error) {
         notification.error({ message: 'Lỗi khi tải ảnh!' });
      }
   };

   const content = (
      <Form<Employee> initialValues={formValue} form={form} layout="vertical">
         <Row gutter={[24, 24]}>
            <Col span={8}>
               <Form.Item
                  label="Ảnh đại diện"
                  name="employee_profile_image"
                  rules={[{ required: true, message: 'Vui lòng tải lên ảnh đại diện!' }]}
               >
                  <Upload
                     listType="picture-card"
                     maxCount={1}
                     showUploadList={false}
                     beforeUpload={() => false}
                     onChange={handleUpload}
                     className="employee-modal-avatar-uploader"
                  >
                     {imageBase64 ? (
                        <img
                           src={imageBase64}
                           alt="avatar"
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                     ) : (
                        <div style={{ textAlign: 'center' }}>
                           <Iconify icon="solar:upload-minimalistic-bold" size={24} />
                           <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </div>
                     )}
                  </Upload>
               </Form.Item>
            </Col>
            <Col span={16}>
               <Row gutter={[16, 16]}>
                  <Col span={12}>
                     <Form.Item
                        label="Họ và tên"
                        name="employee_full_name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                     >
                        <Input size="large" />
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Email"
                        name="employee_email"
                        rules={[
                           { required: true, message: 'Vui lòng nhập email!' },
                           { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                     >
                        <Input size="large" />
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Số điện thoại"
                        name="employee_phone"
                        rules={[
                           { required: true, message: 'Vui lòng nhập số điện thoại!' },
                           { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' },
                        ]}
                     >
                        <Input size="large" />
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Tên đăng nhập"
                        name="employee_username"
                        rules={[
                           { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                           { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập không được chứa ký tự đặc biệt!' },
                        ]}
                     >
                        <Input size="large" />
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Ngày sinh"
                        name="employee_birthday"
                        rules={[
                           { required: true, message: 'Vui lòng chọn ngày sinh!' },
                           {
                              validator: (_, value) => {
                                 if (!value) return Promise.resolve();
                                 const selectedDate = dayjs(value);
                                 const today = dayjs();
                                 const age = today.diff(selectedDate, 'year');

                                 if (selectedDate.isAfter(today)) {
                                    return Promise.reject(new Error('Ngày sinh không thể lớn hơn ngày hiện tại!'));
                                 }

                                 if (age < 18) {
                                    return Promise.reject(new Error('Người dùng phải trên 18 tuổi!'));
                                 }

                                 return Promise.resolve();
                              },
                           },
                        ]}
                     >
                        <DatePicker
                           size="large"
                           style={{ width: '100%' }}
                           format="DD/MM/YYYY"
                           placeholder="Chọn ngày sinh"
                           disabledDate={(current) => {
                              return current && current >= dayjs().endOf('day');
                           }}
                        />
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Giới tính"
                        name="employee_gender"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                     >
                        <Select size="large" placeholder="Chọn giới tính">
                           <Select.Option value={1}>Nam</Select.Option>
                           <Select.Option value={0}>Nữ</Select.Option>
                           <Select.Option value={-1}>Khác</Select.Option>
                        </Select>
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Loại nhân viên"
                        name="employee_type_id"
                        rules={[{ required: true, message: 'Vui lòng chọn loại nhân viên!' }]}
                     >
                        <Select size="large" placeholder="Chọn loại nhân viên">
                           {listEmployeeType?.map((type) => (
                              <Select.Option key={type.employee_type_id} value={type.employee_type_id}>
                                 {type.employee_type_name}
                              </Select.Option>
                           ))}
                        </Select>
                     </Form.Item>
                  </Col>
                  <Col span={12}>
                     <Form.Item
                        label="Văn phòng"
                        name="office_id"
                        rules={[{ required: true, message: 'Vui lòng chọn văn phòng!' }]}
                     >
                        <Select size="large" placeholder="Chọn văn phòng">
                           {listOffice?.map((office) => (
                              <Select.Option key={office.office_id} value={office.office_id}>
                                 {office.office_name}
                              </Select.Option>
                           ))}
                        </Select>
                     </Form.Item>
                  </Col>
               </Row>
            </Col>
         </Row>
      </Form>
   );

   return (
      <>
         <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} destroyOnClose width="60%" centered>
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
