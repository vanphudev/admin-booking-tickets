import { Row, Col, Typography, Form, Input, DatePicker, Select, Upload, Button, Space, message, Spin, notification } from 'antd';
import Card from '@/components/card';
import { Iconify } from '@/components/icon';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/stores/store';
import { useState, useEffect } from 'react';
import { UserInfo } from '#/entity';
import dayjs from 'dayjs';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { setUserInfo } from '@/redux/slices/userSlice';
import { getUsersById } from '@/redux/api/services/userAPI';

// interface DataType {
//    key: string;
//    avatar: string;
//    name: string;
//    date: string;
//    leader: string;
//    team: string[];
//    status: number;
// }

export default function ProfileTab() {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const userInfo = useSelector((state: RootState) => state.user.userInfo) as UserInfo;
   const AboutItems = [
      { icon: <Iconify icon="mingcute:user-4-fill" size={20} />, label: 'Họ và tên', val: userInfo.fullName },
      { icon: <Iconify icon="mingcute:phone-fill" size={20} />, label: 'Liên hệ', val: userInfo.phone },
      { icon: <Iconify icon="mingcute:mail-fill" size={20} />, label: 'Email', val: userInfo.email },
      { icon: <Iconify icon="mingcute:calendar-fill" size={20} />, label: 'Ngày sinh', val: userInfo.birthday },
      {
         icon: <Iconify icon="ph:gender-intersex-fill" size={20} />,
         label: 'Giới tính',
         val: userInfo.gender == '0' ? 'Nam' : userInfo.gender == '1' ? 'Nữ' : userInfo.gender == '-1' ? 'Khác' : '',
      },
   ];

   const [imageUrl, setImageUrl] = useState<string>('');
   const dispatch = useDispatch<AppDispatch>();

   const getBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = (error) => reject(error);
      });
   };

   const handleChange = async (info: any) => {
      try {
         if (info.file) {
            const isImage = info.file.type.startsWith('image/');
            if (!isImage) {
               notification.error({
                  message: 'Chỉ được phép tải lên file ảnh!',
                  duration: 3,
               });
               return;
            }

            const base64 = await getBase64(info.file);
            setImageUrl(base64);
            form.setFieldValue('employee_profile_image', base64);
         }
      } catch (error) {
         notification.error({
            message: 'Có lỗi xảy ra khi xử lý ảnh!',
            duration: 3,
         });
      }
   };

   const handleReset = async () => {
      form.resetFields();
   };

   const handleUpdate = async (values: any) => {
      try {
         setLoading(true);
         const data = {
            password_old: values.current_password,
            password_new: values.new_password,
            employee_id: userInfo.userId,
         };
         const res = await employeeAPI.changePassword(data);
         if (res?.status === 200 || res?.status === 201) {
            notification.success({
               message: 'Đổi mật khẩu thành công!',
               duration: 3,
            });
            await getUsersById(userInfo.userId).then((res: UserInfo) => {
               dispatch(setUserInfo(res));
            });
         }
      } catch (error) {
         notification.error({
            message: 'Đổi mật khẩu thất bại!',
            description: `Vui lòng thử lại sau. ${error?.message}`,
            duration: 3,
         });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      form.setFieldsValue({
         employee_full_name: userInfo.fullName,
         employee_email: userInfo.email,
         employee_phone: userInfo.phone,
         employee_birthday: dayjs(userInfo.birthday),
         employee_gender: userInfo.gender,
      });

      if (userInfo.profileImage) {
         setImageUrl(userInfo.profileImage);
         form.setFieldValue('employee_profile_image', userInfo.profileImage);
      }
   }, [userInfo, form]);

   return (
      <>
         <Spin spinning={loading} tip="Đang cập nhật thông tin..." size="large" className="w-full">
            <Row gutter={[16, 16]}>
               <Col span={24} md={12} lg={8}>
                  <Card className="flex-col">
                     <div className="flex w-full flex-col">
                        <Typography.Title level={5}>Thông tin cá nhân</Typography.Title>
                        <div className="mt-2 flex flex-col gap-4">
                           {AboutItems.map((item, index) =>
                              item.val ? (
                                 <div
                                    className="hover:bg-gray-50 flex items-center rounded-md p-2 transition-all"
                                    key={index}
                                 >
                                    <div className="text-primary-500 mr-3">{item.icon}</div>
                                    <div className="mr-2 font-medium">{item.label}:</div>
                                    <div className="text-gray-600">
                                       {typeof item.val === 'string' ? item.val : JSON.stringify(item.val)}
                                    </div>
                                 </div>
                              ) : null,
                           )}
                        </div>
                     </div>
                  </Card>
               </Col>
               <Col span={24} md={12} lg={16}>
                  <Card className="flex-col !items-start">
                     <Typography.Title level={5}>Đổi mật khẩu</Typography.Title>
                     <Form form={form} layout="vertical" size="large" className="w-full" onFinish={handleUpdate}>
                        <Row gutter={16}>
                           <Col span={24}>
                              <Form.Item
                                 label="Mật khẩu hiện tại"
                                 name="current_password"
                                 rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                              >
                                 <Input.Password />
                              </Form.Item>
                           </Col>
                        </Row>

                        <Row gutter={16}>
                           <Col span={24}>
                              <Form.Item
                                 label="Mật khẩu mới"
                                 name="new_password"
                                 rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                                 ]}
                              >
                                 <Input.Password />
                              </Form.Item>
                           </Col>
                        </Row>

                        <Row gutter={16}>
                           <Col span={24}>
                              <Form.Item
                                 label="Xác nhận mật khẩu mới"
                                 name="confirm_password"
                                 dependencies={['new_password']}
                                 rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                    ({ getFieldValue }) => ({
                                       validator(_, value) {
                                          if (!value || getFieldValue('new_password') === value) {
                                             return Promise.resolve();
                                          }
                                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                       },
                                    }),
                                 ]}
                              >
                                 <Input.Password />
                              </Form.Item>
                           </Col>
                        </Row>

                        <Form.Item>
                           <Space>
                              <Button type="primary" htmlType="submit" >
                                 Cập nhật mật khẩu
                              </Button>
                              <Button onClick={handleReset}>Đặt lại</Button>
                           </Space>
                        </Form.Item>
                     </Form>
                  </Card>
               </Col>
            </Row>
         </Spin>
      </>
   );
}

const styles = `
.avatar-uploader .ant-upload {
   width: 128px !important;
   height: 128px !important;
   background-color: #fafafa;
   border: 1px dashed #d9d9d9;
   border-radius: 8px;
   cursor: pointer;
   transition: border-color 0.3s;
}

.avatar-uploader .ant-upload:hover {
   border-color: #FF3030;
}
`;

if (typeof document !== 'undefined') {
   const styleSheet = document.createElement('style');
   styleSheet.innerText = styles;
   document.head.appendChild(styleSheet);
}
