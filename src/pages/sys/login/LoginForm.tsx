import { Alert, App, Button, Checkbox, Col, Divider, Form, Input, Row } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LogoHome from '@/assets/images/background/logo-futa.png';
import authAPI, { SignInReq } from '@/redux/api/services/authAPI';
import { useRouter } from '@/router/hooks';

import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';
import Iconify from '@/components/icon/iconify-icon';

function LoginForm() {
   const { t } = useTranslation();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const { replace } = useRouter();
   const { loginState, setLoginState } = useLoginStateContext();
   const signIn = authAPI.signin;
   if (loginState !== LoginStateEnum.LOGIN) return null;
   const handleFinish = async ({ username, password }: SignInReq) => {
      setLoading(true);
      try {
         await signIn({ username, password })
            .then((res) => {
               if (res?.status === 201) {
                  notification.success({
                     message: 'Đăng nhập thành công!',
                     duration: 3,
                  });
                  replace('/');
               }
            })
            .catch((error) => {
               notification.error({
                  message: `Đăng nhập thất bại! - ERR_CODE: ${error.message}`,
                  duration: 3,
               });
            });
      } finally {
         setLoading(false);
      }
   };
   return (
      <>
         <div className="mb-10 flex items-center justify-center text-2xl font-bold xl:text-3xl">
            <img src={LogoHome} alt="logo" width={400} />
         </div>
         <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div>
         <div className="mb-10">
            <Alert
               message="Thông tin đăng nhập"
               description={
                  <div>
                     <p>
                        <strong>Tài khoản: </strong>
                        <span onClick={() => {
                           navigator.clipboard.writeText('adminsystems');
                           notification.success({
                              message: 'Đã sao chép tài khoản vào clipboard',
                              duration: 2
                           });
                        }} style={{cursor: 'pointer'}}>
                           adminsystems
                        </span>
                        <Iconify 
                           icon="eva:copy-fill" 
                           size={16} 
                           style={{marginLeft: 8, cursor: 'pointer'}}
                           onClick={() => {
                              navigator.clipboard.writeText('adminsystems');
                              notification.success({
                                 message: 'Đã sao chép tài khoản vào clipboard',
                                 duration: 2
                              });
                           }}
                        />
                     </p>
                     <p>
                        <strong>Mật khẩu: </strong>
                        <span onClick={() => {
                           navigator.clipboard.writeText('Pass@123456');
                           notification.success({
                              message: 'Đã sao chép mật khẩu vào clipboard', 
                              duration: 2
                           });
                        }} style={{cursor: 'pointer'}}>
                           Pass@123456
                        </span>
                        <Iconify
                           icon="eva:copy-fill"
                           size={16}
                           style={{marginLeft: 8, cursor: 'pointer'}} 
                           onClick={() => {
                              navigator.clipboard.writeText('Pass@123456');
                              notification.success({
                                 message: 'Đã sao chép mật khẩu vào clipboard',
                                 duration: 2
                              });
                           }}
                        />
                     </p>
                  </div>
               }
               type="info" 
               showIcon
               className="mb-10"
            />
         </div>
         <Form name="login" size="large" onFinish={handleFinish}>
            <Form.Item
               name="username"
               rules={[
                  { required: true, message: t('sys.login.accountPlaceholder') },
                  { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự' },
                  { max: 20, message: 'Tên đăng nhập không được vượt quá 20 ký tự' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới' },
               ]}
            >
               <Input placeholder={t('sys.login.userName')} />
            </Form.Item>
            <Form.Item
               name="password"
               rules={[
                  { required: true, message: t('sys.login.passwordPlaceholder') },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                  { max: 32, message: 'Mật khẩu không được vượt quá 32 ký tự' },
                  {
                     pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/,
                     message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
                  },
               ]}
            >
               <Input.Password type="password" placeholder={t('sys.login.password')} />
            </Form.Item>
            <Form.Item>
               <Row align="middle">
                  <Col span={12}></Col>
                  <Col span={12} className="text-right">
                     <Button
                        type="link"
                        className="!underline"
                        onClick={() => setLoginState(LoginStateEnum.QR_CODE)}
                        size="small"
                     >
                        {t('sys.login.forgetPassword')}
                     </Button>
                  </Col>
               </Row>
            </Form.Item>
            <Form.Item>
               <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                  {t('sys.login.loginButton')}
               </Button>
            </Form.Item>
            <Divider className="!text-xs">{t('sys.login.otherSignIn')}</Divider>
            <Row align="middle" gutter={8}>
               <Col flex="1">
                  <Button className="w-full !text-sm" onClick={() => setLoginState(LoginStateEnum.REGISTER)}>
                     {t('sys.login.mobileSignInFormTitle')}
                  </Button>
               </Col>
            </Row>
         </Form>
      </>
   );
}

export default LoginForm;
