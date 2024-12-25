import { CSSProperties, useState } from 'react';

// import CoverImage from '@/assets/images/cover/cover_4.jpg';
import Card from '@/components/card';
import { Iconify } from '@/components/icon';
import { useThemeToken } from '@/theme/hooks';

import ProfileTab from './profile-tab';
import ResetPassword from './reset';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/stores/store';

function UserProfile() {
   const userInfo = useSelector((state: RootState) => state.user.userInfo);
   const { colorTextBase } = useThemeToken();
   const [currentTabIndex, setcurrentTabIndex] = useState(0);

   const bgStyle: CSSProperties = {
      background: `linear-gradient(rgba(0, 75, 80, 0.8), rgba(0, 75, 80, 0.8)), url(https://cdn.futabus.vn/futa-busline-web-cms-prod/web_ca16250b69/web_ca16250b69.png)`,
      backgroundPosition: 'center',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
   };

   const tabs = [
      {
         icon: <Iconify icon="solar:user-id-bold" size={24} className="mr-2" />,
         title: 'Profile Information',
         content: <ProfileTab />,
      },
      {
         icon: <Iconify icon="mingcute:profile-fill" size={24} className="mr-2" />,
         title: 'Reset Password',
         content: <ResetPassword />,
      },
   ];

   return (
      <>
         <Card className="relative mb-6 h-[290px] flex-col rounded-2xl !p-0">
            <div style={bgStyle} className="h-full w-full">
               <div className="flex flex-col items-center justify-center pt-12 md:absolute md:bottom-6 md:left-6 md:flex-row md:pt-0">
                  <div className="h-16 w-16 overflow-hidden rounded-full md:h-32 md:w-32">
                     <img src={userInfo?.profileImage ?? ''} className="h-full w-full object-cover" alt="Profile" />
                  </div>
                  <div className="ml-6 mt-6 flex flex-col justify-center md:mt-0" style={{ color: '#fff' }}>
                     <span className="mb-2 text-2xl font-medium">Nhân viên - {String(userInfo?.fullName ?? '')}</span>
                     <span className="text-center opacity-50 md:text-left">
                        User account - {String(userInfo?.username ?? '')}
                     </span>
                  </div>
               </div>
            </div>
            <div className="z-10 min-h-[48px] w-full">
               <div className="mx-6 flex h-full justify-center md:justify-end">
                  {tabs?.map((tab, index) => (
                     <button
                        onClick={() => setcurrentTabIndex(index)}
                        key={tab.title}
                        type="button"
                        style={{
                           marginRight: index >= tabs.length - 1 ? '0px' : '40px',
                           opacity: index === currentTabIndex ? 1 : 0.5,
                           borderBottom: index === currentTabIndex ? `2px solid ${colorTextBase}` : '',
                        }}
                     >
                        {tab.icon}
                        {tab.title}
                     </button>
                  ))}
               </div>
            </div>
         </Card>
         <div>{tabs[currentTabIndex].content}</div>
      </>
   );
}

export default UserProfile;
