import { NavLink } from 'react-router-dom';
import LogoHome from '@/assets/images/logo.svg';

interface Props {
  size?: number | string;
}
function Logo({ size = 50 }: Props) {
  return (
    <NavLink to="/">
      <img src={LogoHome} alt="logo" width={size} height={size} />
    </NavLink>
  );
}

export default Logo;
