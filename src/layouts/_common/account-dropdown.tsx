import { App, Divider, MenuProps } from 'antd';
import Dropdown, { DropdownProps } from 'antd/es/dropdown/dropdown';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { IconButton } from '@/components/icon';
import { useLoginStateContext } from '@/pages/sys/login/providers/LoginStateProvider';
import authAPI from '@/redux/api/services/authAPI';
import { RootState } from '@/redux/stores/store';
import { useRouter } from '@/router/hooks';
import { useThemeToken } from '@/theme/hooks';

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

const defaultAvatar =
   'https://res.cloudinary.com/dkhkjaual/image/upload/c_thumb,w_200,g_face/v1730884221/3D_Fashion_Little_Boy_Avatar_xrfnct.png';

export default function AccountDropdown() {
   const { notification } = App.useApp();
   const { replace } = useRouter();
   const [fullName, setFullName] = useState<string | undefined>(undefined);
   const [email, setEmail] = useState<string | undefined>(undefined);
   const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
   const userInfo = useSelector((state: RootState) => state.user.userInfo);
   const { backToLogin } = useLoginStateContext();
   const { t } = useTranslation();
   const signOut = authAPI.logout;
   const logout = async () => {
      try {
         await signOut().then((res) => {
            if (res?.status === 200 || res?.status === 201) {
               notification.success({
                  message: 'Bạn đã đăng xuất thành công!',
                  duration: 3,
               });
               backToLogin();
               replace('/login');
            } else {
               notification.error({
                  message: `Bạn đã đăng xuất thất bại! - ERR_MESSAGE: ${res?.message}`,
                  duration: 3,
               });
            }
         });
      } catch (error) {
         notification.error({
            message: `Bạn đã đăng xuất thất bại! - ERR_CODE: ${error.message}`,
            duration: 3,
         });
      }
   };
   const { colorBgElevated, borderRadiusLG, boxShadowSecondary } = useThemeToken();

   const contentStyle: React.CSSProperties = {
      backgroundColor: colorBgElevated,
      borderRadius: borderRadiusLG,
      boxShadow: boxShadowSecondary,
   };

   const menuStyle: React.CSSProperties = {
      boxShadow: 'none',
   };

   useEffect(() => {
      setEmail(userInfo?.email);
      setProfileImage(userInfo?.profileImage);
      setFullName(userInfo?.fullName?.toString());
   }, [userInfo]);

   const dropdownRender: DropdownProps['dropdownRender'] = (menu) => (
      <div style={contentStyle}>
         <div className="flex flex-col items-start p-4">
            <div>{fullName?.toString()}</div>
            <div className="text-gray">{email?.toString()}</div>
         </div>
         <Divider style={{ margin: 0 }} />
         {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
      </div>
   );

   const items: MenuProps['items'] = [
      { label: <NavLink to={HOMEPAGE}>{t('sys.menu.dashboard.index')}</NavLink>, key: '1' },
      {
         label: <NavLink to="/information/profile">{t('sys.menu.information.profile')}</NavLink>,
         key: '2',
      },
      { type: 'divider' },
      {
         label: <button className="font-bold text-warning">{t('sys.menu.information.logout')}</button>,
         key: '3',
         onClick: logout,
      },
   ];

   return (
      <Dropdown menu={{ items }} trigger={['click']} dropdownRender={dropdownRender}>
         <IconButton className="h-10 w-10 transform-none px-0 hover:scale-105">
            <img
               className="h-8 w-8 rounded-full"
               src={!profileImage ? defaultAvatar : profileImage}
               alt={fullName?.toString() || ''}
            />
         </IconButton>
      </Dropdown>
   );
}
